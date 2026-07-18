import type { StoryBlock, StoryCard, ContextSnapshot } from '../store/engineStore'
import { getActiveStoryCards, estimateTokens, getRetainedHistory } from './contextScanner'

export interface GeminiGenerateOptions {
  apiKey: string
  model: string
  maxTokens: number
  systemInstructions: string
  authorsNote: string
  plotEssentials: string
  storyCards: StoryCard[]
  history: StoryBlock[]
  maxResponseLength: number
  temperature: number
  topP: number
  topK: number
  repetitionPenalty: number
  frequencyPenalty: number
  presencePenalty: number
  minP: number
  topA: number
  onUpdate: (text: string) => void
  onComplete: (snapshot?: ContextSnapshot) => void
  onError: (err: Error) => void
}

export const generateGeminiResponse = async (options: GeminiGenerateOptions) => {
  const {
    apiKey, model, maxTokens, systemInstructions, authorsNote, plotEssentials,
    storyCards, history, maxResponseLength, temperature, topP, topK,
    onUpdate, onComplete, onError
  } = options

  try {
    const instructionTokens = estimateTokens(systemInstructions)
    const essentialTokens = estimateTokens(plotEssentials)
    const authorNoteTokens = estimateTokens(authorsNote)

    let storyCardTokens = 0
    let storyCardsText = ''
    const activeCards = getActiveStoryCards(history, storyCards, 2000)
    activeCards.forEach(card => {
      const text = `${card.title} (${card.category}): ${card.content}\n`
      storyCardsText += text
      storyCardTokens += estimateTokens(text)
    })

    const systemPrompt = `${systemInstructions}\n\n[PLOT ESSENTIALS]\n${plotEssentials}\n\n[STORY CARDS]\n${storyCardsText}\n${authorsNote}`
    const systemTokens = estimateTokens(systemPrompt)

    const availableHistoryTokens = maxTokens - systemTokens - 500
    const { retainedHistory, usedTokens: currentHistoryTokens } = getRetainedHistory(history, availableHistoryTokens)

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
    retainedHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      })
    })

    // gemini is extremely picky: it requires alternating user/model roles and ALWAYS starts with user
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.unshift({ role: 'user', parts: [{ text: 'Begin.' }] })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: maxResponseLength > 0 ? maxResponseLength : undefined,
            temperature,
            topP,
            topK: topK > 0 ? topK : undefined,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`)
    }
    if (!response.body) throw new Error('No response body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let done = false
    let generatedTextLength = 0
    let buffer = ''

    while (!done) {
      const { value, done: readerDone } = await reader.read()
      done = readerDone
      if (value) {
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ') && line.length > 6) {
            try {
              const dataStr = line.slice(6)
              if (dataStr.trim() === '') continue
              const data = JSON.parse(dataStr)

              if (data.promptFeedback?.blockReason) {
                console.warn('BLOCKED BY SAFETY FILTER:', data.promptFeedback.blockReason)
              }

              const candidate = data.candidates?.[0]
              if (candidate?.finishReason) {
                console.log('Gemini Stop Reason:', candidate.finishReason)
              }

              const parts = candidate?.content?.parts
              if (parts?.length > 0 && parts[0].text) {
                generatedTextLength += parts[0].text.length
                onUpdate(parts[0].text)
              }
            } catch (e) {
              // probably just a partial chunk, safely ignore
            }
          }
        }
      }
    }

    onComplete({
      adventureTokens: currentHistoryTokens,
      memoryTokens: 0,
      essentialTokens,
      authorNoteTokens,
      storyCardTokens,
      instructionTokens,
      responseTokens: estimateTokens('a'.repeat(generatedTextLength)),
      maxTokens
    })

  } catch (err: unknown) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}

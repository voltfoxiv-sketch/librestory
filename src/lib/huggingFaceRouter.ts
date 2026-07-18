import { getActiveStoryCards, estimateTokens, getRetainedHistory } from './contextScanner'
import type { GenerateOptions } from './openRouter'

export const generateHfResponse = async (options: GenerateOptions) => {
  const {
    apiKey, model, maxTokens, systemInstructions, authorsNote, plotEssentials,
    storyCards, history, maxResponseLength, temperature, topP, repetitionPenalty,
    frequencyPenalty, presencePenalty,
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

    const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [{ role: 'system', content: systemPrompt }]
    retainedHistory.forEach(msg => {
      apiMessages.push({ role: msg.role === 'ai' ? 'assistant' : 'user', content: msg.text })
    })

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        stream: true,
        max_tokens: maxResponseLength > 0 ? maxResponseLength : undefined,
        temperature,
        top_p: topP,
        repetition_penalty: repetitionPenalty !== 1.0 ? repetitionPenalty : undefined,
        frequency_penalty: frequencyPenalty !== 0.0 ? frequencyPenalty : undefined,
        presence_penalty: presencePenalty !== 0.0 ? presencePenalty : undefined,
      })
    })

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${await response.text()}`)
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
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6))
              const content = data.choices[0]?.delta?.content
              if (content) {
                generatedTextLength += content.length
                onUpdate(content)
              }
            } catch (e) {
              // silently drop malformed or partial chunks
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

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useEngineStore, type ContextSnapshot } from '../../store/engineStore'
import { Send, RotateCcw, XCircle, Play, MessageSquare, Hand, BookOpen } from 'lucide-react'
import { generateResponse } from '../../lib/openRouter'
import { generateGeminiResponse } from '../../lib/geminiRouter'
import { generateHfResponse } from '../../lib/huggingFaceRouter'
import { generateLocalResponse } from '../../lib/localRouter'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

// cheap hack to convert 1st person inputs to 2nd person for 'Do' mode
const convertToSecondPerson = (text: string) => {
  const map: Record<string, string> = {
    'i': 'you', 'me': 'you', 'my': 'your', 'mine': 'yours', 'myself': 'yourself',
    'am': 'are', 'we': 'you', 'us': 'you', 'our': 'your', 'ours': 'yours', 'ourselves': 'yourselves'
  }

  let converted = text.replace(/\b(I|me|my|mine|myself|am|we|us|our|ours|ourselves)\b/gi, (match) => {
    const replacement = map[match.toLowerCase()]
    return match[0] === match[0].toUpperCase()
      ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
      : replacement
  })

  if (converted.length > 0) {
    converted = converted.charAt(0).toUpperCase() + converted.slice(1)
  }

  return converted
}

const sanitizeError = (msg: string, keys: string[]) => {
  let safe = msg
  for (const key of keys) {
    if (key && key.trim().length > 0) {
      safe = safe.split(key).join('********')
    }
  }
  return safe
}

export default function ActionDeck() {
  const [inputText, setInputText] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [inputModeType, setInputModeType] = useState<'do' | 'say' | 'story'>('do')
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const {
    storyBlocks, addStoryBlock, setGenerating, isGenerating, isInputMode, setInputMode, updateLastStoryBlock,
    removeLastStoryBlock, eraseLastTurn, setConfigNeedsAttention, setIsSettingsOpen, forceSave,
    openRouterKey, geminiKey, hfKey, localEndpoint, activeProvider, activeModel, maxContextTokens,
    aiInstructions, authorsNote, plotEssentials, storyCards, maxResponseLength, temperature,
    topP, topK, repetitionPenalty, frequencyPenalty, presencePenalty, minP, topA,
    addTerminalLog, baseTheme
  } = useEngineStore()

  // auto-grow the textarea as they type
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [inputText, isInputMode])

  const hasAutoStarted = useRef(false)

  useEffect(() => {
    if (isInputMode && textAreaRef.current) {
      textAreaRef.current.focus({ preventScroll: true })
    }
  }, [isInputMode])

  // kick off the generation automatically on the very first turn of a new adventure
  useEffect(() => {
    if (
      !hasAutoStarted.current &&
      storyBlocks.length === 2 &&
      storyBlocks[1].role === 'user' &&
      storyBlocks[1].text === 'Start the adventure' &&
      !isGenerating
    ) {
      hasAutoStarted.current = true
      fireGeneration()
    }
  }, [storyBlocks.length, isGenerating])

  const handleTakeTurn = () => {
    setInputMode(true)
    setLocalError(null)
    setConfigNeedsAttention(false)
  }

  const fireGeneration = () => {
    if (
      (activeProvider === 'openrouter' && !openRouterKey) ||
      (activeProvider === 'gemini' && !geminiKey) ||
      (activeProvider === 'huggingface' && !hfKey)
    ) {
      setLocalError('Please enter a valid API Key in the Global Config menu.')
      setConfigNeedsAttention(true)
      return
    }

    setGenerating(true)
    addTerminalLog(`Initiating generation with ${activeProvider} (${activeModel})...`, 'info')
    addStoryBlock({ role: 'ai', text: '' })

    const generateOptions = {
      apiKey: activeProvider === 'openrouter' ? openRouterKey :
              activeProvider === 'gemini' ? geminiKey :
              activeProvider === 'huggingface' ? hfKey : '',
      model: activeModel,
      maxTokens: maxContextTokens,
      systemInstructions: aiInstructions,
      authorsNote,
      plotEssentials,
      storyCards,
      history: useEngineStore.getState().storyBlocks.slice(0, -1),
      maxResponseLength,
      temperature, topP, topK,
      repetitionPenalty, frequencyPenalty, presencePenalty, minP, topA,
      onUpdate: (text: string) => {
        updateLastStoryBlock(text)
      },
      onComplete: (snapshot?: ContextSnapshot) => {
        const storeState = useEngineStore.getState()
        const lastBlock = storeState.storyBlocks.slice(-1)[0]
        let finalText = lastBlock.text
        const trimmed = finalText.trimEnd()

        if (trimmed.length > 0) {
          const normalized = finalText.replace(/```/g, '').replace(/Section \d+:?/gi, '').trim()

          const match = normalized.match(/backend\s*\n([\s\S]*?)\n\s*story\s*\n([\s\S]*)/i)
          if (match) {
            const backendPart = match[1].trim()
            if (backendPart && backendPart.toLowerCase() !== 'none') {
              storeState.applyBackendState(backendPart)
            }
          } else {
            if (normalized.match(/backend\s*\n/i) && !normalized.match(/story\s*\n/i)) {
              const backendPart = normalized.replace(/backend\s*\n/i, '').trim()
              if (backendPart && backendPart.toLowerCase() !== 'none') {
                storeState.applyBackendState(backendPart)
              }
            }
          }

          // trim cut-off sentences
          const lastChar = finalText[finalText.length - 1]
          if (lastChar && !['.', '!', '?', '"', '\u201D', '\u2019'].includes(lastChar)) {
            const lastPuncIndex = Math.max(
              finalText.lastIndexOf('.'),
              finalText.lastIndexOf('!'),
              finalText.lastIndexOf('?'),
              finalText.lastIndexOf('"'),
              finalText.lastIndexOf('\u201D')
            )
            if (lastPuncIndex !== -1 && lastPuncIndex < finalText.length - 1) {
              finalText = finalText.substring(0, lastPuncIndex + 1)
            }
          }

          if (finalText !== lastBlock.text) {
            storeState.updateStoryBlock(lastBlock.id, finalText)
          }
        }

        if (snapshot) storeState.attachSnapshotToLastBlock(snapshot)
        setGenerating(false)
        addTerminalLog('Generation completed successfully.', 'success')
        forceSave()
      },
      onError: (err: Error) => {
        const safeMsg = sanitizeError(err.message, [openRouterKey, geminiKey, hfKey])
        setLocalError(safeMsg)
        updateLastStoryBlock('\n\n[SYSTEM ERROR: ' + safeMsg + ']')
        setGenerating(false)
        addTerminalLog(`Generation failed: ${safeMsg}`, 'error')
        forceSave()
      }
    }

    if (activeProvider === 'gemini') generateGeminiResponse(generateOptions)
    else if (activeProvider === 'huggingface') generateHfResponse(generateOptions)
    else if (activeProvider === 'local') generateLocalResponse({ ...generateOptions, localEndpoint })
    else generateResponse(generateOptions)
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputText.trim()) return

    let finalText = inputText.trim()
    let finalRole: 'user' | 'ai' = 'user'

    if (inputModeType === 'say') {
      finalText = `You say, "${finalText}"`
    } else if (inputModeType === 'do') {
      finalText = convertToSecondPerson(finalText)
      if (!finalText.toLowerCase().startsWith('you ') && !finalText.toLowerCase().startsWith('your ')) {
        finalText = `You ${finalText.charAt(0).toLowerCase()}${finalText.slice(1)}`
      }
    } else if (inputModeType === 'story') {
      finalRole = 'ai'
    }

    addStoryBlock({ role: finalRole, text: finalText })
    setInputText('')
    setInputMode(false)
    fireGeneration()
  }

  const MODE_BUTTONS = [
    { m: 'do', i: Hand, l: 'Do' },
    { m: 'say', i: MessageSquare, l: 'Say' },
    { m: 'story', i: BookOpen, l: 'Story' }
  ]

  const ACTION_BUTTONS = [
    { a: fireGeneration,                    i: Play,     l: 'Continue', c: 'bg-white/5 border-white/20 border-t-white/40 text-white hover:bg-white/10 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]' },
    { a: () => { removeLastStoryBlock(); fireGeneration() }, i: RotateCcw, l: 'Retry',    c: 'bg-white/5 border-white/20 border-t-white/40 text-white hover:bg-white/10 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]' },
    { a: eraseLastTurn,                     i: XCircle,  l: 'Erase',    c: 'bg-red-500/10 border-red-500/30 border-t-red-500/60 text-red-100 hover:bg-red-500/20 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' },
  ]

  return (
    <div className="w-full">
      <div className="w-full bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] p-3 relative">

        {typeof document !== 'undefined' && createPortal(
          <div style={{ pointerEvents: 'none' }} className="fixed inset-0 z-[9999]">
            <AnimatePresence>
              {localError && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-6 left-6 flex items-center gap-3 bg-red-950/80 border border-red-500/30 text-red-200 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md max-w-sm pointer-events-auto"
                >
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-bold tracking-wide leading-relaxed">{localError}</div>
                    <button
                      onClick={() => {
                        setLocalError(null)
                        setConfigNeedsAttention(false)
                        setIsSettingsOpen(true)
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors border border-white/20 w-max"
                    >
                      Take me there!
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setLocalError(null)
                      setConfigNeedsAttention(false)
                    }}
                    className="p-1 hover:bg-red-500/20 rounded-md transition-colors ml-2 shrink-0 self-start"
                  >
                    <XCircle className="w-4 h-4 text-red-400" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body
        )}

        {isInputMode ? (
          <form
            onSubmit={handleSubmit}
            className={clsx(
              'flex flex-col gap-2 p-2 rounded-xl transition-all border',
              baseTheme === 'legacy'
                ? 'bg-black/40 border-black/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)] focus-within:shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(255,159,67,0.2)] focus-within:border-[var(--accent-color,#FF9F43)]/50'
                : 'bg-black/20 border-transparent focus-within:shadow-[0_0_15px_rgba(255,159,67,0.15)] focus-within:border-[var(--accent-color,#FF9F43)]/50'
            )}
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={textAreaRef}
                className="w-full bg-transparent text-[#e2e8f0] placeholder-gray-600/80 resize-none outline-none py-2 px-4 text-base max-h-[40vh] overflow-y-auto"
                rows={2}
                placeholder={
                  inputModeType === 'do' ? "What do you do? (e.g. 'I open the door')" :
                  inputModeType === 'say' ? "What do you say? (e.g. 'Who goes there?')" :
                  'Continue the story...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
              <div className="flex flex-col gap-2 shrink-0 pr-1 pb-1">
                <button
                  type="button"
                  onClick={() => setInputMode(false)}
                  className="p-2.5 text-gray-500 hover:text-white transition-all rounded-lg hover:bg-white/10 hover:scale-110"
                  title="Cancel"
                >
                  <XCircle className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim() || isGenerating}
                  className="p-2.5 text-[var(--accent-color,#FF9F43)] hover:text-white transition-all rounded-lg hover:bg-[var(--accent-color,#FF9F43)]/20 disabled:opacity-50 shadow-[0_0_15px_rgba(255,159,67,0.15)] hover:shadow-[0_0_20px_rgba(255,159,67,0.3)] hover:scale-110"
                  title="Send"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-1 ml-2 mb-1">
              {MODE_BUTTONS.map(x => (
                <button
                  key={x.m}
                  type="button"
                  onClick={() => setInputModeType(x.m as any)}
                  className={clsx(
                    'px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md transition-all flex items-center gap-1.5',
                    inputModeType === x.m ? 'bg-[var(--accent-color,#FF9F43)] text-black' : 'text-gray-500 hover:bg-white/10'
                  )}
                >
                  <x.i className="w-3 h-3" /> {x.l}
                </button>
              ))}
            </div>
          </form>
        ) : (
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleTakeTurn}
              disabled={isGenerating}
              className={clsx(
                'group flex-1 max-w-[240px] py-4 bg-[var(--accent-color,#FF9F43)]/20 backdrop-blur-md',
                'border border-[var(--accent-color,#FF9F43)]/50 text-white font-bold uppercase text-[11px]',
                'transition-all disabled:opacity-50 flex items-center justify-center gap-2',
                'shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5',
                'hover:bg-[var(--accent-color,#FF9F43)]/30 hover:border-[var(--accent-color,#FF9F43)]',
                baseTheme === 'legacy'
                  ? 'rounded-[10px] tracking-[0.12em] hover:shadow-[0_0_25px_rgba(255,159,67,0.4)]'
                  : 'rounded-2xl tracking-[0.2em] border-t-[var(--accent-color,#FF9F43)] hover:shadow-[0_0_25px_rgba(255,159,67,0.4)]'
              )}
            >
              Take A Turn
            </button>
            {ACTION_BUTTONS.map(x => (
              <button
                key={x.l}
                onClick={x.a}
                disabled={isGenerating}
                className={clsx(
                  'flex-1 max-w-[160px] py-4 backdrop-blur-md font-bold uppercase text-[11px]',
                  'transition-all disabled:opacity-50 flex items-center justify-center gap-2',
                  'shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:-translate-y-0.5',
                  baseTheme === 'legacy' && x.l === 'Erase'
                    ? 'bor-erase rounded-[8px] bg-[rgba(239,68,68,0.15)] border border-red-500/30 text-red-400 tracking-[0.1em] hover:bg-[rgba(239,68,68,0.25)]'
                    : baseTheme === 'legacy'
                    ? `rounded-[8px] tracking-[0.1em] border ${x.c}`
                    : `rounded-2xl tracking-[0.15em] border ${x.c}`
                )}
              >
                <x.i className="w-4 h-4" /> {x.l}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

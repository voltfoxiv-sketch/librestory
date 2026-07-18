import { useEffect, useRef, useState } from 'react'
import { useEngineStore } from '../../store/engineStore'
import type { ContextSnapshot } from '../../store/engineStore'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Eye, X } from 'lucide-react'
import ViewContextModal from './ViewContextModal'
import ActionDeck from './ActionDeck'
import { TrafficLightControls } from './TrafficLightControls'
import React from 'react'

// dead simple entity highlighting for now, don't overcomplicate it
const HIGHLIGHT_TERMS = ['Syntagma Square', 'Amelia', 'Suez Canal Authority', 'hover-drone']
const HIGHLIGHT_REGEX = new RegExp(`(${HIGHLIGHT_TERMS.join('|')})`, 'gi')

const formatText = (text: string) =>
  text.split(HIGHLIGHT_REGEX).map((part, i) => {
    if (HIGHLIGHT_TERMS.some(t => t.toLowerCase() === part.toLowerCase())) {
      return (
        <span key={i} className="text-[var(--accent-color,#FF9F43)] border-b border-[var(--accent-color,#FF9F43)]/30 drop-shadow-[0_0_8px_rgba(255,159,67,0.4)]">
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })

const TypingEffect = React.memo(({ text, isGenerating, isLatest, onTypingChange }: {
  text: string
  isGenerating: boolean
  isLatest: boolean
  onTypingChange?: (typing: boolean) => void
}) => {
  const [displayedText, setDisplayedText] = useState(isLatest && isGenerating ? '' : text)
  const [isTyping, setIsTyping] = useState(isLatest && isGenerating)

  const setTypingState = (val: boolean) => {
    setIsTyping(val)
    onTypingChange?.(val)
  }

  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(text)
      setTypingState(false)
      return
    }
    if (displayedText === text) {
      setTypingState(false)
      return
    }
    if (!text.startsWith(displayedText)) {
      setDisplayedText(text)
      return
    }
    setTypingState(true)
    const diff = text.length - displayedText.length
    const charsPerTick = Math.max(1, Math.min(12, Math.floor(diff / 15)))
    const timeout = setInterval(() => {
      setDisplayedText(prev => {
        if (prev.length < text.length) return text.slice(0, prev.length + charsPerTick)
        clearInterval(timeout)
        setTypingState(false)
        return prev
      })
    }, 20)
    return () => clearInterval(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, isLatest, displayedText])

  return (
    <div className="space-y-6 relative">
      {displayedText.split('\n').map((paragraph, idx) => (
        <p key={idx} className={clsx('min-h-[1rem]', paragraph.trim() === '' && 'h-2')}>
          {formatText(paragraph)}
          {(isGenerating || isTyping) && isLatest && idx === displayedText.split('\n').length - 1 && (
            <span
              className="inline-block w-2.5 h-5 ml-1.5 -mb-1 animate-[pulse_0.8s_ease-in-out_infinite] rounded-sm"
              style={{ backgroundColor: 'var(--accent-color, #FF9F43)', boxShadow: '0 0 12px var(--accent-color, #FF9F43)' }}
            />
          )}
        </p>
      ))}
    </div>
  )
})

export default function StoryConsole() {
  const { storyBlocks, updateStoryBlock, isGenerating, debugMode, isInputMode, baseTheme } = useEngineStore()

  const extractStoryContent = (rawText: string, isStreaming: boolean) => {
    const normalized = rawText.replace(/```/g, '').replace(/Section \d+:?/gi, '').trim()

    const match = normalized.match(/backend\s*\n([\s\S]*?)\n\s*story\s*\n([\s\S]*)/i)
    if (match) return match[2].trim()

    const storyOnly = normalized.match(/story\s*\n([\s\S]*)/i)
    if (storyOnly) return storyOnly[1].trim()

    if (normalized.match(/backend\s*\n/i)) {
      return isStreaming ? '[ Processing game state... ]' : ''
    }

    return rawText
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [, setIsAtBottom] = useState(true)
  const [isAnyBlockTyping, setIsAnyBlockTyping] = useState(false)
  const isTrackingRef = useRef(true)
  const isSuppressedRef = useRef(false)
  const rafIdRef = useRef<number>(0)

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [menuBlockId, setMenuBlockId] = useState<string | null>(null)
  const [viewSnapshot, setViewSnapshot] = useState<ContextSnapshot | null>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const latestAiBlockId = [...storyBlocks].reverse().find(b => b.role === 'ai')?.id

  useEffect(() => {
    if (textAreaRef.current && editingBlockId) {
      textAreaRef.current.style.height = 'inherit'
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`
    }
  }, [editingBlockId])

  // initial scroll-to-bottom
  useEffect(() => {
    const t = setTimeout(() => {
      const c = scrollContainerRef.current
      if (c) c.scrollTop = c.scrollHeight - c.clientHeight
    }, 50)
    return () => clearTimeout(t)
  }, [])

  // pause auto-scrolling when the input box opens/closes to prevent layout jitters
  useEffect(() => {
    isSuppressedRef.current = true
    const t = setTimeout(() => { isSuppressedRef.current = false }, 400)
    return () => clearTimeout(t)
  }, [isInputMode])

  const shouldScroll = isGenerating || isAnyBlockTyping
  useEffect(() => {
    if (!shouldScroll) return
    const container = scrollContainerRef.current
    if (!container) return

    let id: number
    const tick = () => {
      if (!isTrackingRef.current || isSuppressedRef.current) {
        id = requestAnimationFrame(tick)
        return
      }
      const target = container.scrollHeight - container.clientHeight
      const distance = target - container.scrollTop
      if (distance > 1) {
        container.scrollTop += Math.ceil(distance * 0.2)
      } else {
        container.scrollTop = target
      }
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    rafIdRef.current = id
    return () => cancelAnimationFrame(id)
  }, [shouldScroll])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const dist = container.scrollHeight - container.scrollTop - container.clientHeight
      const atBottom = dist < 80
      if (atBottom) isTrackingRef.current = true
      setIsAtBottom(atBottom)
    }
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // give it a smooth snap to the bottom right when generation wraps up
  const prevShouldScrollRef = useRef(false)
  useEffect(() => {
    const wasScrolling = prevShouldScrollRef.current
    prevShouldScrollRef.current = shouldScroll
    if (wasScrolling && !shouldScroll) {
      const t = setTimeout(() => {
        const container = scrollContainerRef.current
        if (!container || !isTrackingRef.current) return
        const target = container.scrollHeight - container.clientHeight
        if (target - container.scrollTop < 1) return
        let id: number
        const finalTick = () => {
          const d = (container.scrollHeight - container.clientHeight) - container.scrollTop
          if (d > 1) {
            container.scrollTop += Math.ceil(d * 0.22)
            id = requestAnimationFrame(finalTick)
          } else {
            container.scrollTop = container.scrollHeight - container.clientHeight
          }
        }
        id = requestAnimationFrame(finalTick)
        return () => cancelAnimationFrame(id)
      }, 80)
      return () => clearTimeout(t)
    }
  }, [shouldScroll])

  const handleUserIntent = () => {
    isTrackingRef.current = false
  }

  const handleContainerClick = () => {
    if (menuBlockId) setMenuBlockId(null)
  }

  const handleStartEdit = (id: string, text: string) => {
    setEditingBlockId(id)
    setEditValue(text)
  }

  const handleSaveEdit = () => {
    if (editingBlockId) {
      updateStoryBlock(editingBlockId, editValue)
      setEditingBlockId(null)
    }
  }

  return (
    <>
      <div className={clsx(
        'flex flex-col flex-1 min-w-0 min-h-0',
        baseTheme === 'classic' && 'story-panel bg-[#c0c0c0]'
      )}>
        {baseTheme === 'classic' && (
          <div className="bg-[var(--win-title)] text-[var(--win-title-text)] flex items-center justify-between px-1 py-[2px] font-bold font-['W95FA'] text-sm tracking-wide shrink-0 m-[2px]">
            <div className="flex items-center gap-1.5 ml-0.5">
              <span className="mt-[2px] tracking-wider text-[13px] !text-[var(--win-title-text)]">Story</span>
            </div>
            <div className="flex gap-[2px] mr-[1px]">
              <button className="w-[16px] h-[14px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-end justify-center pb-[2px] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                <span className="block border-b-2 border-black w-[6px] h-0 mb-[1px]"></span>
              </button>
              <button className="w-[16px] h-[14px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                <div className="w-[9px] h-[8px] border-t-2 border-l border-r border-b border-black"></div>
              </button>
              <button className="w-[16px] h-[14px] ml-[2px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                <span className="text-[10px] text-black font-bold mt-[1px] ml-[1px] leading-none">X</span>
              </button>
            </div>
          </div>
        )}
        <div
          ref={scrollContainerRef}
          className={clsx(
            'flex-1 overflow-y-auto [overflow-anchor:none] px-8 pb-32 pt-24 scroll-smooth z-10 relative flex flex-col items-center',
            baseTheme !== 'classic' && 'story-panel',
            baseTheme === 'polaris' && 'bg-[var(--polaris-surface)] backdrop-blur-[40px] m-4 rounded-[14px] border border-black/10 shadow-[var(--polaris-shadow-lg)]'
          )}
          onClick={handleContainerClick}
          onWheel={handleUserIntent}
          onTouchMove={handleUserIntent}
        >
          <div className="w-full max-w-[65ch] space-y-8 pb-4 pt-4 flex-1">
            <AnimatePresence>
              {storyBlocks.map(block => (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={clsx(
                    'text-lg leading-[1.65] tracking-wide transition-all duration-300 relative group',
                    block.role === 'system' && 'text-gray-500/80 italic text-center text-sm font-medium',
                    block.role === 'ai' && 'hover:bg-white/5 p-4 -m-4 rounded-xl cursor-text font-serif',
                    block.role === 'ai' && (baseTheme === 'classic' ? '!text-[var(--win-text)]' : '!text-[var(--win-title-text)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] [text-shadow:0_2px_10px_rgba(0,0,0,0.4),0_1px_2px_rgba(0,0,0,0.8)]'),
                    block.role === 'ai' && block.id === latestAiBlockId && 'underline decoration-white/20 underline-offset-4',
                    block.role === 'ai' && block.id !== latestAiBlockId && 'opacity-80',
                    block.role === 'user' && 'pl-5 border-l-2 border-[var(--accent-color,#FF9F43)] ml-6 font-medium py-1 my-6 hover:bg-white/5 cursor-text font-serif',
                    block.role === 'user' && (baseTheme === 'classic' ? '!text-[var(--win-text)]' : '!text-[var(--win-title-text)]/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]'),
                    menuBlockId === block.id && 'bg-white/5 rounded-xl z-20'
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (block.role !== 'system' && editingBlockId !== block.id && menuBlockId !== block.id) {
                      setMenuBlockId(block.id)
                    }
                  }}
                >
                  {editingBlockId === block.id ? (
                    <textarea
                      ref={textAreaRef}
                      value={editValue}
                      onChange={(e) => {
                        setEditValue(e.target.value)
                        e.target.style.height = 'inherit'
                        e.target.style.height = `${e.target.scrollHeight}px`
                      }}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          handleSaveEdit()
                        }
                      }}
                      autoFocus
                      className="w-full bg-black/40 border border-[var(--accent-color,#FF9F43)]/50 rounded-lg p-4 outline-none focus:shadow-[0_0_15px_rgba(255,159,67,0.15)] text-[#e2e8f0] resize-none overflow-hidden"
                    />
                  ) : (
                    <>
                      {block.role === 'user' && <span className="text-[var(--accent-color,#FF9F43)] mr-3 opacity-80">»</span>}
                      {block.role === 'ai' ? (
                        <TypingEffect
                          text={debugMode ? block.text : extractStoryContent(block.text, isGenerating && block.id === latestAiBlockId)}
                          isGenerating={isGenerating}
                          isLatest={block.id === latestAiBlockId}
                          onTypingChange={block.id === latestAiBlockId ? setIsAnyBlockTyping : undefined}
                        />
                      ) : (
                        debugMode ? block.text : extractStoryContent(block.text, false)
                      )}

                      <AnimatePresence>
                        {menuBlockId === block.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-4 -top-6 flex items-center gap-1 bg-[#1C2128] border border-white/10 rounded-lg shadow-xl p-1 z-30"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setMenuBlockId(null)
                                handleStartEdit(block.id, block.text)
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wide text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              disabled={!block.contextSnapshot}
                              title={!block.contextSnapshot ? 'No context data available for this older turn' : ''}
                              onClick={() => {
                                setMenuBlockId(null)
                                if (block.contextSnapshot) setViewSnapshot(block.contextSnapshot)
                              }}
                              className="disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wide text-gray-300 hover:text-[var(--accent-color,#FF9F43)] hover:bg-[var(--accent-color,#FF9F43)]/10 rounded-md transition-colors"
                            >
                              <Eye className="w-3 h-3" /> View Context
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <TrafficLightControls
                              onClose={() => setMenuBlockId(null)}
                              fallback={
                                <button
                                  onClick={() => setMenuBlockId(null)}
                                  className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              }
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isGenerating && (
              <div className="text-gray-500 flex gap-2 mt-8 items-center h-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color,#FF9F43)] shadow-[0_0_8px_var(--accent-color)] animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color,#FF9F43)] shadow-[0_0_8px_var(--accent-color)] animate-pulse animation-delay-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color,#FF9F43)] shadow-[0_0_8px_var(--accent-color)] animate-pulse animation-delay-400"></span>
              </div>
            )}

            <div className="mt-12 w-full pt-8">
              <ActionDeck />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {viewSnapshot && (
          <ViewContextModal snapshot={viewSnapshot} onClose={() => setViewSnapshot(null)} />
        )}
      </AnimatePresence>
    </>
  )
}

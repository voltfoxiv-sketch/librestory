import { useEngineStore } from '../../store/engineStore'
import { Activity } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { getActiveStoryCards, getRetainedHistory, estimateTokens } from '../../lib/contextScanner'
import { clsx } from 'clsx'
import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

export default function LeftSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)

  const {
    isLeftSidebarOpen, toggleLeftSidebar, storyBlocks, maxContextTokens,
    aiInstructions, authorsNote, plotEssentials, storyCards, baseTheme
  } = useEngineStore()

  const activeCards = getActiveStoryCards(storyBlocks, storyCards, 2000)
  let storyCardsText = ''
  activeCards.forEach(card => {
    storyCardsText += `${card.title} (${card.category}): ${card.content}\n`
  })

  const systemPrompt = `${aiInstructions}\n\n[PLOT ESSENTIALS]\n${plotEssentials}\n\n[STORY CARDS]\n${storyCardsText}\n${authorsNote}`
  const systemTokens = estimateTokens(systemPrompt)

  const availableHistoryTokens = maxContextTokens - systemTokens - 500
  const { usedTokens: historyTokens } = getRetainedHistory(storyBlocks, availableHistoryTokens)

  // calculate how much of the context window we're eating up
  const currentTokens = systemTokens + historyTokens
  const contextPercentage = Math.min(100, (currentTokens / maxContextTokens) * 100)

  return (
    <AnimatePresence>
      {isLeftSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: isExpanded ? 600 : 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={clsx(
            'border-r border-white/5 shadow-2xl flex flex-col shrink-0 h-full overflow-hidden z-10 relative',
            'bg-[#161A1F]/95 backdrop-blur-md border-r-white/10'
          )}
          style={{
            borderColor: baseTheme === 'classic' ? '#808080' : undefined
          }}
        >
          {baseTheme === 'classic' && (
            <div className="bg-[var(--win-title)] text-[var(--win-title-text)] flex items-center justify-between px-1 py-[2px] font-bold font-['W95FA'] text-sm tracking-wide shrink-0 m-[2px]">
              <div className="flex items-center gap-1.5 ml-0.5">
                <span className="mt-[2px] tracking-wider text-[13px] !text-[var(--win-title-text)]">Metrics</span>
              </div>
              <div className="flex gap-[2px] mr-[1px]">
                <button className="w-[16px] h-[14px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-end justify-center pb-[2px] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                  <span className="block border-b-2 border-black w-[6px] h-0 mb-[1px]"></span>
                </button>
                <button className="w-[16px] h-[14px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                  <div className="w-[9px] h-[8px] border-t-2 border-l border-r border-b border-black"></div>
                </button>
                <button onClick={toggleLeftSidebar} className="w-[16px] h-[14px] ml-[2px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                  <span className="text-[10px] text-black font-bold mt-[1px] ml-[1px] leading-none">X</span>
                </button>
              </div>
            </div>
          )}
          <div className="p-6 flex flex-col gap-8 w-full h-full overflow-y-auto overflow-x-hidden relative z-10 custom-scrollbar">

            <div className="flex justify-end -mb-4 relative z-20">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-md bg-white/[0.02] border border-white/5"
                title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            <section className={clsx(
              'bg-white/[0.02] border border-white/5 rounded-2xl p-5 backdrop-blur-md',
              baseTheme === 'legacy'
                ? 'shadow-[var(--bor-shadow-card,0_4px_24px_hsla(232,60%,4%,0.65))]'
                : 'shadow-lg'
            )}>
              <h3 className="text-[10px] font-bold text-gray-500/80 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Engine Metrics
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-[11px] text-gray-500 mb-2 font-medium tracking-wide">
                    <span>CONTEXT WINDOW</span>
                    <span className="font-mono tabular-nums text-gray-400">{currentTokens.toLocaleString()} / {maxContextTokens.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner relative mb-3">
                    <div
                      className="h-full bg-[var(--accent-color,#FF9F43)] shadow-[0_0_10px_var(--accent-color)] relative overflow-hidden transition-all duration-500"
                      style={{ width: `${contextPercentage}%` }}
                    >
                      <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                  <div className="text-[9px] whitespace-nowrap overflow-hidden text-ellipsis font-bold tracking-widest text-gray-500 bg-black/30 border border-white/5 rounded-md px-4 py-2 text-center">
                    CHANGE IN: <span className="text-gray-400">GAMEPLAY {'>'} MAX TOKENS</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

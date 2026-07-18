import { useEngineStore } from '../../../store/engineStore'
import { clsx } from 'clsx'
import AdventureTab from './AdventureTab'
import GameplayTab from './GameplayTab'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

export default function ContextSidebar() {
  const { isRightSidebarOpen, activeMainTab, setActiveMainTab, toggleRightSidebar, baseTheme } = useEngineStore()

  // the big right sidebar container
  return (
    <AnimatePresence>
      {isRightSidebarOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={clsx(
            'border-l border-white/5 flex flex-col shrink-0 h-full relative z-10 overflow-hidden',
            baseTheme === 'legacy'
              ? 'bg-[#161A1F]/65 backdrop-blur-xl shadow-[-10px_0_var(--bor-shadow-panel,30px_rgba(0,0,0,0.3)),inset_2px_2px_3px_rgba(255,255,255,0.02),inset_-2px_-2px_3px_rgba(0,0,0,0.35)]'
              : 'bg-[#161A1F]/65 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.3),inset_2px_2px_3px_rgba(255,255,255,0.03),inset_-2px_-2px_3px_rgba(0,0,0,0.4)]'
          )}
        >
          {baseTheme === 'classic' && (
            <div className="bg-[var(--win-title)] text-[var(--win-title-text)] flex items-center justify-between px-1 py-[2px] font-bold font-['W95FA'] text-sm tracking-wide shrink-0 m-[2px]">
              <div className="flex items-center gap-1.5 ml-0.5">
                <span className="mt-[2px] tracking-wider text-[13px] !text-[var(--win-title-text)]">Context</span>
              </div>
              <div className="flex gap-[2px] mr-[1px]">
                <button className="w-[16px] h-[14px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-end justify-center pb-[2px] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                  <span className="block border-b-2 border-black w-[6px] h-0 mb-[1px]"></span>
                </button>
                <button className="w-[16px] h-[14px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                  <div className="w-[9px] h-[8px] border-t-2 border-l border-r border-b border-black"></div>
                </button>
                <button onClick={toggleRightSidebar} className="w-[16px] h-[14px] ml-[2px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
                  <span className="text-[10px] text-black font-bold mt-[1px] ml-[1px] leading-none">X</span>
                </button>
              </div>
            </div>
          )}
          <div className="w-[340px] flex flex-col h-full relative z-10">
            <button
              onClick={toggleRightSidebar}
              className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white bg-white/5 rounded-lg z-20 transition-colors md:hidden"
            >
              <X className="w-4 h-4" />
            </button>

            <div className={clsx(
              'flex items-center shrink-0 relative z-20',
              baseTheme === 'legacy' ? 'gap-2 px-6 pt-6 w-full' :
              baseTheme === 'polaris' ? 'gap-1 p-1 m-4 w-[calc(100%-2rem)] bg-black/5 rounded-lg' :
              'bg-black/20 w-full'
            )}>
              {(['adventure', 'gameplay'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveMainTab(tab)}
                  className={clsx(
                    'flex-1 py-2 text-[11px] font-bold tracking-[0.2em] uppercase transition-all relative',
                    baseTheme === 'legacy' ? 'rounded-md' : baseTheme === 'polaris' ? 'rounded-md z-10' : 'py-4',
                    activeMainTab === tab
                      ? (baseTheme === 'legacy'
                          ? 'text-[#F4F4F5]'
                          : baseTheme === 'polaris'
                            ? 'text-[#1D1D1F] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]'
                            : 'text-[#e2e8f0] border-t-2 border-[var(--accent-color,#FF9F43)] bg-white/5 shadow-[inset_0_2px_15px_rgba(255,255,255,0.02)]')
                      : (baseTheme === 'legacy'
                          ? 'text-gray-500 hover:text-gray-300 hover:bg-[rgba(255,255,255,0.03)]'
                          : baseTheme === 'polaris'
                            ? 'text-[#000000] hover:text-[#1D1D1F]'
                            : 'text-gray-500 hover:text-gray-300 border-t-2 border-transparent')
                  )}
                >
                  {activeMainTab === tab && baseTheme === 'legacy' && (
                    <motion.div
                      layoutId="context-main-tabs"
                      className="absolute inset-0 bg-[rgba(255,255,255,0.1)] rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] z-0"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{tab}</span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {activeMainTab === 'adventure' ? (
                  <motion.div
                    key="adventure"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <AdventureTab />
                  </motion.div>
                ) : (
                  <motion.div
                    key="gameplay"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="absolute inset-0"
                  >
                    <GameplayTab />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

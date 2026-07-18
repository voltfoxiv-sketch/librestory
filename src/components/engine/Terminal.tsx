import { useEngineStore } from '../../store/engineStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal as TerminalIcon, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { TrafficLightControls } from './TrafficLightControls'

export default function Terminal() {
  const { isTerminalOpen, toggleTerminal, terminalLogs } = useEngineStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // pin the terminal scroll to the bottom when new logs hit
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [terminalLogs, isTerminalOpen])

  return (
    <AnimatePresence>
      {isTerminalOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-0 left-0 right-0 h-64 z-[90] p-4"
        >
          <div className="w-full h-full bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl flex flex-col font-mono overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 shrink-0">
              <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold">
                <TerminalIcon className="w-4 h-4" /> Engine Terminal
              </div>
              <TrafficLightControls
                onClose={toggleTerminal}
                fallback={
                  <button onClick={toggleTerminal} className="text-gray-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                }
              />
            </div>
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto text-xs space-y-1 scroll-smooth">
              <p className="text-gray-500 mb-2">LibreStory Engine v1.0.0. Awaiting logs...</p>
              {terminalLogs.map((log) => {
                const time = new Date(log.timestamp).toLocaleTimeString([], { hour12: false })
                return (
                  <div key={log.id} className="flex gap-3 leading-relaxed">
                    <span className="text-gray-600 shrink-0">[{time}]</span>
                    <span className={clsx(
                      'break-words',
                      log.type === 'error' && 'text-red-400 font-bold',
                      log.type === 'success' && 'text-green-400',
                      log.type === 'warn' && 'text-yellow-400',
                      log.type === 'system' && 'text-blue-400 font-bold',
                      log.type === 'info' && 'text-gray-300'
                    )}>
                      {log.message}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

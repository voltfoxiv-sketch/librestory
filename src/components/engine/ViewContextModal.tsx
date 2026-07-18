import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import type { ContextSnapshot } from '../../store/engineStore'
import { TrafficLightControls } from './TrafficLightControls'

interface Props {
  snapshot: ContextSnapshot
  onClose: () => void
}

export default function ViewContextModal({ snapshot, onClose }: Props) {
  const {
    adventureTokens,
    memoryTokens,
    essentialTokens,
    authorNoteTokens,
    storyCardTokens,
    instructionTokens,
    responseTokens,
    maxTokens
  } = snapshot

  // smash them all together for the math
  const totalUsed = adventureTokens + memoryTokens + essentialTokens + authorNoteTokens + storyCardTokens + instructionTokens + responseTokens

  // calc the css percentage
  const getWidth = (val: number) => `${Math.max((val / totalUsed) * 100, 0)}%`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#1C2128] border border-white/10 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
          <h2 className="text-sm font-bold text-gray-200 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            View Context
          </h2>
          <TrafficLightControls
            onClose={onClose}
            fallback={
              <button
                onClick={onClose}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            }
          />
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-base font-bold text-white tracking-wide">Context used for this action</h3>
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
              {totalUsed} / {maxTokens} TOKENS
            </span>
          </div>

          <div className="h-8 w-full bg-[#0B0E11] rounded overflow-hidden flex border border-white/5">
            {adventureTokens > 0 && <div className="h-full bg-[#E130C3] border-r border-black/40" style={{ width: getWidth(adventureTokens) }} title="Adventure" />}
            {memoryTokens > 0 && <div className="h-full bg-[#8B5CF6] border-r border-black/40" style={{ width: getWidth(memoryTokens) }} title="Memories" />}
            {essentialTokens > 0 && <div className="h-full bg-[#3B82F6] border-r border-black/40" style={{ width: getWidth(essentialTokens) }} title="Essentials" />}
            {authorNoteTokens > 0 && <div className="h-full bg-[#F59E0B] border-r border-black/40" style={{ width: getWidth(authorNoteTokens) }} title="Author's Note" />}
            {storyCardTokens > 0 && <div className="h-full bg-[#FF5E3A] border-r border-black/40" style={{ width: getWidth(storyCardTokens) }} title="Story Cards" />}
            {instructionTokens > 0 && <div className="h-full bg-[#F43F5E] border-r border-black/40" style={{ width: getWidth(instructionTokens) }} title="Instructions" />}
            {responseTokens > 0 && (
              <div
                className="h-full border-r border-black/40"
                style={{
                  width: getWidth(responseTokens),
                  background: 'repeating-linear-gradient(45deg, #2d3748, #2d3748 5px, #1a202c 5px, #1a202c 10px)'
                }}
                title="Response"
              />
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#E130C3]" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Adventure</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Memories</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Essentials</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Author's Note</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5E3A]" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Story Cards</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" /><span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Instructions</span></div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'repeating-linear-gradient(45deg, #2d3748, #2d3748 3px, #1a202c 3px, #1a202c 6px)' }} />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Response</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

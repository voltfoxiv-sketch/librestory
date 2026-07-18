import { useState, useRef, useEffect } from 'react'
import { useEngineStore } from '../../../store/engineStore'
import { Search, Plus, List, Grid, Upload, Trash2, Bot, PenLine, FileText } from 'lucide-react'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'

export default function AdventureTab() {
  const {
    activeAdventureTab, setActiveAdventureTab,
    storyCards, bulkImportCards, removeStoryCard, isGenerating,
    aiInstructions, setAiInstructions,
    authorsNote, setAuthorsNote,
    plotEssentials, setPlotEssentials,
    baseTheme
  } = useEngineStore()

  const [bulkText, setBulkText] = useState('')
  const aiRef = useRef<HTMLTextAreaElement>(null)
  const authRef = useRef<HTMLTextAreaElement>(null)
  const plotRef = useRef<HTMLTextAreaElement>(null)

  // auto-grow the textareas so they don't look weird when empty vs full
  const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement | null>) => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    adjustHeight(aiRef)
    const t = setTimeout(() => adjustHeight(aiRef), 300)
    return () => clearTimeout(t)
  }, [aiInstructions, activeAdventureTab])

  useEffect(() => {
    adjustHeight(authRef)
    const t = setTimeout(() => adjustHeight(authRef), 300)
    return () => clearTimeout(t)
  }, [authorsNote, activeAdventureTab])

  useEffect(() => {
    adjustHeight(plotRef)
    const t = setTimeout(() => adjustHeight(plotRef), 300)
    return () => clearTimeout(t)
  }, [plotEssentials, activeAdventureTab])

  const handleBulkImport = () => {
    if (!bulkText.trim()) return
    bulkImportCards(bulkText)
    setBulkText('')
  }

  const isLegacy = baseTheme === 'legacy'

  const tabClass = (active: boolean) => clsx(
    'text-[10px] font-bold tracking-[0.15em] uppercase transition-all relative',
    isLegacy ? 'flex-1 py-1.5 rounded-md text-center' : 'pb-3 border-b-2',
    active
      ? (isLegacy ? 'text-[#F4F4F5]' : "border-[var(--accent-color,#FF9F43)] !text-[var(--win-title-text)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]")
      : (isLegacy ? 'text-gray-500 hover:text-gray-300 hover:bg-[rgba(255,255,255,0.03)]' : 'border-transparent text-gray-500 hover:text-gray-300')
  )

  const inputClass = clsx(
    'w-full p-4 text-[13px] text-[#cbd5e1] resize-none outline-none transition-all leading-relaxed rounded-xl border',
    isLegacy
      ? 'bg-black/40 border-black/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)] focus:shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05),0_0_20px_rgba(255,159,67,0.15)] focus:border-[var(--accent-color,#FF9F43)]/50'
      : 'bg-white/[0.03] backdrop-blur-md border-white/5 focus:border-[var(--accent-color,#FF9F43)]/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(255,159,67,0.15)] shadow-sm'
  )

  return (
    <div className="flex flex-col h-full w-full">

      <div className={clsx('flex px-6 pt-6 shrink-0', isLegacy ? 'pb-4' : 'pb-0 border-b border-white/5 gap-6')}>
        <div className={clsx('flex', isLegacy ? 'bg-[rgba(0,0,0,0.2)] p-1 rounded-lg w-full gap-1' : 'gap-6 w-full')}>

          <button onClick={() => setActiveAdventureTab('plot')} className={clsx(tabClass(activeAdventureTab === 'plot'))}>
            {activeAdventureTab === 'plot' && isLegacy && (
              <motion.div
                layoutId="adventure-tabs"
                className="absolute inset-0 bg-[rgba(255,255,255,0.1)] rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] z-0"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">Global Instructions</span>
          </button>

          <button onClick={() => setActiveAdventureTab('cards')} className={clsx(tabClass(activeAdventureTab === 'cards'), 'flex gap-2 items-center justify-center')}>
            {activeAdventureTab === 'cards' && isLegacy && (
              <motion.div
                layoutId="adventure-tabs"
                className="absolute inset-0 bg-[rgba(255,255,255,0.1)] rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] z-0"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex gap-2 items-center justify-center">
              Story Cards
              <span className="relative flex h-2 w-2">
                {!isLegacy && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-color)] opacity-40"></span>}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-color)]"></span>
              </span>
              ({storyCards.length})
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {activeAdventureTab === 'plot' && (
            <motion.div
              key="plot"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 p-6 space-y-6"
            >
              <div className="space-y-2 group">
                <h3 className="text-xs font-semibold text-gray-300 tracking-wide flex items-center gap-2">
                  <Bot className="w-4 h-4 text-gray-400" /> AI Instructions
                </h3>
                <p className="text-[11px] text-gray-500">Override global AI behavior and tone.</p>
                <textarea
                  ref={aiRef}
                  className={clsx(inputClass, 'min-h-[6rem] max-h-[30vh] overflow-y-auto')}
                  placeholder="Enter AI tone and safety overrides here..."
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                />
              </div>

              <div className="space-y-2 group">
                <h3 className="text-xs font-semibold text-gray-300 tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" /> Plot Essentials
                </h3>
                <p className="text-[11px] text-gray-500">Core memory and active quest rules.</p>
                <textarea
                  ref={plotRef}
                  className={clsx(inputClass, 'min-h-[8rem] max-h-[40vh] overflow-y-auto')}
                  placeholder="put in information you dont want the AI to forget"
                  value={plotEssentials}
                  onChange={(e) => setPlotEssentials(e.target.value)}
                />
              </div>

              <div className="space-y-2 group">
                <h3 className="text-xs font-semibold text-gray-300 tracking-wide flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-gray-400" /> Author's Note
                </h3>
                <p className="text-[11px] text-gray-500">Inject subtle narrative directions inserted periodically.</p>
                <textarea
                  ref={authRef}
                  className={clsx(inputClass, 'min-h-[4rem] max-h-[30vh] overflow-y-auto')}
                  placeholder="put in stuff relative to the genre or what not"
                  value={authorsNote}
                  onChange={(e) => setAuthorsNote(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          {activeAdventureTab === 'cards' && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="absolute inset-0 p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search cards..."
                    className={clsx(
                      'w-full py-2.5 pl-9 pr-3 text-sm text-gray-300 outline-none transition-all rounded-xl border',
                      isLegacy
                        ? 'bg-black/40 border-black/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)] focus:shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(255,159,67,0.15)] focus:border-[var(--accent-color,#FF9F43)]/50'
                        : 'bg-white/[0.03] backdrop-blur-md border-white/5 focus:border-[var(--accent-color,#FF9F43)]/50 focus:bg-white/10 focus:shadow-[0_0_15px_rgba(255,159,67,0.15)] shadow-sm'
                    )}
                  />
                </div>
                <button className="p-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 hover:scale-105 transition-all shadow-sm" title="Grid View"><Grid className="w-4 h-4" /></button>
                <button className="p-2 text-gray-500 hover:text-gray-300 hover:scale-105 transition-all" title="List View"><List className="w-4 h-4" /></button>
              </div>

              <button className="w-full py-3 border border-dashed border-white/10 text-gray-400 text-xs font-bold tracking-widest uppercase rounded-xl hover:border-[var(--accent-color,#FF9F43)] hover:text-[var(--accent-color,#FF9F43)] hover:bg-[var(--accent-color,#FF9F43)]/5 hover:scale-[1.01] transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Create Card
              </button>

              <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-2xl p-5 space-y-3 shadow-sm">
                <h4 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Bulk Import</h4>
                <textarea
                  className={clsx(
                    'w-full h-16 p-3 text-xs text-gray-300 resize-none outline-none transition-colors rounded-lg border',
                    isLegacy
                      ? 'bg-black/40 border-black/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)] focus:shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(255,159,67,0.15)] focus:border-[var(--accent-color,#FF9F43)]/50'
                      : 'bg-transparent border-white/10 focus:border-[var(--accent-color,#FF9F43)]/50 focus:shadow-[0_0_15px_rgba(255,159,67,0.15)]'
                  )}
                  placeholder="Paste raw lore text here to extract..."
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                />
                <button
                  onClick={handleBulkImport}
                  disabled={isGenerating || !bulkText.trim()}
                  className="w-full py-2.5 bg-white/5 text-white text-[11px] font-bold tracking-widest uppercase rounded-lg hover:bg-white/10 hover:scale-[1.02] transition-all disabled:opacity-50"
                >
                  {isGenerating ? 'Parsing...' : 'Extract Entities'}
                </button>
              </div>

              <div className="grid gap-3 pb-8">
                <AnimatePresence>
                  {storyCards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.01, 0.5) }}
                      className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 hover:border-white/10 transition-all group shadow-sm relative overflow-hidden"
                    >
                      <button
                        onClick={() => removeStoryCard(card.id)}
                        className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-black/20 rounded-md z-10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex justify-between items-start mb-3 pr-8">
                        <h4 className="text-sm font-semibold text-gray-200 group-hover:text-[var(--accent-color,#FF9F43)] transition-colors">{card.title}</h4>
                        <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase px-2 py-1 bg-black/30 rounded-md border border-white/5">{card.category}</span>
                      </div>
                      <pre className="text-[11px] text-gray-400 font-sans leading-relaxed overflow-hidden whitespace-pre-wrap">
                        {card.content}
                      </pre>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

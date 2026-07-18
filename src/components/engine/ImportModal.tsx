import { useState, useRef } from 'react'
import { useEngineStore, type StoryBlock } from '../../store/engineStore'
import { X, UploadCloud, DownloadCloud, FileJson } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrafficLightControls } from './TrafficLightControls'

export default function ImportModal() {
  const {
    isImportModalOpen, setImportModalOpen, importStory,
    currentAdventureId, storyBlocks, relationships, equipment,
    playerProfile, storyCards
  } = useEngineStore()

  const [rawText, setRawText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportJSON = () => {
    const data = {
      id: currentAdventureId,
      storyBlocks, relationships, equipment,
      playerProfile, storyCards,
      plotEssentials: useEngineStore.getState().plotEssentials,
      authorsNote: useEngineStore.getState().authorsNote,
      adventureImage: useEngineStore.getState().adventureImage,
      ownerId: useEngineStore.getState().ownerId,
      aiInstructions: useEngineStore.getState().aiInstructions,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${playerProfile?.name || 'adventure'}_export.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (json.storyBlocks) {
          useEngineStore.setState({
            storyBlocks: json.storyBlocks || [],
            inventory: [],
            relationships: json.relationships || [],
            equipment: json.equipment || { head: null, torso: null, legs: null, feet: null, accessory: null, mainhand: null, offhand: null },
            goldCoins: 0,
            playerProfile: json.playerProfile || null,
            storyCards: json.storyCards || [],
            plotEssentials: json.plotEssentials || '',
            authorsNote: json.authorsNote || '',
            adventureImage: json.adventureImage || '',
            ownerId: json.ownerId || null,
            ...(json.aiInstructions ? { aiInstructions: json.aiInstructions } : {}),
            isImportModalOpen: false
          })
        } else {
          alert('Invalid JSON file. Missing storyBlocks.')
        }
      } catch (err) {
        alert('Failed to parse JSON file.')
      }
    }
    reader.readAsText(file)
  }

  // nasty parser for taking raw discord/novelai text logs and turning them into blocks
  const handleImportRaw = () => {
    if (!rawText.trim()) return

    const blocks: Omit<StoryBlock, 'id'>[] = []
    let currentRole: 'user' | 'ai' = 'ai'
    let currentText: string[] = []

    const pushBlock = () => {
      const text = currentText.join('\n').trim()
      if (text) blocks.push({ role: currentRole, text })
      currentText = []
    }

    const lines = rawText.split('\n')
    for (const line of lines) {
      if (line.trim().startsWith('>')) {
        pushBlock()
        currentRole = 'user'
        currentText.push(line.replace(/^>\s*/, ''))
      } else if (line.trim() === '') {
        if (currentText.length > 0) currentText.push(line)
      } else {
        if (currentRole === 'user') {
          pushBlock()
          currentRole = 'ai'
        }
        currentText.push(line)
      }
    }
    pushBlock()

    importStory(blocks)
    setImportModalOpen(false)
    setRawText('')
  }

  return (
    <AnimatePresence>
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-[#161A1F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <h2 className="text-sm font-bold text-gray-200 tracking-wide flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-[var(--accent-color,#FF9F43)]" />
                Import / Export Adventure
              </h2>
              <TrafficLightControls
                onClose={() => setImportModalOpen(false)}
                fallback={
                  <button
                    onClick={() => setImportModalOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                }
              />
            </div>

            <div className="p-6 space-y-8 overflow-y-auto">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  Full Save State (.json)
                </h3>
                <div className="flex gap-4">
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-sm font-medium text-gray-300"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    Export Current Adventure
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--accent-color,#FF9F43)] text-black rounded-xl hover:brightness-110 transition-colors text-sm font-bold shadow-[0_0_15px_rgba(255,159,67,0.2)]"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Import JSON Save
                  </button>
                  <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJSON} className="hidden" />
                </div>
              </div>

              <div className="h-px bg-white/5 w-full" />

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-200">Raw Story Log (Text)</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Paste your story log below. Ensure your actions are prefixed with a blockquote{' '}
                  <code className="bg-black/30 px-1.5 py-0.5 rounded text-[var(--accent-color,#FF9F43)]">&gt; </code>{' '}
                  so the engine can parse it into alternating user and AI blocks.
                </p>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="> You open the door.\n\nThe room is dark..."
                  className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-[#cbd5e1] resize-none outline-none focus:border-[var(--accent-color,#FF9F43)]/50 focus:shadow-[0_0_15px_rgba(255,159,67,0.15)] transition-all font-sans leading-relaxed"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleImportRaw}
                    disabled={!rawText.trim()}
                    className="px-6 py-2 bg-white/10 text-white text-xs font-bold tracking-widest uppercase rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Parse Text Log
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

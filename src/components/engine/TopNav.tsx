import { useRef } from 'react'
import { useEngineStore } from '../../store/engineStore'
import { Menu, Settings, Undo, Redo, Sidebar, UploadCloud, DownloadCloud, Save } from 'lucide-react'
import GlobalSettingsModal from './GlobalSettingsModal'
import clsx from 'clsx'

// TODO: actually wire up redo/undo instead of just having dead buttons
export default function TopNav() {
  const {
    toggleLeftSidebar,
    toggleRightSidebar,
    playerProfile,
    configNeedsAttention,
    setConfigNeedsAttention,
    isSettingsOpen,
    setIsSettingsOpen,
    baseTheme,
    forceSave,
    currentAdventureId, storyBlocks, relationships, equipment,
    storyCards, plotEssentials, authorsNote, adventureImage, ownerId
  } = useEngineStore()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExportJSON = () => {
    const data = {
      id: currentAdventureId,
      storyBlocks, relationships, equipment,
      playerProfile, storyCards,
      plotEssentials, authorsNote, adventureImage, ownerId,
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

  const is95 = baseTheme === 'classic'
  const iconSm = is95 ? 'w-3.5 h-3.5' : 'w-4 h-4'
  const btn = clsx('text-gray-400 hover:text-white transition-colors hover:bg-white/5', is95 ? 'p-1 rounded' : 'p-2 rounded-lg')
  const divider = clsx('w-px bg-white/10', is95 ? 'h-3.5 mx-0.5' : 'h-5 mx-1')

  return (
    <>
      <div
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        className={clsx(
          'bg-black/20 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between shrink-0 shadow-[0_4px_30px_rgba(0,0,0,0.1)] z-20 relative',
          is95 ? 'h-7 px-2' : 'h-14 px-4'
        )}
      >
        <div
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className={clsx('flex items-center', is95 ? 'gap-2' : 'gap-3')}
        >
          <button onClick={toggleLeftSidebar} className={btn}>
            <Menu className={is95 ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
          </button>
          <div className={divider} />

          {!is95 && (
            <img src="./ligvioo.png" alt="LibreStory" className="h-11 ml-2 object-contain select-none pointer-events-none" />
          )}
        </div>

        {/* slap the adventure name right in the middle */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <span className="font-display tracking-[0.3em] text-[10px] uppercase text-gray-300 font-bold drop-shadow-md">
            {playerProfile?.name || 'Untitled Adventure'}
          </span>
        </div>

        <div
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          className={clsx('flex items-center', is95 ? 'gap-1' : 'gap-2')}
        >
          <button className={btn} title="Undo">
            <Undo className={iconSm} />
          </button>
          <button className={btn} title="Redo">
            <Redo className={iconSm} />
          </button>

          <div className={divider} />

          <button
            onClick={() => forceSave()}
            className={btn}
            title="Save to Browser"
          >
            <Save className={iconSm} />
          </button>
          <button
            onClick={handleExportJSON}
            className={btn}
            title="Export JSON"
          >
            <DownloadCloud className={iconSm} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={btn}
            title="Import JSON Save"
          >
            <UploadCloud className={iconSm} />
          </button>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportJSON} className="hidden" />

          <div className={divider} />

          <button
            onClick={() => {
              setIsSettingsOpen(true)
              if (configNeedsAttention) setConfigNeedsAttention(false)
            }}
            className={clsx(
              'transition-colors relative',
              is95 ? 'p-1 rounded' : 'p-2 rounded-lg',
              configNeedsAttention ? 'text-[#FF5F57] hover:bg-[#FF5F57]/10' : 'text-gray-400 hover:text-white hover:bg-white/5'
            )}
            title="Global Settings"
          >
            <Settings className={iconSm} />
            {configNeedsAttention && (
              <span
                className={clsx(
                  'absolute bg-[#FF5F57] rounded-full shadow-[0_0_8px_#FF5F57]',
                  is95 ? '-top-0.5 -right-0.5 w-2 h-2' : 'top-1 right-1 w-2 h-2'
                )}
              />
            )}
          </button>

          <button
            onClick={toggleRightSidebar}
            className={btn}
            title="Toggle Context"
          >
            <Sidebar className={is95 ? 'w-3.5 h-3.5' : 'w-5 h-5'} />
          </button>
        </div>
      </div>

      <GlobalSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  )
}

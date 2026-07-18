import { useState, useRef, useEffect } from 'react'
import { useEngineStore } from '../../store/engineStore'
import clsx from 'clsx'
import { TrafficLightControls } from './TrafficLightControls'
import { Book } from 'lucide-react'

export default function MenuBar() {
  const { baseTheme, startNewAdventure, setIsSettingsOpen, toggleTerminal } = useEngineStore()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // classic click-outside-to-close hack
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menus = [
    {
      label: 'File',
      items: [
        { label: 'New Adventure', action: () => { startNewAdventure(); setActiveMenu(null) } },
        { label: 'Import/Export Adventure', action: () => { useEngineStore.getState().setImportModalOpen(true); setActiveMenu(null) } }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', action: () => setActiveMenu(null) },
        { label: 'Redo', action: () => setActiveMenu(null) }
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Settings', action: () => { setIsSettingsOpen(true); setActiveMenu(null) } },
        { label: 'Toggle Terminal', action: () => { toggleTerminal(); setActiveMenu(null) } }
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'About LibreStory', action: () => setActiveMenu(null) }
      ]
    }
  ]

  const is95 = baseTheme === 'classic'

  return (
    <div className="w-full flex flex-col shrink-0 z-[45] relative">
      {is95 && (
        <div className="bg-[var(--win-title)] text-[var(--win-title-text)] flex items-center justify-between px-1 py-[2px] font-bold font-['W95FA'] text-sm tracking-wide">
          <div className="flex items-center gap-1.5 ml-0.5">
            <Book className="w-[14px] h-[14px] text-[#c0c0c0]" strokeWidth={2.5} />
            <span className="mt-[2px] tracking-wider text-[13px] !text-[var(--win-title-text)]">LibreStory</span>
          </div>
          <div className="flex gap-[2px] mr-[1px]">
            <button onClick={() => (window as any).electron?.minimize()} style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="w-[16px] h-[14px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-end justify-center pb-[2px] active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
              <span className="block border-b-2 border-black w-[6px] h-0 mb-[1px]"></span>
            </button>
            <button onClick={() => (window as any).electron?.maximize()} style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="w-[16px] h-[14px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
              <div className="w-[9px] h-[8px] border-t-2 border-l border-r border-b border-black"></div>
            </button>
            <button onClick={() => (window as any).electron?.close()} style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties} className="w-[16px] h-[14px] ml-[2px] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#404040] border-b-[#404040] flex items-center justify-center active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white outline-none">
              <span className="text-[10px] text-black font-bold mt-[1px] ml-[1px] leading-none">X</span>
            </button>
          </div>
        </div>
      )}
      {!is95 && (
        <div 
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
          className={clsx(
            "w-full h-8 flex items-center shrink-0 border-b relative",
            baseTheme === 'polaris' ? "bg-white/40 backdrop-blur-md border-black/10 text-black/50" : 
            baseTheme === 'mono' ? "bg-black border-[#00ff00]/30 text-[#00ff00]" : 
            "bg-[#0A0D14]/90 backdrop-blur-2xl border-white/5 text-gray-400"
          )}
        >
          {baseTheme === 'polaris' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
              <TrafficLightControls 
                onClose={() => (window as any).electron?.close()} 
                onMinimize={() => (window as any).electron?.minimize()} 
                onMaximize={() => (window as any).electron?.maximize()} 
              />
            </div>
          )}
          <div className="w-full text-center flex items-center justify-center pointer-events-none">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase select-none drop-shadow-sm">
              LibreStory
            </span>
          </div>
        </div>
      )}
      <div 
        ref={menuRef} 
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        className={clsx(
          "w-full flex items-center relative text-xs transition-colors",
          is95 
            ? "bg-white border-b-2 border-l-2 border-l-white border-r-2 border-r-[#808080] border-b-[#808080] text-black font-['W95FA','MS_Sans_Serif',Tahoma,sans-serif] px-1"
            : baseTheme === 'polaris'
              ? "bg-white/85 backdrop-blur-md border-b border-black/10 text-black font-sans h-8 px-2 shadow-sm"
              : "bg-[#161A1F]/65 backdrop-blur-md border-b border-white/10 text-gray-300 font-sans h-8 px-1"
        )}
      >

      {menus.map((menu) => (
        <div key={menu.label} className="relative group">
          <button
            onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
            onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
            className={clsx(
              "px-3 py-1 select-none transition-colors",
              is95 
                ? (activeMenu === menu.label ? "bg-[var(--win-title)] text-[var(--win-title-text)]" : "hover:bg-[var(--win-title)] hover:text-[var(--win-title-text)]")
                : baseTheme === 'polaris'
                  ? (activeMenu === menu.label ? "bg-black/10 text-black rounded-md" : "hover:bg-black/5 text-black hover:text-black rounded-md")
                  : (activeMenu === menu.label ? "bg-white/20 text-white rounded-md" : "hover:bg-white/10 hover:text-white rounded-md")
            )}
          >
            {is95 ? <><span className="underline">{menu.label.charAt(0)}</span>{menu.label.slice(1)}</> : menu.label}
          </button>
          
          {activeMenu === menu.label && (
            <div 
              className={clsx(
                "absolute left-0 top-full mt-0 min-w-[160px] z-50 py-1 flex flex-col",
                is95 
                  ? "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
                  : baseTheme === 'polaris'
                    ? "bg-white/95 backdrop-blur-3xl border border-black/10 rounded-lg shadow-xl mt-1 overflow-hidden"
                    : "bg-[#161A1F]/65 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl mt-1 overflow-hidden"
              )}
            >
              {menu.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className={clsx(
                    "w-full text-left px-4 py-1.5 select-none whitespace-nowrap transition-colors",
                    is95 
                      ? "hover:bg-[var(--win-title)] hover:text-[var(--win-title-text)] text-black"
                      : baseTheme === 'polaris'
                        ? "hover:bg-[var(--polaris-accent)] hover:text-white text-black"
                        : "hover:bg-white/10 text-gray-300 hover:text-white"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      </div>
    </div>
  )
}

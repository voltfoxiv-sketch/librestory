import { useEffect } from 'react'
import { useEngineStore, type ThemeVariantType } from '../../store/engineStore'
import TopNav from './TopNav'
import MenuBar from './MenuBar'
import Terminal from './Terminal'
import LeftSidebar from './LeftSidebar'
import StoryConsole from './StoryConsole'
import ContextSidebar from './ContextSidebar'
import ImportModal from './ImportModal'
import { clsx } from 'clsx'
import { motion, type Variants } from 'framer-motion'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

export default function TextRPGEngine() {
  const { baseTheme, themeVariant, currentAdventureId, forceSave } = useEngineStore()

  // crank an autosave every 30s if we're actually in an adventure
  useEffect(() => {
    if (!currentAdventureId) return
    const interval = setInterval(() => {
      forceSave()
    }, 30000)
    return () => clearInterval(interval)
  }, [currentAdventureId, forceSave])

  useEffect(() => {
    // extract accent-color + HSL components (h, s). this is needed by --bor-border-accent and slider halos in pure CSS
    const accentMap: Record<string, { color: string; h: string; s: string }> = {
      legacy: ({
        amber:    { color: '#FF9F43', h: '40',  s: '100%' },
        cyber:    { color: '#00D2D3', h: '181', s: '100%' },
        atlantis: { color: '#1DD1A1', h: '161', s: '73%'  },
        orcish:   { color: '#FF6B6B', h: '0',   s: '100%' },
        matrix:   { color: '#00ff00', h: '120', s: '100%' },
        slate:    { color: '#ffffff', h: '0',   s: '0%'   },
        default:  { color: '#FF9F43', h: '40',  s: '100%' },
      } as Record<ThemeVariantType | 'default', { color: string; h: string; s: string }>)[themeVariant] || { color: '#FF9F43', h: '40', s: '100%' },
      familiar:  { color: '#94a3b8', h: '215', s: '16%'  },
      '95':      { color: '#000080', h: '240', s: '100%' },
      mono:      themeVariant === 'matrix' ? { color: '#00ff00', h: '120', s: '100%' } : { color: '#ffffff', h: '0', s: '0%' },
    }
    const a = accentMap[baseTheme] || accentMap.familiar
    document.documentElement.style.setProperty('--accent-color', a.color)
    document.documentElement.style.setProperty('--accent-h', a.h)
    document.documentElement.style.setProperty('--accent-s', a.s)

    if (typeof window !== 'undefined' && (window as any).electron) {
      (window as any).electron.setTheme(baseTheme)
    }
  }, [baseTheme, themeVariant])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      data-theme={baseTheme}
      data-variant={themeVariant}
      className={clsx(
        "w-full h-screen flex flex-col font-sans overflow-hidden selection:bg-[var(--accent-color,#FF9F43)] selection:text-black relative text-gray-200"
      )}
      style={{
        background: baseTheme === 'legacy' ? '#0A0D14' :
                    baseTheme === 'familiar' ? '#0B0E11' :
                    baseTheme === 'classic' ? (themeVariant === 'hotdog' ? '#FFFF00' : '#008080') :
                    baseTheme === 'polaris' ? 'url(/themes/royaltyfreebg.jpg) center/cover no-repeat fixed' :
                    baseTheme === 'mono' ? (themeVariant === 'matrix' ? '#000000' : '#1e1e1e') :
                    'transparent'
      }}
    >

      {baseTheme === 'legacy' && (
        <>
          <svg className="fixed w-0 h-0 pointer-events-none">
            <filter id="aurora-displacement" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
          <div
            className="absolute -inset-[10%] pointer-events-none z-0 opacity-80 mix-blend-screen"
            style={{
              filter: 'url(#aurora-displacement) blur(4px)',
              background: `
                linear-gradient(110deg, transparent 20%, rgba(0,229,163,0.15) 40%, rgba(6,182,212,0.15) 60%, transparent 80%),
                linear-gradient(80deg, transparent 10%, rgba(139,92,246,0.1) 30%, rgba(0,229,163,0.2) 70%, transparent 90%)
              `,
              backgroundSize: '200% 200%',
              animation: 'aurora-drift 60s infinite linear alternate'
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-[40vh] pointer-events-none z-0 opacity-60 mix-blend-screen"
            style={{
              background: 'linear-gradient(to bottom, var(--accent-color, rgba(0,229,163,0.3)), transparent)',
              maskImage: 'linear-gradient(to bottom, black, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
              filter: 'url(#aurora-displacement) blur(12px)',
              transform: 'scale(1.2)'
            }}
          />
        </>
      )}

      <div className="relative z-10 h-full w-full flex flex-col">
        <motion.div variants={itemVariants} className="z-40 shadow-sm flex flex-col shrink-0">
          <MenuBar />
          <TopNav />
        </motion.div>

        <div className="flex flex-1 overflow-hidden relative">
          <motion.div variants={itemVariants} className="h-full flex shrink-0">
            <LeftSidebar />
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1 flex flex-col relative min-w-0">
            <StoryConsole />
          </motion.div>

          <motion.div variants={itemVariants} className="h-full flex shrink-0">
            <ContextSidebar />
          </motion.div>
        </div>

        <Terminal />
      </div>
      <ImportModal />
    </motion.div>
  )
}

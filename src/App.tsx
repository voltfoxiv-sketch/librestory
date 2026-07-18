import { useEffect } from 'react'
import TextRPGEngine from './components/engine/TextRPGEngine'
import { useEngineStore } from './store/engineStore'

function App() {
  // rip keys out of local storage on load so we don't blind the user with setup screens every time
  useEffect(() => {
    const raw = localStorage.getItem('api-keys-local')
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        useEngineStore.setState({
          openRouterKey: parsed.openRouterKey || '',
          geminiKey: parsed.geminiKey || '',
          hfKey: parsed.hfKey || '',
          localEndpoint: parsed.localEndpoint || 'http://localhost:1234/v1'
        })
      } catch (e: unknown) {
        console.error('Failed to parse API keys:', e instanceof Error ? e.message : String(e))
      }
    } else {
      useEngineStore.setState({
        openRouterKey: '',
        geminiKey: '',
        hfKey: '',
        localEndpoint: 'http://localhost:1234/v1'
      })
    }
  }, [])

  useEffect(() => {
    const unsub = useEngineStore.subscribe((state, prevState) => {
      if (
        state.openRouterKey !== prevState.openRouterKey ||
        state.geminiKey !== prevState.geminiKey ||
        state.hfKey !== prevState.hfKey ||
        state.localEndpoint !== prevState.localEndpoint
      ) {
        localStorage.setItem('api-keys-local', JSON.stringify({
          openRouterKey: state.openRouterKey,
          geminiKey: state.geminiKey,
          hfKey: state.hfKey,
          localEndpoint: state.localEndpoint
        }))
      }
    })
    return unsub
  }, [])

  // cheap trick to track mouse for the ambient flashlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(800px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), rgba(255, 159, 67, 0.08), transparent 40%)'
        }}
      />
      <div className="relative z-10 w-full h-full">
        <TextRPGEngine />
      </div>
    </>
  )
}

export default App

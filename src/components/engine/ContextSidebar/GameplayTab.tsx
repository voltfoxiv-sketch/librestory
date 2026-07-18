import { useEffect, useState } from 'react'
import { useEngineStore, type ThemeVariantType } from '../../../store/engineStore'
import { clsx } from 'clsx'
import { Settings, Cpu, ShieldAlert, Zap, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface ORModel {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
}

export default function GameplayTab() {
  const {
    activeGameplayTab, setActiveGameplayTab,
    baseTheme, setBaseTheme, themeVariant, setThemeVariant,
    geminiKey, activeProvider, setActiveProvider,
    activeModel, setActiveModel,
    maxContextTokens, setMaxContextTokens,
    safetyLevel, setSafetyLevel,
    maxResponseLength, setMaxResponseLength,
    temperature, setTemperature,
    topP, setTopP, topK, setTopK,
    repetitionPenalty, setRepetitionPenalty,
    frequencyPenalty, setFrequencyPenalty,
    presencePenalty, setPresencePenalty,
    minP, setMinP, topA, setTopA,
    debugMode, setDebugMode
  } = useEngineStore()

  // hack to figure out the CSS gradient fill percentage for the sliders
  const sliderPct = (value: number, min: number, max: number) =>
    `${Math.round(((value - min) / (max - min)) * 100)}%`

  const [models, setModels] = useState<ORModel[]>([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoadingModels(true)
        const res = await fetch('https://openrouter.ai/api/v1/models')
        const data = await res.json()
        const fetched: ORModel[] = data.data.map((m: { id: string; name: string; pricing?: { prompt?: string; completion?: string } }) => ({
          id: m.id,
          name: m.name,
          pricing: {
            prompt: String(m.pricing?.prompt || '0'),
            completion: String(m.pricing?.completion || '0')
          }
        }))
        fetched.sort((a, b) => a.name.localeCompare(b.name))
        setModels(fetched)
      } catch (err: unknown) {
        console.error('Failed to fetch OpenRouter models:', err instanceof Error ? err.message : String(err))
      } finally {
        setLoadingModels(false)
      }
    }
    fetchModels()
  }, [])

  const filteredModels = models.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [dynamicGeminiModels, setDynamicGeminiModels] = useState<{ id: string, name: string }[]>([])
  const [loadingGeminiModels, setLoadingGeminiModels] = useState(false)
  const [geminiFetchError, setGeminiFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (activeProvider === 'gemini' && geminiKey && dynamicGeminiModels.length === 0 && !loadingGeminiModels) {
      const fetchGeminiModels = async () => {
        try {
          setLoadingGeminiModels(true)
          setGeminiFetchError(null)
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`)
          if (!res.ok) throw new Error('Invalid API Key or Network Error')
          const data = await res.json()
          const fetched = data.models
            .filter((m: { name: string; displayName?: string; supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('gemini'))
            .map((m: { name: string; displayName?: string }) => ({
              id: m.name.replace('models/', ''),
              name: m.displayName || m.name.replace('models/', '')
            }))
          setDynamicGeminiModels(fetched)
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err)
          console.error('Failed to fetch Gemini models:', errMsg)
          setGeminiFetchError(errMsg)
        } finally {
          setLoadingGeminiModels(false)
        }
      }
      fetchGeminiModels()
    }
  }, [activeProvider, geminiKey])

  const themes: { id: ThemeVariantType, name: string, color: string }[] = [
    { id: 'amber',    name: 'Pansy',    color: '#FF9F43' },
    { id: 'cyber',    name: 'Aurora',   color: '#00D2D3' },
    { id: 'atlantis', name: 'Atlantic', color: '#1DD1A1' },
    { id: 'orcish',   name: 'Nebula',   color: '#FF6B6B' }
  ]

  const monoVariants: { id: ThemeVariantType, name: string, color: string, bg: string }[] = [
    { id: 'matrix', name: 'Matrix', color: '#00ff00', bg: 'bg-black' },
    { id: 'slate',  name: 'Slate',  color: '#ffffff', bg: 'bg-[#1e1e1e]' }
  ]

  const calculateCost = (pricingPrompt: string) => {
    const costPerToken = parseFloat(pricingPrompt)
    if (isNaN(costPerToken)) return 'Unknown'
    // super rough napkin math: 32k context * 5000 turns * the prompt cost with a huge 90% cache discount
    const cost = 32000 * 5000 * costPerToken * 0.1
    return `$${cost.toFixed(2)}`
  }

  const isLegacy = baseTheme === 'legacy'

  const tabBtnClass = (active: boolean) => clsx(
    'text-[10px] font-bold tracking-[0.15em] uppercase transition-colors relative',
    isLegacy ? 'flex-1 py-1.5 rounded-md text-center' : 'pb-3 border-b-2',
    active
      ? (isLegacy ? 'text-[#F4F4F5]' : "border-[var(--accent-color,#FF9F43)] !text-[var(--win-title-text)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]")
      : (isLegacy ? 'text-gray-500 hover:text-gray-300 hover:bg-[rgba(255,255,255,0.03)]' : 'border-transparent text-gray-500 hover:text-gray-300')
  )

  const inputClass = clsx(
    'w-full px-3 py-2 text-[11px] text-[#e2e8f0] focus:outline-none transition-colors rounded-lg border',
    isLegacy
      ? 'bg-black/40 border-black/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)] focus:shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05),0_0_15px_rgba(255,159,67,0.15)] focus:border-[var(--accent-color,#FF9F43)]/50'
      : 'bg-black/20 border-white/10 focus:border-[var(--accent-color,#FF9F43)]/50'
  )

  const sliderClass = 'w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color,#FF9F43)] shadow-sm'

  return (
    <div className="flex flex-col h-full">

      {/* Tab strip */}
      <div className={clsx('flex px-6 pt-6 shrink-0', isLegacy ? 'pb-4' : 'pb-0 border-b border-white/5 gap-6')}>
        <div className={clsx('flex', isLegacy ? 'bg-[rgba(0,0,0,0.2)] p-1 rounded-lg w-full gap-1' : 'gap-6 w-full')}>
          {(['models', 'appearance', 'advanced'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveGameplayTab(tab)} className={tabBtnClass(activeGameplayTab === tab)}>
              {activeGameplayTab === tab && isLegacy && (
                <motion.div
                  layoutId="gameplay-tabs"
                  className="absolute inset-0 bg-[rgba(255,255,255,0.1)] rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] z-0"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 capitalize">{tab === 'models' ? 'AI Models' : tab}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">

        {/* Models tab */}
        {activeGameplayTab === 'models' && (
          <>
            <div className="space-y-4 flex flex-col">
              <h3 className="text-xs font-semibold text-gray-300 tracking-wide mb-1 flex items-center justify-between">Provider Selection</h3>

              <div className={clsx('flex gap-2 p-1 rounded-xl overflow-x-auto custom-scrollbar border', isLegacy ? 'bg-black/40 border-black/50 shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.05)]' : 'bg-black/20 border-transparent')}>
                {(['openrouter', 'gemini', 'huggingface', 'local'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setActiveProvider(p)}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all',
                      activeProvider === p
                        ? (isLegacy ? 'bg-[rgba(255,255,255,0.08)] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-2px_4px_rgba(0,0,0,0.4),0_4px_10px_rgba(0,0,0,0.3)] border border-white/10' : 'bg-[var(--accent-color,#FF9F43)] text-black shadow-[0_0_15px_rgba(255,159,67,0.3)]')
                        : (isLegacy ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent' : 'text-gray-400 hover:text-white hover:bg-white/10')
                    )}
                  >
                    {p === 'openrouter' ? 'OpenRouter' : p === 'gemini' ? 'Google AI' : p === 'huggingface' ? 'Hugging Face' : 'Local Model'}
                  </button>
                ))}
              </div>

              {activeProvider === 'openrouter' && (
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Select Model</label>
                    {loadingModels && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />}
                  </div>
                  <input
                    type="text"
                    placeholder="Search models... (e.g. claude, llama, wizard)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={inputClass}
                  />
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {!loadingModels && filteredModels.map(m => (
                      <div
                        key={m.id}
                        onClick={() => setActiveModel(m.id)}
                        className={clsx(
                          'flex flex-col p-3 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md',
                          activeModel === m.id
                            ? 'bg-[var(--accent-color,#FF9F43)]/10 border-[var(--accent-color,#FF9F43)]/50'
                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <Cpu className={clsx('w-3.5 h-3.5 shrink-0', activeModel === m.id ? 'text-[var(--accent-color,#FF9F43)] drop-shadow-[0_0_5px_var(--accent-color)]' : 'text-gray-500')} />
                            <span className={clsx('text-xs font-bold truncate max-w-[160px]', activeModel === m.id ? 'text-[#e2e8f0]' : 'text-gray-400')}>
                              {m.name.replace('Anthropic: ', '').replace('DeepSeek: ', '')}
                            </span>
                          </div>
                          {activeModel === m.id && (
                            <span className="text-[8px] text-[var(--accent-color,#FF9F43)] font-bold tracking-widest bg-[var(--accent-color,#FF9F43)]/10 px-1.5 py-0.5 rounded">CURRENT</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-gray-500 tracking-wider uppercase font-semibold">
                          <span>Est. Campaign Cost:</span>
                          <span className="text-[var(--accent-color,#FF9F43)]">{calculateCost(m.pricing.prompt)}</span>
                        </div>
                      </div>
                    ))}
                    {!loadingModels && filteredModels.length === 0 && (
                      <div className="text-xs text-gray-500 text-center py-4">No models found.</div>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-500 leading-relaxed mt-2 text-center">
                    *Estimated cost for a full 5,000 turn campaign utilizing max 32k context and 90% smart cache discount.
                  </p>
                </div>
              )}

              {activeProvider === 'gemini' && (
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Select Gemini Model</label>
                    {loadingGeminiModels && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />}
                  </div>
                  {!geminiKey ? (
                    <div className="text-xs text-[var(--accent-color,#FF9F43)] bg-[var(--accent-color,#FF9F43)]/10 p-3 rounded-lg border border-[var(--accent-color,#FF9F43)]/30">
                      Please enter a Gemini API Key in the Global Config to fetch models.
                    </div>
                  ) : geminiFetchError ? (
                    <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/30">
                      Failed to fetch models: {geminiFetchError}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {dynamicGeminiModels.map(m => (
                        <div
                          key={m.id}
                          onClick={() => setActiveModel(m.id)}
                          className={clsx(
                            'flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer shadow-sm hover:shadow-md',
                            activeModel === m.id ? 'bg-[var(--accent-color,#FF9F43)]/10 border-[var(--accent-color,#FF9F43)]/50' : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Cpu className={clsx('w-3.5 h-3.5 shrink-0', activeModel === m.id ? 'text-[var(--accent-color,#FF9F43)] drop-shadow-[0_0_5px_var(--accent-color)]' : 'text-gray-500')} />
                            <span className={clsx('text-xs font-bold', activeModel === m.id ? 'text-[#e2e8f0]' : 'text-gray-400')}>{m.name}</span>
                          </div>
                          {activeModel === m.id && (
                            <span className="text-[8px] text-[var(--accent-color,#FF9F43)] font-bold tracking-widest bg-[var(--accent-color,#FF9F43)]/10 px-1.5 py-0.5 rounded shrink-0">CURRENT</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(activeProvider === 'huggingface' || activeProvider === 'local') && (
                <div className="space-y-3 mt-2">
                  <label className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                    {activeProvider === 'huggingface' ? 'Hugging Face Model ID' : 'Local Model ID'}
                  </label>
                  <input
                    type="text"
                    placeholder={activeProvider === 'huggingface' ? 'e.g. meta-llama/Llama-3-8B-Instruct' : 'e.g. Meta-Llama-3-8B-Instruct-GGUF'}
                    value={activeModel}
                    onChange={e => setActiveModel(e.target.value)}
                    className={clsx(inputClass, 'font-mono')}
                  />
                  <p className="text-[9px] text-gray-500 leading-relaxed">
                    {activeProvider === 'huggingface'
                      ? 'Type the exact model ID from the Hugging Face model hub.'
                      : 'Provide the exact model identifier as loaded in LM Studio or Ollama.'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <h3 className="text-xs font-semibold text-gray-300 border-b border-white/5 pb-2">Generation Settings</h3>

              <div className="group">
                <div className="flex justify-between text-[11px] text-gray-400 mb-3 font-medium tracking-wide">
                  <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors" /> MAX CONTEXT TOKENS</span>
                  <span className="font-mono tabular-nums text-[#e2e8f0]">{maxContextTokens.toLocaleString()} tokens</span>
                </div>
                <input type="range" min="1024" max="131072" step="1024" value={maxContextTokens} onChange={e => setMaxContextTokens(Number(e.target.value))} className={sliderClass} style={{ '--slider-pct': sliderPct(maxContextTokens, 1024, 131072) } as React.CSSProperties} />
              </div>

              <div className="group">
                <div className="flex justify-between text-[11px] text-gray-400 mb-3 font-medium tracking-wide">
                  <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors" /> SAFETY FILTERS</span>
                  <span className="font-mono tabular-nums text-[#e2e8f0]">{['Off', 'Moderate', 'Strict'][safetyLevel]}</span>
                </div>
                <input type="range" min="0" max="2" step="1" value={safetyLevel} onChange={e => setSafetyLevel(Number(e.target.value))} className={sliderClass} style={{ '--slider-pct': sliderPct(safetyLevel, 0, 2) } as React.CSSProperties} />
              </div>

              <label className="flex items-center justify-between text-sm text-[#cbd5e1] cursor-pointer pt-4 border-t border-white/5 group">
                <span className="flex items-center gap-2 group-hover:text-white transition-colors text-[13px]"><Settings className="w-4 h-4 text-gray-500" /> Smart Cache Blocks</span>
                <div className="relative inline-block w-8 h-4">
                  <input type="checkbox" className="peer sr-only" defaultChecked disabled />
                  <div className="block bg-[var(--accent-color,#FF9F43)]/20 w-full h-full rounded-full transition-colors border border-[var(--accent-color,#FF9F43)] opacity-50 cursor-not-allowed"></div>
                  <div className="dot absolute left-1 top-1 bg-[var(--accent-color,#FF9F43)] w-2 h-2 rounded-full translate-x-4 shadow-[0_0_8px_var(--accent-color)] opacity-50"></div>
                </div>
              </label>
            </div>
          </>
        )}

        {/* Appearance tab */}
        {activeGameplayTab === 'appearance' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-gray-300 tracking-wide mb-1">Base Theme</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div onClick={() => setBaseTheme('legacy')} className={clsx('theme-tile-dark relative overflow-hidden p-4 rounded-xl border transition-all cursor-pointer sm:col-span-2 aspect-[21/9] sm:aspect-auto sm:h-32 flex flex-col justify-end shadow-sm hover:shadow-lg bg-white/5', baseTheme === 'legacy' ? 'border-[var(--accent-color,#FF9F43)] shadow-[0_0_20px_rgba(0,0,0,0.5)]' : 'border-white/5 hover:border-white/20')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#11161d] to-[#07090c]"></div>
                  <div className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] blur-[20px] rounded-[100%] pointer-events-none mix-blend-screen bg-purple-500/30" />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="font-bold text-[13px] tracking-wide text-white drop-shadow-md">Borealis</span>
                  </div>
                </div>

                <div onClick={() => setBaseTheme('familiar')} className={clsx('theme-tile-dark relative overflow-hidden p-4 rounded-xl border transition-all cursor-pointer aspect-video flex flex-col justify-end shadow-sm hover:shadow-lg bg-[#0B0E11]', baseTheme === 'familiar' ? 'border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.5)]' : 'border-white/5 hover:border-white/20')}>
                  <div className="relative z-10"><span className="font-bold text-[13px] tracking-wide text-white drop-shadow-md">Familiar</span></div>
                </div>

                <div onClick={() => setBaseTheme('polaris')} className={clsx('relative overflow-hidden p-4 rounded-xl border transition-all cursor-pointer aspect-video flex flex-col justify-end shadow-sm hover:shadow-lg backdrop-blur-xl bg-white/40', baseTheme === 'polaris' ? 'border-[#0066D6] shadow-[0_8px_30px_rgba(0,102,214,0.3)]' : 'border-black/10 hover:border-black/20')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gradient-to-br from-[#0066D6] to-[#004a9f] shadow-[0_2px_8px_rgba(0,102,214,0.4)]"></div>
                  <div className="relative z-10"><span className="font-bold text-[13px] tracking-wide text-[#1D1D1F]">Polaris</span></div>
                </div>

                <div onClick={() => setBaseTheme('mono')} className={clsx('theme-tile-dark relative overflow-hidden p-4 rounded-none border-2 transition-all cursor-pointer aspect-video flex flex-col justify-end shadow-sm hover:shadow-lg bg-black', baseTheme === 'mono' ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]' : 'border-white/20 hover:border-white/40')}>
                  <div className="relative z-10"><span className="font-mono font-bold text-[13px] tracking-wide text-white">Mono</span></div>
                </div>

                <div onClick={() => setBaseTheme('classic')} className={clsx('relative overflow-hidden p-4 border-2 transition-all cursor-pointer aspect-video flex flex-col justify-end bg-[#c0c0c0]', baseTheme === 'classic' ? 'border-t-black border-l-black border-b-white border-r-white' : 'border-t-white border-l-white border-b-gray-500 border-r-gray-500')}>
                  <div className="relative z-10"><span className="font-bold text-[13px] text-black" style={{ fontFamily: "'MS Sans Serif', Tahoma, sans-serif" }}>Classic</span></div>
                </div>

              </div>
            </div>

            {baseTheme === 'legacy' && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-semibold text-gray-300 tracking-wide mb-1">Borealis Color Variants</h3>
                <div className="grid grid-cols-4 gap-4 justify-items-center pt-2 pb-4">
                  {themes.map(t => {
                    const isActive = themeVariant === t.id
                    return (
                      <div key={t.id} onClick={() => setThemeVariant(t.id)} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div
                          className={clsx(
                            'relative overflow-hidden w-12 h-12 rounded-full border-[2.5px] transition-all duration-300 flex items-center justify-center',
                            isActive ? 'shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] border-white scale-110' : 'border-white/10 hover:border-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.4)] group-hover:shadow-md'
                          )}
                          style={{ backgroundColor: isActive ? t.color : `${t.color}99` }}
                        >
                          <div className="absolute inset-0 rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),inset_0_4px_8px_rgba(255,255,255,0.4)] pointer-events-none mix-blend-overlay" />
                        </div>
                        <span className={clsx('text-[10px] font-bold tracking-wide transition-colors', isActive ? 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'text-gray-500 group-hover:text-gray-300')}>{t.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {baseTheme === 'classic' && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-semibold text-gray-300 tracking-wide mb-1">Classic Variants</h3>
                <div className="grid grid-cols-3 gap-4 pb-4">
                  {[
                    { id: '95', name: 'Windows 95', color: '#c0c0c0', secondary: '#000080' },
                    { id: 'chicago', name: 'Chicago', color: '#c0c0c0', secondary: '#008080' },
                    { id: 'hotdog', name: 'Hot Dog Stand', color: '#FF0000', secondary: '#FFFF00' }
                  ].map(v => (
                    <div key={v.id} onClick={() => setThemeVariant(v.id as any)} className="flex flex-col items-center gap-2 cursor-pointer group">
                      <div className={clsx('w-full aspect-video border-[3px] transition-all bg-[#008080]', themeVariant === v.id ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] scale-105' : 'border-white/20 group-hover:border-white/50')}>
                        <div className="w-full h-full flex flex-col p-1 gap-1 relative z-10" style={{ backgroundColor: v.color }}>
                          <div className="w-full h-[30%] shadow-sm" style={{ backgroundColor: v.secondary }}></div>
                          <div className="flex-1 bg-white shadow-inner"></div>
                        </div>
                      </div>
                      <span className={clsx('text-[10px] font-bold tracking-wide text-center', themeVariant === v.id ? 'text-white drop-shadow-md' : 'text-gray-500 group-hover:text-gray-300')}>{v.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {baseTheme === 'mono' && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-semibold text-gray-300 tracking-wide mb-1">Mono Variants</h3>
                <div className="grid grid-cols-2 gap-4">
                  {monoVariants.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setThemeVariant(t.id)}
                      className={clsx('relative overflow-hidden p-4 rounded-none border-2 transition-all cursor-pointer aspect-[4/3] flex flex-col justify-end', t.bg)}
                      style={{ borderColor: themeVariant === t.id ? t.color : undefined }}
                    >
                      <div className="relative z-10">
                        <span className="font-mono font-bold text-[13px] tracking-wide" style={{ color: t.color }}>{t.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-500 leading-relaxed mt-4">Selecting a theme updates the global CSS variables and textures instantly across all UI components.</p>
          </div>
        )}

        {/* Advanced tab */}
        {activeGameplayTab === 'advanced' && (
          <div className="space-y-6 pb-12">
            <h3 className="text-xs font-semibold text-gray-300 tracking-wide border-b border-white/5 pb-2">Advanced Generation Parameters</h3>

            {[
              { label: 'MAX RESPONSE LENGTH', val: maxResponseLength, set: setMaxResponseLength, min: 50, max: 2000, step: 10, fmt: (v: number) => `${v} tokens`, desc: "Maximum length of the AI's generated turn. Incomplete sentences at the limit will be trimmed cleanly." },
              { label: 'TEMPERATURE', val: temperature, set: setTemperature, min: 0, max: 2, step: 0.01, fmt: (v: number) => v.toFixed(2), desc: 'Controls randomness. Lower is more deterministic, higher is more creative.' },
              { label: 'TOP P (NUCLEUS)', val: topP, set: setTopP, min: 0, max: 1, step: 0.01, fmt: (v: number) => v.toFixed(2), desc: 'Limits token selection to the top cumulative probability mass.' },
              { label: 'TOP K', val: topK, set: setTopK, min: 0, max: 100, step: 1, fmt: (v: number) => String(v), desc: 'Limits token selection to the K most likely tokens. Set 0 to disable.' },
              { label: 'MIN P', val: minP, set: setMinP, min: 0, max: 1, step: 0.01, fmt: (v: number) => v.toFixed(2), desc: 'Filters out tokens with probability below this fraction of the most likely token.' },
              { label: 'TOP A', val: topA, set: setTopA, min: 0, max: 1, step: 0.01, fmt: (v: number) => v.toFixed(2), desc: 'Alternative to Top P based on the highest probability token.' },
              { label: 'REPETITION PENALTY', val: repetitionPenalty, set: setRepetitionPenalty, min: 1, max: 2, step: 0.01, fmt: (v: number) => v.toFixed(2), desc: 'Penalizes tokens that have already appeared in the text.' },
              { label: 'FREQUENCY PENALTY', val: frequencyPenalty, set: setFrequencyPenalty, min: -2, max: 2, step: 0.01, fmt: (v: number) => v.toFixed(2), desc: "Decreases the model's likelihood to repeat the same line verbatim." },
              { label: 'PRESENCE PENALTY', val: presencePenalty, set: setPresencePenalty, min: -2, max: 2, step: 0.01, fmt: (v: number) => v.toFixed(2), desc: "Increases the model's likelihood to talk about new topics." },
            ].map(s => (
              <div key={s.label} className="group space-y-2">
                <div className="flex justify-between text-[11px] text-gray-400 font-medium tracking-wide">
                  <span>{s.label}</span>
                  <span className="font-mono tabular-nums text-[var(--accent-color,#FF9F43)]">{s.fmt(s.val)}</span>
                </div>
                <input
                  type="range" min={s.min} max={s.max} step={s.step} value={s.val}
                  onChange={e => s.set(Number(e.target.value))}
                  className={sliderClass}
                  style={{ '--slider-pct': sliderPct(s.val, s.min, s.max) } as React.CSSProperties}
                />
                <p className="text-[9px] text-gray-500">{s.desc}</p>
              </div>
            ))}

            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">Debug Mode</p>
                  <p className="text-[9px] text-gray-500 mt-0.5">Shows raw AI output including backend state blocks. Disable to see clean story text.</p>
                </div>
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className={clsx('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200', debugMode ? 'bg-orange-500' : 'bg-white/10')}
                >
                  <span className={clsx('pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform duration-200', debugMode ? 'translate-x-4' : 'translate-x-0')} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useEngineStore } from '../../store/engineStore'
import { X, Key, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { TrafficLightControls } from './TrafficLightControls'

interface GlobalSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  theme?: 'light' | 'dark'
}

export default function GlobalSettingsModal({ isOpen, onClose, theme = 'dark' }: GlobalSettingsModalProps) {
  const { openRouterKey, setOpenRouterKey, geminiKey, setGeminiKey, hfKey, setHfKey, localEndpoint, setLocalEndpoint } = useEngineStore()

  const [localOpenRouterKey, setLocalOpenRouterKey] = useState(openRouterKey)
  const [localGeminiKey, setLocalGeminiKey] = useState(geminiKey)
  const [localHfKey, setLocalHfKey] = useState(hfKey)
  const [localLocalEndpoint, setLocalLocalEndpoint] = useState(localEndpoint)

  useEffect(() => {
    if (isOpen) {
      setLocalOpenRouterKey(openRouterKey)
      setLocalGeminiKey(geminiKey)
      setLocalHfKey(hfKey)
      setLocalLocalEndpoint(localEndpoint)
    }
  }, [isOpen, openRouterKey, geminiKey, hfKey, localEndpoint])

  // dump all the local state back up to the zustand store
  const handleSave = () => {
    setOpenRouterKey(localOpenRouterKey)
    setGeminiKey(localGeminiKey)
    setHfKey(localHfKey)
    setLocalEndpoint(localLocalEndpoint)
    onClose()
  }

  if (!isOpen) return null

  const isLight = theme === 'light'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={clsx('fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto', isLight ? 'bg-stone-900/60' : 'bg-black/60')}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            'w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col pointer-events-auto',
            isLight ? 'bg-stone-50 border-stone-200' : 'bg-[#111418] border-white/10'
          )}
        >
          <div className={clsx('p-6 border-b flex items-center justify-between shrink-0', isLight ? 'border-stone-200 bg-white' : 'border-white/5 bg-white/[0.02]')}>
            <div>
              <h2 className={clsx('text-xl font-bold tracking-wide', isLight ? 'text-stone-900 font-serif' : 'text-white')}>Global Settings</h2>
              <p className={clsx('text-xs font-medium mt-1', isLight ? 'text-stone-500' : 'text-gray-500')}>Configure your API keys and local preferences.</p>
            </div>
            <TrafficLightControls
              onClose={onClose}
              fallback={
                <button onClick={onClose} className={clsx('p-2 rounded-xl transition-colors', isLight ? 'text-stone-500 hover:text-stone-900 hover:bg-stone-100' : 'text-gray-500 hover:text-white hover:bg-white/10')}>
                  <X className="w-5 h-5" />
                </button>
              }
            />
          </div>

          <div className="p-6 space-y-6">
            {[
              { label: 'OpenRouter API Key', icon: 'text-[var(--accent-color,#FF9F43)]', placeholder: 'sk-or-v1-...', value: localOpenRouterKey, onChange: setLocalOpenRouterKey, focusColor: 'focus:border-orange-400 focus:shadow-[0_0_15px_rgba(249,115,22,0.15)]' },
              { label: 'Gemini API Key', icon: 'text-blue-400', placeholder: 'AIzaSy...', value: localGeminiKey, onChange: setLocalGeminiKey, focusColor: 'focus:border-blue-400 focus:shadow-[0_0_15px_rgba(96,165,250,0.15)]' },
              { label: 'Hugging Face Access Token', icon: 'text-yellow-400', placeholder: 'hf_...', value: localHfKey, onChange: setLocalHfKey, focusColor: 'focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(250,204,21,0.15)]' },
            ].map(field => (
              <div key={field.label} className="space-y-2">
                <label className={clsx('text-[11px] flex items-center gap-1.5 font-bold tracking-widest uppercase', isLight ? 'text-stone-500' : 'text-gray-400')}>
                  <Key className={clsx('w-3.5 h-3.5', field.icon)} /> {field.label}
                </label>
                <input
                  type="password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  className={clsx(
                    'w-full rounded-xl p-3 text-sm outline-none transition-all font-mono',
                    isLight
                      ? `bg-white border border-stone-200 text-stone-900 ${field.focusColor} focus:bg-stone-50`
                      : `bg-black/30 border border-white/10 text-gray-200 focus:bg-black/50 ${field.focusColor}`
                  )}
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className={clsx('text-[11px] flex items-center gap-1.5 font-bold tracking-widest uppercase', isLight ? 'text-stone-500' : 'text-gray-400')}>
                <Key className="w-3.5 h-3.5 text-green-400" /> Local Model Endpoint
              </label>
              <input
                type="text"
                value={localLocalEndpoint}
                onChange={(e) => setLocalLocalEndpoint(e.target.value)}
                placeholder="http://localhost:1234/v1"
                className={clsx(
                  'w-full rounded-xl p-3 text-sm outline-none transition-all font-mono',
                  isLight
                    ? 'bg-white border border-stone-200 text-stone-900 focus:border-green-400 focus:bg-stone-50 focus:shadow-[0_0_15px_rgba(74,222,128,0.15)]'
                    : 'bg-black/30 border border-white/10 text-gray-200 focus:border-green-400/50 focus:bg-black/50 focus:shadow-[0_0_15px_rgba(74,222,128,0.15)]'
                )}
              />
              <p className={clsx('text-[10px] font-medium ml-1', isLight ? 'text-stone-500' : 'text-gray-500')}>
                Use <span className={isLight ? 'text-stone-900 font-bold' : 'text-gray-300'}>http://localhost:1234/v1</span> for LM Studio or <span className={isLight ? 'text-stone-900 font-bold' : 'text-gray-300'}>http://localhost:11434/v1</span> for Ollama.
              </p>
            </div>
          </div>

          <div className={clsx('p-5 border-t flex justify-end gap-3', isLight ? 'border-stone-200 bg-white' : 'border-white/5 bg-white/[0.02]')}>
            <button
              onClick={onClose}
              className={clsx('px-5 py-2 text-xs font-bold transition-colors', isLight ? 'text-stone-500 hover:text-stone-900' : 'text-gray-400 hover:text-white')}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={clsx('px-5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg', isLight ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm' : 'text-black bg-[var(--accent-color,#FF9F43)] hover:brightness-110 hover:shadow-[0_0_15px_rgba(255,159,67,0.4)]')}
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

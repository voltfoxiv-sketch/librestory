import { clsx } from 'clsx'
import { X, Minus, Plus } from 'lucide-react'
import { useEngineStore } from '../../store/engineStore'

interface TrafficLightControlsProps {
  onClose?: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  className?: string
  fallback?: React.ReactNode
}

export function TrafficLightControls({ onClose, onMinimize, onMaximize, className, fallback }: TrafficLightControlsProps) {
  const { baseTheme } = useEngineStore()

  if (baseTheme !== 'polaris' && fallback) {
    return <>{fallback}</>
  }

  // fake macOS window controls (12px circles with hover icons)
  return (
    <div className={clsx('flex items-center gap-2 group/traffic traffic-light shrink-0', className)}>
      <button
        onClick={onClose}
        className={clsx(
          'w-3 h-3 rounded-full flex items-center justify-center transition-all traffic-light shadow-sm outline-none',
          onClose ? 'cursor-pointer' : 'cursor-default',
          'bg-[#FF5F57] border-[0.5px] border-black/10'
        )}
      >
        <X className="w-[8px] h-[8px] text-black/60 opacity-0 group-hover/traffic:opacity-100 transition-opacity" strokeWidth={3} />
      </button>
      <button
        onClick={onMinimize}
        className={clsx(
          'w-3 h-3 rounded-full flex items-center justify-center transition-all traffic-light shadow-sm outline-none',
          onMinimize ? 'cursor-pointer' : 'cursor-default',
          'bg-[#FEBC2E] border-[0.5px] border-black/10'
        )}
      >
        <Minus className="w-[8px] h-[8px] text-black/60 opacity-0 group-hover/traffic:opacity-100 transition-opacity" strokeWidth={3} />
      </button>
      <button
        onClick={onMaximize}
        className={clsx(
          'w-3 h-3 rounded-full flex items-center justify-center transition-all traffic-light shadow-sm outline-none',
          onMaximize ? 'cursor-pointer' : 'cursor-default',
          'bg-[#28C840] border-[0.5px] border-black/10'
        )}
      >
        <Plus className="w-[8px] h-[8px] text-black/60 opacity-0 group-hover/traffic:opacity-100 transition-opacity" strokeWidth={3} />
      </button>
    </div>
  )
}

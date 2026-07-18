
import { clsx } from 'clsx'
import { Shield, Sword, Diamond } from 'lucide-react'
import { useEngineStore } from '../../../store/engineStore'
import { getIconForName, getRarityForName, rarityColors } from '../../../lib/itemHeuristics'

interface EquipmentPanelProps {
  isExpanded: boolean
}

export function EquipmentPanel({ isExpanded }: EquipmentPanelProps) {
  const equipment = useEngineStore(s => s.equipment)

  // simple lookup array for mapping the grid
  const slots = [
    { key: 'head',      label: 'Head',      item: equipment?.head,      fallbackIcon: Shield  },
    { key: 'torso',     label: 'Torso',     item: equipment?.torso,     fallbackIcon: Shield  },
    { key: 'legs',      label: 'Legs',      item: equipment?.legs,      fallbackIcon: Shield  },
    { key: 'feet',      label: 'Feet',      item: equipment?.feet,      fallbackIcon: Shield  },
    { key: 'mainhand',  label: 'Main Hand', item: equipment?.mainhand,  fallbackIcon: Sword   },
    { key: 'offhand',   label: 'Off Hand',  item: equipment?.offhand,   fallbackIcon: Shield  },
    { key: 'accessory', label: 'Accessory', item: equipment?.accessory, fallbackIcon: Diamond },
  ]

  return (
    <section className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl p-5 shrink-0 transition-all duration-300 relative overflow-hidden">
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-center mb-5 relative z-10">
        <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
          <Shield className="w-3.5 h-3.5 text-yellow-400" /> Equipment
        </h3>
      </div>

      <div className={clsx('grid gap-3 relative z-10', isExpanded ? 'grid-cols-4 sm:grid-cols-4 gap-4' : 'grid-cols-2')}>
        {slots.map(slot => {
          const isEquipped = !!slot.item
          const rarity = isEquipped ? getRarityForName(slot.item!) : 'none'
          const Icon = isEquipped ? getIconForName(slot.item!) : slot.fallbackIcon

          return (
            <div
              key={slot.key}
              title={slot.item ? `${slot.label}: ${slot.item}` : `Empty ${slot.label}`}
              className={clsx(
                'aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-300 relative backdrop-blur-sm',
                rarityColors[rarity],
                isEquipped ? 'cursor-help group hover:-translate-y-1 hover:z-20' : 'opacity-60'
              )}
            >
              <span className={clsx(
                'absolute top-1 left-1.5 font-bold uppercase tracking-widest text-white/30',
                isExpanded ? 'text-[8px]' : 'text-[6px]'
              )}>
                {slot.label}
              </span>

              <Icon className={clsx(
                'transition-all duration-300',
                isExpanded ? 'w-10 h-10 mb-2 mt-2' : 'w-6 h-6 mt-1',
                isEquipped ? 'opacity-90 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_currentColor] group-hover:scale-110' : 'opacity-20'
              )} />

              {isExpanded && isEquipped && (
                <span className="text-[10px] font-bold text-center px-1 opacity-90 leading-tight drop-shadow-md pb-1">{slot.item}</span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

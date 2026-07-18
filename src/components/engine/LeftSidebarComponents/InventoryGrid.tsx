
import { clsx } from 'clsx'
import { Package } from 'lucide-react'
import { useEngineStore } from '../../../store/engineStore'
import { GiGoldBar, GiEmptyWoodBucket } from 'react-icons/gi'
import { getIconForName, getRarityForName, rarityColors } from '../../../lib/itemHeuristics'

interface InventoryGridProps {
  isExpanded: boolean
}

export function InventoryGrid({ isExpanded }: InventoryGridProps) {
  const inventory = useEngineStore(s => s.inventory || [])
  const goldCoins = useEngineStore(s => s.goldCoins || 0)

  let items = inventory.map(item => ({
    id: item.id,
    name: item.name,
    icon: getIconForName(item.name),
    rarity: getRarityForName(item.name)
  }))

  if (goldCoins > 0) {
    items = [{ id: 'gold-pouch', name: `Pouch (${goldCoins}g)`, icon: GiGoldBar, rarity: 'legendary' }, ...items]
  }

  // if their bag is totally empty, just show some placeholder buckets
  if (items.length === 0) {
    items = [
      { id: 'empty-1', name: 'Empty', icon: GiEmptyWoodBucket, rarity: 'none' },
      { id: 'empty-2', name: 'Empty', icon: GiEmptyWoodBucket, rarity: 'none' },
      { id: 'empty-3', name: 'Empty', icon: GiEmptyWoodBucket, rarity: 'none' },
    ]
  }

  return (
    <section className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl p-5 shrink-0 transition-all duration-300 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-center mb-5 relative z-10">
        <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
          <Package className="w-3.5 h-3.5 text-blue-400" /> Inventory
        </h3>
      </div>

      <div className={clsx('grid gap-3 relative z-10', isExpanded ? 'grid-cols-4 sm:grid-cols-6 gap-4' : 'grid-cols-3')}>
        {items.map(item => (
          <div
            key={item.id}
            title={item.name}
            className={clsx(
              'aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-300 cursor-help group relative backdrop-blur-sm',
              rarityColors[item.rarity],
              item.rarity !== 'none' && 'hover:-translate-y-1 hover:z-20'
            )}
          >
            <item.icon className={clsx(
              'transition-all duration-300',
              isExpanded ? 'w-10 h-10 mb-2' : 'w-6 h-6',
              item.rarity !== 'none' ? 'opacity-80 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_currentColor] group-hover:scale-110' : 'opacity-30'
            )} />
            {isExpanded && item.rarity !== 'none' && (
              <span className="text-[10px] font-bold text-center px-1 opacity-90 leading-tight drop-shadow-md">{item.name}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

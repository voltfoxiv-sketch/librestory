
import { clsx } from 'clsx'
import { Shield, Sword, Diamond, User } from 'lucide-react'
import { useEngineStore } from '../../../store/engineStore'
import { GiGoldBar, GiLeatherArmor } from 'react-icons/gi'
import { getIconForName, getRarityForName, rarityColors } from '../../../lib/itemHeuristics'
import type { Equipment } from '../../../store/engineStore'

interface CharacterSheetProps {
  isExpanded: boolean
}

export function CharacterSheet({ isExpanded }: CharacterSheetProps) {
  const equipment = useEngineStore(s => s.equipment)
  const inventory = useEngineStore(s => s.inventory || [])
  const goldCoins = useEngineStore(s => s.goldCoins || 0)

  const renderEquipSlot = (slotKey: keyof Equipment, label: string, FallbackIcon: React.ElementType) => {
    const item = equipment?.[slotKey]
    const isEquipped = !!item
    const rarity = isEquipped ? getRarityForName(item!) : 'none'
    const Icon = isEquipped ? getIconForName(item!) : FallbackIcon

    return (
      <div
        title={item ? `${label}: ${item}` : `Empty ${label}`}
        className={clsx(
          'aspect-square rounded-md border flex flex-col items-center justify-center transition-all duration-300 relative',
          isEquipped ? rarityColors[rarity] : 'bg-black/80 border-white/5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)]',
          isEquipped && 'cursor-help group hover:-translate-y-1 hover:z-20 hover:scale-110',
          !isExpanded && 'w-10 h-10'
        )}
      >
        {isExpanded && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 text-[7px] font-bold uppercase tracking-widest text-gray-400 px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap z-10">
            {label}
          </span>
        )}
        <Icon className={clsx(
          'transition-all duration-300',
          isExpanded ? 'w-8 h-8' : 'w-5 h-5',
          isEquipped ? 'opacity-90 group-hover:opacity-100 group-hover:drop-shadow-[0_0_12px_currentColor]' : 'opacity-10 text-white'
        )} />
        {isExpanded && isEquipped && (
          <span className="absolute -bottom-2 w-[120%] text-center bg-black/90 border border-white/10 text-[9px] font-bold text-gray-100 leading-none drop-shadow-md py-0.5 rounded shadow-2xl z-10 break-words">
            {item}
          </span>
        )}
      </div>
    )
  }

  // safely map out inventory since sometimes it comes in wonky
  let bagItems = inventory.filter(Boolean).map(item => ({
    id: item.id || crypto.randomUUID(),
    name: item.name || 'Unknown',
    icon: getIconForName(item.name || ''),
    rarity: getRarityForName(item.name || '')
  }))

  if (goldCoins > 0) {
    bagItems = [{ id: 'gold-pouch', name: `Pouch (${goldCoins}g)`, icon: GiGoldBar, rarity: 'legendary' }, ...bagItems]
  }

  const TOTAL_SLOTS = 24
  const gridSlots = []
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    gridSlots.push(bagItems[i] || null)
  }

  return (
    <section className="bg-[#111113]/90 backdrop-blur-xl border border-white/10 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl p-5 shrink-0 flex flex-col transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/themes/dust.png')] opacity-5 mix-blend-overlay pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-center mb-6 relative z-10 border-b border-white/5 pb-3">
        <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
          <User className="w-4 h-4 text-indigo-400" /> Character & Bags
        </h3>
      </div>

      <div className={clsx('flex flex-col gap-8 relative z-10', isExpanded && 'xl:flex-row xl:items-start')}>

        <div className="flex-1 flex flex-col items-center">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Equipment</div>
          <div className={clsx('grid grid-cols-3 gap-y-6 gap-x-4', isExpanded ? 'w-full max-w-[220px]' : 'w-auto')}>
            <div />{renderEquipSlot('head', 'Head', GiLeatherArmor)}<div />
            {renderEquipSlot('mainhand', 'Main Hand', Sword)}{renderEquipSlot('torso', 'Torso', GiLeatherArmor)}{renderEquipSlot('offhand', 'Off Hand', Shield)}
            <div />{renderEquipSlot('legs', 'Legs', GiLeatherArmor)}<div />
            <div />{renderEquipSlot('feet', 'Feet', GiLeatherArmor)}{renderEquipSlot('accessory', 'Accessory', Diamond)}
          </div>
        </div>

        {isExpanded && <div className="hidden xl:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent self-stretch" />}
        {!isExpanded && <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />}

        <div className="flex-[1.5] flex flex-col items-center w-full">
          <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Backpack</div>
          <div className={clsx('grid gap-2 w-full', isExpanded ? 'grid-cols-6 sm:grid-cols-6' : 'grid-cols-4')}>
            {gridSlots.map((item, idx) => {
              if (!item) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className={clsx(
                      'aspect-square rounded-md bg-black/70 border border-white/5 shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)]',
                      !isExpanded && 'w-8 h-8'
                    )}
                  />
                )
              }
              return (
                <div
                  key={item.id}
                  title={item.name}
                  className={clsx(
                    'aspect-square rounded-md border flex flex-col items-center justify-center transition-all duration-300 cursor-help group relative',
                    rarityColors[item.rarity],
                    'hover:-translate-y-1 hover:z-20 hover:scale-110',
                    !isExpanded && 'w-8 h-8'
                  )}
                >
                  <item.icon className={clsx(
                    'transition-all duration-300',
                    isExpanded ? 'w-7 h-7' : 'w-4 h-4',
                    item.rarity !== 'none' ? 'opacity-90 group-hover:opacity-100 group-hover:drop-shadow-[0_0_10px_currentColor]' : 'opacity-30'
                  )} />
                  {isExpanded && item.rarity !== 'none' && (
                    <span className="absolute -bottom-1 w-[130%] text-center bg-black/90 border border-white/10 text-[8px] font-bold text-gray-200 leading-tight drop-shadow-md py-0.5 rounded shadow-2xl z-10 break-words leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.name}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}

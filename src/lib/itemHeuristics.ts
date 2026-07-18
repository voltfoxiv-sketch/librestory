import { Package, Map, Compass, Hammer, Axe, Shirt, Feather, Skull, Droplet, Lock, Flame, Wrench } from 'lucide-react'
import {
  GiBroadsword, GiCheckedShield, GiHealthPotion, GiSpellBook,
  GiEmerald, GiEmptyWoodBucket, GiBowArrow, GiOrbWand,
  GiKey, GiGoldBar, GiOpenTreasureChest, GiLeatherArmor,
  GiRing, GiNecklace, GiAppleCore, GiWaterFlask
} from 'react-icons/gi'

// Yeah this is basically a giant match block but whatever, it works
export const getIconForName = (name: string) => {
  if (!name) return GiEmptyWoodBucket
  const n = name.toLowerCase()

  const match = (...words: string[]) => words.some(w => n.includes(w))

  if (match('sword', 'blade', 'dagger', 'rapier', 'katana', 'scimitar', 'claymore', 'knife', 'shiv')) return GiBroadsword
  if (match('bow', 'arrow', 'quiver', 'crossbow', 'longbow')) return GiBowArrow
  if (match('axe', 'hatchet', 'halberd', 'tomahawk', 'cleaver')) return Axe
  if (match('hammer', 'mace', 'club', 'maul', 'warhammer', 'bludgeon')) return Hammer

  if (match('shield', 'buckler', 'aegis', 'defender')) return GiCheckedShield
  if (match('armor', 'mail', 'plate', 'cuirass', 'chestplate', 'vest', 'tunic')) return GiLeatherArmor
  if (match('helmet', 'helm', 'cap', 'hood', 'coif', 'crown', 'tiara')) return GiLeatherArmor
  if (match('boot', 'shoe', 'sandal', 'footwear')) return GiLeatherArmor
  if (match('glove', 'gauntlet', 'bracer', 'mitt')) return GiLeatherArmor
  if (match('cloak', 'cape', 'robe', 'mantle', 'clothes', 'shirt', 'pants', 'skirt', 'dress')) return Shirt

  if (match('potion', 'elixir', 'flask', 'vial', 'brew', 'tonic', 'phial', 'draught')) return GiHealthPotion
  if (match('scroll', 'book', 'tome', 'grimoire', 'journal', 'diary', 'page', 'letter', 'note', 'parchment')) return GiSpellBook
  if (match('wand', 'staff', 'rod', 'scepter', 'orb', 'crystal ball')) return GiOrbWand
  if (match('gem', 'crystal', 'stone', 'diamond', 'ruby', 'sapphire', 'emerald', 'jewel', 'opal')) return GiEmerald

  if (match('key', 'passkey', 'keycard')) return GiKey
  if (match('lock', 'padlock')) return Lock
  if (match('gold', 'coin', 'money', 'silver', 'copper', 'cash', 'currency', 'ducat', 'credit')) return GiGoldBar
  if (match('ring', 'band', 'loop', 'signet')) return GiRing
  if (match('necklace', 'amulet', 'pendant', 'chain', 'choker', 'talisman', 'locket')) return GiNecklace
  if (match('chest', 'box', 'crate', 'coffer', 'trunk', 'sack', 'bag', 'pouch', 'wallet', 'backpack', 'satchel')) return GiOpenTreasureChest

  if (match('water', 'drink', 'beverage', 'juice', 'wine', 'ale', 'beer', 'mead', 'liquor')) return GiWaterFlask
  if (match('food', 'apple', 'meat', 'bread', 'cheese', 'ration', 'meal', 'fruit', 'vegetable', 'carrot', 'potato', 'soup', 'stew', 'pie', 'cake')) return GiAppleCore

  if (match('map', 'chart', 'blueprint')) return Map
  if (match('compass')) return Compass
  if (match('torch', 'lantern', 'lamp', 'candle', 'light', 'match', 'flame', 'fire')) return Flame
  if (match('feather', 'quill', 'plume')) return Feather
  if (match('bone', 'skull', 'skeleton', 'remains', 'corpse')) return Skull
  if (match('blood', 'tear', 'drop', 'liquid')) return Droplet
  if (match('tool', 'wrench', 'pickaxe', 'shovel', 'spade', 'crowbar', 'wire')) return Wrench

  return Package
}

// guess the rarity based on the name string. not foolproof but good enough for 99% of cases
export const getRarityForName = (name: string) => {
  if (!name) return 'none'
  const n = name.toLowerCase()
  if (n.includes('mythic') || n.includes('god') || n.includes('divine')) return 'epic'
  if (n.includes('epic') || n.includes('mystic') || n.includes('ancient') || n.includes('legendary')) return 'legendary'
  if (n.includes('rare') || n.includes('magic') || n.includes('silver')) return 'rare'
  if (n.includes('uncommon') || n.includes('steel') || n.includes('iron')) return 'uncommon'
  if (n.includes('rusty') || n.includes('wooden') || n.includes('old') || n.includes('cloth')) return 'common'
  return 'common'
}

export const rarityColors: Record<string, string> = {
  common:    'text-gray-400 border-gray-400/20 bg-gradient-to-br from-gray-400/10 to-transparent hover:from-gray-400/20 hover:border-gray-400/40 hover:shadow-[0_0_15px_rgba(156,163,175,0.2)]',
  uncommon:  'text-green-400 border-green-400/20 bg-gradient-to-br from-green-400/10 to-transparent hover:from-green-400/20 hover:border-green-400/40 hover:shadow-[0_0_15px_rgba(74,222,128,0.2)]',
  rare:      'text-blue-400 border-blue-400/20 bg-gradient-to-br from-blue-400/10 to-transparent hover:from-blue-400/20 hover:border-blue-400/40 hover:shadow-[0_0_15px_rgba(96,165,250,0.2)]',
  epic:      'text-purple-400 border-purple-400/20 bg-gradient-to-br from-purple-400/10 to-transparent hover:from-purple-400/20 hover:border-purple-400/40 hover:shadow-[0_0_15px_rgba(192,132,252,0.2)]',
  legendary: 'text-yellow-400 border-yellow-400/30 bg-gradient-to-br from-yellow-400/15 to-transparent hover:from-yellow-400/30 hover:border-yellow-400/60 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]',
  none:      'text-white/10 border-white/5 bg-black/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]'
}

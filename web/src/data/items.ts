export type ItemId =
  | 'tavern_tab'
  | 'second_thought'
  | 'tip_the_judge'
  | 'insurance'
  | 'lucky_coin'
  | 'heirloom_dagger'
  | 'smoke_bomb'
  | 'gilded_goblet'
  | 'pocket_sand'
  | 'loaded_dice'
  | 'charm_amulet'
  | 'emergency_ale'
  | 'wanted_poster'
  | 'mimic_tooth'
  | 'silver_tongue'
  | 'crowbar_of_destiny'
  | 'flask_of_courage'
  | 'bargain_bin_wand'
  | 'ration_of_regret'
  | 'bribe_purse'
  | 'echo_charm'

export type ItemKind = 'consumable' | 'passive'

export interface ItemDef {
  id: ItemId
  name: string
  kind: ItemKind
  cost: number
  description: string
}

/** Original party-game loot catalog. */
export const ITEM_CATALOG: ItemDef[] = [
  {
    id: 'tavern_tab',
    name: 'Tavern Tab',
    kind: 'consumable',
    cost: 3,
    description: 'Draw 2 Action cards.',
  },
  {
    id: 'second_thought',
    name: 'Second Thought',
    kind: 'consumable',
    cost: 4,
    description: 'Before reveal: return your face-down submission to hand (play again).',
  },
  {
    id: 'tip_the_judge',
    name: 'Tip the Judge',
    kind: 'consumable',
    cost: 5,
    description: 'This round, AI judges heavily favor your submission.',
  },
  {
    id: 'insurance',
    name: 'Insurance Policy',
    kind: 'consumable',
    cost: 4,
    description: 'If you don’t win this round, pocket 3 gold anyway.',
  },
  {
    id: 'lucky_coin',
    name: 'Lucky Coin',
    kind: 'consumable',
    cost: 5,
    description: 'Discard your hand and draw back up to 7.',
  },
  {
    id: 'smoke_bomb',
    name: 'Smoke Bomb',
    kind: 'consumable',
    cost: 3,
    description: 'Gain 2 gold immediately. Chaos tax write-off.',
  },
  {
    id: 'pocket_sand',
    name: 'Pocket Sand',
    kind: 'consumable',
    cost: 3,
    description: 'Draw 1 Action and gain 1 gold. Classic.',
  },
  {
    id: 'loaded_dice',
    name: 'Loaded Dice',
    kind: 'consumable',
    cost: 4,
    description: 'Draw 3, then discard 1 of your choice from hand.',
  },
  {
    id: 'emergency_ale',
    name: 'Emergency Ale',
    kind: 'consumable',
    cost: 2,
    description: 'Gain 1 gold. Morale restored. Judgment impaired.',
  },
  {
    id: 'wanted_poster',
    name: 'Wanted Poster',
    kind: 'consumable',
    cost: 4,
    description: 'Gain 4 gold. Reputation: complicated.',
  },
  {
    id: 'flask_of_courage',
    name: 'Flask of Courage',
    kind: 'consumable',
    cost: 3,
    description: 'Draw 1. Tip the Judge activates for free this round.',
  },
  {
    id: 'bargain_bin_wand',
    name: 'Bargain-Bin Wand',
    kind: 'consumable',
    cost: 5,
    description: 'Draw 2. Discard a random hand card. Magic!',
  },
  {
    id: 'ration_of_regret',
    name: 'Ration of Regret',
    kind: 'consumable',
    cost: 2,
    description: 'Gain 2 gold. Taste notes: ash and poor choices.',
  },
  {
    id: 'bribe_purse',
    name: 'Bribe Purse',
    kind: 'consumable',
    cost: 6,
    description: 'Spend to tip the judge hard: AI crowns you if possible.',
  },
  {
    id: 'echo_charm',
    name: 'Echo Charm',
    kind: 'consumable',
    cost: 4,
    description: 'Draw 1. If you win this round, draw 1 more after.',
  },
  {
    id: 'heirloom_dagger',
    name: 'Heirloom Dagger',
    kind: 'passive',
    cost: 7,
    description: 'Passive: +1 gold whenever you win a round.',
  },
  {
    id: 'gilded_goblet',
    name: 'Gilded Goblet',
    kind: 'passive',
    cost: 6,
    description: 'Passive: +1 gold at the start of each round.',
  },
  {
    id: 'charm_amulet',
    name: 'Charm Amulet',
    kind: 'passive',
    cost: 8,
    description: 'Passive: when you win, also draw 1 Action.',
  },
  {
    id: 'mimic_tooth',
    name: 'Mimic Tooth',
    kind: 'passive',
    cost: 6,
    description: 'Passive: +1 gold whenever you buy from the shop.',
  },
  {
    id: 'silver_tongue',
    name: 'Silver Tongue',
    kind: 'passive',
    cost: 7,
    description: 'Passive: shop prices are 1g cheaper (min 1g).',
  },
  {
    id: 'crowbar_of_destiny',
    name: 'Crowbar of Destiny',
    kind: 'passive',
    cost: 8,
    description: 'Passive: +1 gold on round wins; looks illegal.',
  },
]

export function getItem(id: ItemId): ItemDef {
  return ITEM_CATALOG.find((i) => i.id === id)!
}

export const LOOT_DROP_POOL: ItemId[] = [
  'tavern_tab',
  'tavern_tab',
  'smoke_bomb',
  'smoke_bomb',
  'pocket_sand',
  'pocket_sand',
  'emergency_ale',
  'ration_of_regret',
  'ration_of_regret',
  'insurance',
  'second_thought',
  'tip_the_judge',
  'lucky_coin',
  'loaded_dice',
  'wanted_poster',
  'flask_of_courage',
  'bargain_bin_wand',
  'bribe_purse',
  'echo_charm',
]

export const STARTING_GOLD = 5
export const ROUND_WIN_GOLD = 3
export const MATCH_WIN_BONUS_GOLD = 10

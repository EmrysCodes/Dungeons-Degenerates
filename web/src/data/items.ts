export type ItemId =
  | 'tavern_tab'
  | 'second_thought'
  | 'tip_the_judge'
  | 'insurance'
  | 'lucky_coin'
  | 'heirloom_dagger'
  | 'smoke_bomb'
  | 'gilded_goblet'

export type ItemKind = 'consumable' | 'passive'

export interface ItemDef {
  id: ItemId
  name: string
  kind: ItemKind
  cost: number
  description: string
}

/** Original party-game loot — inspired by “gold + items” fantasy economy, not Goblinko TTS cards. */
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
    description: 'Before reveal: return your face-down submission to hand (you may play again).',
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
    description: 'Gain 2 gold immediately. Pure chaos tax write-off.',
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
    description: 'Passive: start each round with +1 gold from “tips.”',
  },
]

export function getItem(id: ItemId): ItemDef {
  return ITEM_CATALOG.find((i) => i.id === id)!
}

/** Random loot drops when winning a round (weighted cheaper). */
export const LOOT_DROP_POOL: ItemId[] = [
  'tavern_tab',
  'tavern_tab',
  'smoke_bomb',
  'smoke_bomb',
  'insurance',
  'second_thought',
  'tip_the_judge',
  'lucky_coin',
]

export const STARTING_GOLD = 5
export const ROUND_WIN_GOLD = 3
export const MATCH_WIN_BONUS_GOLD = 10

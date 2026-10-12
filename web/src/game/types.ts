import type { Role } from '../data/roles'
import type { ItemId } from '../data/items'

export type PlayerId = 'you' | 'ai1' | 'ai2'

export interface CardData {
  id: number
  text: string
  image: string
}

export interface OwnedItem {
  uid: string
  itemId: ItemId
  /** Consumables become used; passives stay */
  used: boolean
}

export interface PlayerState {
  id: PlayerId
  name: string
  role: Role
  hand: CardData[]
  loot: number
  gold: number
  items: OwnedItem[]
  /** Role perk already used this round */
  perkUsedThisRound: boolean
  /** Tip the Judge active this round */
  tipJudgeActive: boolean
  /** Insurance armed this round */
  insuranceArmed: boolean
}

/** Anonymous table slot — owner is hidden until a winner is named. */
export interface SubmissionSlot {
  slotId: string
  ownerId: PlayerId
  card: CardData
  revealed: boolean
}

export type Phase =
  | 'title'
  | 'dealing'
  | 'selecting'
  | 'waiting'
  | 'revealing'
  | 'judging'
  | 'roundResult'
  | 'shop'
  | 'victory'

export interface GameState {
  phase: Phase
  round: number
  scenario: CardData | null
  players: Record<PlayerId, PlayerState>
  judgeId: PlayerId
  actionPile: CardData[]
  actionDiscard: CardData[]
  scenarioPile: CardData[]
  scenarioDiscard: CardData[]
  submissions: SubmissionSlot[]
  revealIndex: number
  lastWinner: PlayerId | null
  lastWinningSlotId: string | null
  /** Last round reward summary for UI */
  lastRewardText: string
  /** Shop offers this visit */
  shopOffers: ItemId[]
  statusText: string
  /** Pending rogue switcheroo mode */
  switcherooArmed: boolean
  /** Pending barbarian: waiting for discard pick */
  recklessDiscardPending: boolean
}

export const PLAYER_ORDER: PlayerId[] = ['you', 'ai1', 'ai2']
export const HAND_SIZE = 7
export const LOOT_TO_WIN = 5

import type { Role } from '../data/roles'

export type PlayerId = 'you' | 'ai1' | 'ai2'

export interface CardData {
  id: number
  text: string
  image: string
}

export interface PlayerState {
  id: PlayerId
  name: string
  role: Role
  hand: CardData[]
  loot: number
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
  /** Shuffled anonymous submission slots for this round */
  submissions: SubmissionSlot[]
  revealIndex: number
  lastWinner: PlayerId | null
  /** Winning slot id (for brief highlight before naming) */
  lastWinningSlotId: string | null
  statusText: string
}

export const PLAYER_ORDER: PlayerId[] = ['you', 'ai1', 'ai2']
export const HAND_SIZE = 7
export const LOOT_TO_WIN = 5

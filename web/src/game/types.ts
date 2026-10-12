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
  played: CardData | null
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
  scenarioPile: CardData[]
  revealQueue: PlayerId[]
  revealIndex: number
  lastWinner: PlayerId | null
  statusText: string
}

export const PLAYER_ORDER: PlayerId[] = ['you', 'ai1', 'ai2']
export const HAND_SIZE = 7
export const LOOT_TO_WIN = 5

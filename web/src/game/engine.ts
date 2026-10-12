import actions from '../data/actions.json'
import scenarios from '../data/scenarios.json'
import { ROLES, type Role } from '../data/roles'
import {
  HAND_SIZE,
  LOOT_TO_WIN,
  PLAYER_ORDER,
  type CardData,
  type GameState,
  type Phase,
  type PlayerId,
  type PlayerState,
} from './types'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function cloneCards(cards: CardData[]): CardData[] {
  return cards.map((c) => ({ ...c }))
}

function drawOne(pile: CardData[], master: CardData[]): { card: CardData; pile: CardData[] } {
  let next = [...pile]
  if (next.length === 0) {
    next = shuffle(cloneCards(master))
  }
  const card = next.pop()!
  return { card, pile: next }
}

function drawMany(
  pile: CardData[],
  master: CardData[],
  count: number,
): { cards: CardData[]; pile: CardData[] } {
  let nextPile = pile
  const cards: CardData[] = []
  for (let i = 0; i < count; i += 1) {
    const drawn = drawOne(nextPile, master)
    cards.push(drawn.card)
    nextPile = drawn.pile
  }
  return { cards, pile: nextPile }
}

function assignRoles(): Record<PlayerId, Role> {
  const roles = shuffle(ROLES)
  return {
    you: roles[0],
    ai1: roles[1],
    ai2: roles[2],
  }
}

function nextJudge(current: PlayerId): PlayerId {
  const idx = PLAYER_ORDER.indexOf(current)
  return PLAYER_ORDER[(idx + 1) % PLAYER_ORDER.length]
}

function participants(judgeId: PlayerId): PlayerId[] {
  return PLAYER_ORDER.filter((id) => id !== judgeId)
}

export function createInitialState(): GameState {
  return {
    phase: 'title',
    round: 0,
    scenario: null,
    players: {
      you: emptyPlayer('you', 'You'),
      ai1: emptyPlayer('ai1', 'Sir Regrettable'),
      ai2: emptyPlayer('ai2', 'Lady Chaos'),
    },
    judgeId: 'you',
    actionPile: [],
    scenarioPile: [],
    revealQueue: [],
    revealIndex: 0,
    lastWinner: null,
    statusText: '',
  }
}

function emptyPlayer(id: PlayerId, name: string): PlayerState {
  return {
    id,
    name,
    role: ROLES[0],
    hand: [],
    loot: 0,
    played: null,
    revealed: false,
  }
}

export function startMatch(): GameState {
  const roles = assignRoles()
  const actionMaster = cloneCards(actions as CardData[])
  const scenarioMaster = cloneCards(scenarios as CardData[])
  let actionPile = shuffle(actionMaster)
  let scenarioPile = shuffle(scenarioMaster)

  const players = {} as Record<PlayerId, PlayerState>
  for (const id of PLAYER_ORDER) {
    const drawn = drawMany(actionPile, actionMaster, HAND_SIZE)
    actionPile = drawn.pile
    const names: Record<PlayerId, string> = {
      you: 'You',
      ai1: 'Sir Regrettable',
      ai2: 'Lady Chaos',
    }
    players[id] = {
      id,
      name: names[id],
      role: roles[id],
      hand: drawn.cards,
      loot: 0,
      played: null,
      revealed: false,
    }
  }

  const base: GameState = {
    phase: 'dealing',
    round: 0,
    scenario: null,
    players,
    judgeId: 'you',
    actionPile,
    scenarioPile,
    revealQueue: [],
    revealIndex: 0,
    lastWinner: null,
    statusText: 'Dealing chaos…',
  }

  return beginRound(base)
}

export function beginRound(state: GameState): GameState {
  const scenarioMaster = scenarios as CardData[]
  const drawn = drawOne(state.scenarioPile, scenarioMaster)
  const players = { ...state.players }
  for (const id of PLAYER_ORDER) {
    players[id] = {
      ...players[id],
      played: null,
      revealed: false,
    }
  }

  const judgeId = state.round === 0 ? 'you' : nextJudge(state.judgeId)
  const judgeName = players[judgeId].name
  const isPlayerJudge = judgeId === 'you'

  return {
    ...state,
    phase: isPlayerJudge ? 'waiting' : 'selecting',
    round: state.round + 1,
    scenario: drawn.card,
    scenarioPile: drawn.pile,
    players,
    judgeId,
    revealQueue: [],
    revealIndex: 0,
    lastWinner: null,
    statusText: isPlayerJudge
      ? `You are the Judge. Waiting for degenerates to play…`
      : `${judgeName} is judging. Play your most unhinged Action.`,
  }
}

/** When player is judge, AI auto-plays after a beat. */
export function autoPlayNonJudges(state: GameState): GameState {
  if (state.phase !== 'waiting' && state.phase !== 'selecting') return state
  const players = { ...state.players }
  for (const id of participants(state.judgeId)) {
    if (id === 'you') continue
    if (players[id].played) continue
    const hand = [...players[id].hand]
    if (hand.length === 0) continue
    const pick = Math.floor(Math.random() * hand.length)
    const [card] = hand.splice(pick, 1)
    players[id] = { ...players[id], hand, played: card, revealed: false }
  }

  const allIn = participants(state.judgeId).every((id) => players[id].played)
  if (!allIn) {
    return { ...state, players, phase: 'waiting', statusText: 'Degenerates are scheming…' }
  }

  return startReveal({ ...state, players })
}

export function playPlayerCard(state: GameState, handIndex: number): GameState {
  if (state.phase !== 'selecting') return state
  if (state.judgeId === 'you') return state

  const you = state.players.you
  if (handIndex < 0 || handIndex >= you.hand.length) return state

  const hand = [...you.hand]
  const [card] = hand.splice(handIndex, 1)
  const players = {
    ...state.players,
    you: { ...you, hand, played: card, revealed: false },
  }

  // AI plays immediately after (timing handled in UI)
  return { ...state, players, phase: 'waiting', statusText: 'Cards hit the table face-down…' }
}

function startReveal(state: GameState): GameState {
  const queue = shuffle(participants(state.judgeId))
  return {
    ...state,
    phase: 'revealing',
    revealQueue: queue,
    revealIndex: 0,
    statusText: 'Revealing submissions…',
  }
}

export function revealNext(state: GameState): GameState {
  if (state.phase !== 'revealing') return state
  const id = state.revealQueue[state.revealIndex]
  if (!id) {
    return enterJudging(state)
  }

  const players = {
    ...state.players,
    [id]: { ...state.players[id], revealed: true },
  }
  const nextIndex = state.revealIndex + 1
  const done = nextIndex >= state.revealQueue.length

  if (done) {
    return enterJudging({
      ...state,
      players,
      revealIndex: nextIndex,
    })
  }

  return {
    ...state,
    players,
    revealIndex: nextIndex,
    statusText: `${players[id].name} reveals…`,
  }
}

function enterJudging(state: GameState): GameState {
  const judge = state.players[state.judgeId]
  return {
    ...state,
    phase: 'judging',
    statusText:
      state.judgeId === 'you'
        ? 'Judge the chaos. Pick the winning Action.'
        : `${judge.name} is judging…`,
  }
}

export function judgePick(state: GameState, winnerId: PlayerId): GameState {
  if (state.phase !== 'judging') return state
  if (winnerId === state.judgeId) return state
  if (!state.players[winnerId].played) return state

  const players = { ...state.players }
  players[winnerId] = {
    ...players[winnerId],
    loot: players[winnerId].loot + 1,
  }

  const winner = players[winnerId]
  const victory = winner.loot >= LOOT_TO_WIN

  return {
    ...state,
    players,
    lastWinner: winnerId,
    phase: victory ? 'victory' : 'roundResult',
    statusText: victory
      ? `${winner.name} wins the match with ${winner.loot} Loot Tokens!`
      : `${winner.name} takes the Loot Token!`,
  }
}

export function aiJudgePick(state: GameState): GameState {
  if (state.phase !== 'judging' || state.judgeId === 'you') return state
  const options = participants(state.judgeId)
  const winnerId = options[Math.floor(Math.random() * options.length)]
  return judgePick(state, winnerId)
}

export function advanceAfterRound(state: GameState): GameState {
  if (state.phase !== 'roundResult') return state

  const actionMaster = actions as CardData[]
  let actionPile = state.actionPile
  const players = { ...state.players }

  for (const id of PLAYER_ORDER) {
    const p = players[id]
    const need = HAND_SIZE - p.hand.length
    if (need > 0) {
      const drawn = drawMany(actionPile, actionMaster, need)
      actionPile = drawn.pile
      players[id] = { ...p, hand: [...p.hand, ...drawn.cards], played: null, revealed: false }
    } else {
      players[id] = { ...p, played: null, revealed: false }
    }
  }

  return beginRound({
    ...state,
    players,
    actionPile,
  })
}

export function setPhase(state: GameState, phase: Phase, statusText?: string): GameState {
  return { ...state, phase, statusText: statusText ?? state.statusText }
}

export function isPlayable(state: GameState): boolean {
  return state.phase === 'selecting' && state.judgeId !== 'you'
}

export function canJudge(state: GameState): boolean {
  return state.phase === 'judging' && state.judgeId === 'you'
}

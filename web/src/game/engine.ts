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
  type SubmissionSlot,
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

function drawOne(
  pile: CardData[],
  discard: CardData[],
  master: CardData[],
): { card: CardData; pile: CardData[]; discard: CardData[] } {
  let nextPile = [...pile]
  let nextDiscard = [...discard]
  if (nextPile.length === 0) {
    if (nextDiscard.length > 0) {
      nextPile = shuffle(nextDiscard)
      nextDiscard = []
    } else {
      nextPile = shuffle(cloneCards(master))
    }
  }
  const card = nextPile.pop()!
  return { card, pile: nextPile, discard: nextDiscard }
}

function drawMany(
  pile: CardData[],
  discard: CardData[],
  master: CardData[],
  count: number,
): { cards: CardData[]; pile: CardData[]; discard: CardData[] } {
  let nextPile = pile
  let nextDiscard = discard
  const cards: CardData[] = []
  for (let i = 0; i < count; i += 1) {
    const drawn = drawOne(nextPile, nextDiscard, master)
    cards.push(drawn.card)
    nextPile = drawn.pile
    nextDiscard = drawn.discard
  }
  return { cards, pile: nextPile, discard: nextDiscard }
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

function emptyPlayer(id: PlayerId, name: string): PlayerState {
  return {
    id,
    name,
    role: ROLES[0],
    hand: [],
    loot: 0,
  }
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
    actionDiscard: [],
    scenarioPile: [],
    scenarioDiscard: [],
    submissions: [],
    revealIndex: 0,
    lastWinner: null,
    lastWinningSlotId: null,
    statusText: '',
  }
}

export function startMatch(): GameState {
  const roles = assignRoles()
  const actionMaster = cloneCards(actions as CardData[])
  const scenarioMaster = cloneCards(scenarios as CardData[])
  let actionPile = shuffle(actionMaster)
  let scenarioPile = shuffle(scenarioMaster)
  const actionDiscard: CardData[] = []
  const scenarioDiscard: CardData[] = []

  const names: Record<PlayerId, string> = {
    you: 'You',
    ai1: 'Sir Regrettable',
    ai2: 'Lady Chaos',
  }

  const players = {} as Record<PlayerId, PlayerState>
  for (const id of PLAYER_ORDER) {
    const drawn = drawMany(actionPile, actionDiscard, actionMaster, HAND_SIZE)
    actionPile = drawn.pile
    players[id] = {
      id,
      name: names[id],
      role: roles[id],
      hand: drawn.cards,
      loot: 0,
    }
  }

  const base: GameState = {
    phase: 'dealing',
    round: 0,
    scenario: null,
    players,
    judgeId: 'you',
    actionPile,
    actionDiscard,
    scenarioPile,
    scenarioDiscard,
    submissions: [],
    revealIndex: 0,
    lastWinner: null,
    lastWinningSlotId: null,
    statusText: 'Dealing chaos…',
  }

  return beginRound(base)
}

/** Pending plays staged by owner before anonymous slot assignment. */
type PendingPlays = Partial<Record<PlayerId, CardData>>

function getPending(state: GameState): PendingPlays {
  const pending: PendingPlays = {}
  for (const sub of state.submissions) {
    pending[sub.ownerId] = sub.card
  }
  return pending
}

function setPending(state: GameState, pending: PendingPlays): GameState {
  // Keep face-down anonymous placeholders only for submitted cards, shuffled
  const owners = Object.keys(pending) as PlayerId[]
  const submissions: SubmissionSlot[] = shuffle(owners).map((ownerId, i) => ({
    slotId: `slot_${i}`,
    ownerId,
    card: pending[ownerId]!,
    revealed: false,
  }))
  return { ...state, submissions }
}

export function beginRound(state: GameState): GameState {
  const scenarioMaster = scenarios as CardData[]
  let scenarioDiscard = state.scenarioDiscard
  if (state.scenario) {
    scenarioDiscard = [...scenarioDiscard, state.scenario]
  }
  const drawn = drawOne(state.scenarioPile, scenarioDiscard, scenarioMaster)

  const judgeId = state.round === 0 ? 'you' : nextJudge(state.judgeId)
  const judgeName = state.players[judgeId].name
  const isPlayerJudge = judgeId === 'you'

  return {
    ...state,
    phase: isPlayerJudge ? 'waiting' : 'selecting',
    round: state.round + 1,
    scenario: drawn.card,
    scenarioPile: drawn.pile,
    scenarioDiscard: drawn.discard,
    submissions: [],
    revealIndex: 0,
    lastWinner: null,
    lastWinningSlotId: null,
    judgeId,
    statusText: isPlayerJudge
      ? 'You are the Judge. Waiting for anonymous submissions…'
      : `${judgeName} is judging. Play your most unhinged Action.`,
  }
}

export function autoPlayNonJudges(state: GameState): GameState {
  if (state.phase !== 'waiting' && state.phase !== 'selecting') return state

  const pending = getPending(state)
  const players = { ...state.players }

  for (const id of participants(state.judgeId)) {
    if (id === 'you') continue
    if (pending[id]) continue
    const hand = [...players[id].hand]
    if (hand.length === 0) continue
    // Prefer keyword-ish picks vs random for a bit of flavor
    const pick = pickAiActionIndex(hand, state.scenario)
    const [card] = hand.splice(pick, 1)
    players[id] = { ...players[id], hand }
    pending[id] = card
  }

  let next = setPending({ ...state, players }, pending)
  const allIn = participants(state.judgeId).every((id) => Boolean(pending[id]))
  if (!allIn) {
    return {
      ...next,
      phase: 'waiting',
      statusText: 'Degenerates are scheming face-down…',
    }
  }

  return startReveal(next)
}

export function playPlayerCard(state: GameState, handIndex: number): GameState {
  if (state.phase !== 'selecting') return state
  if (state.judgeId === 'you') return state

  const you = state.players.you
  if (handIndex < 0 || handIndex >= you.hand.length) return state

  const hand = [...you.hand]
  const [card] = hand.splice(handIndex, 1)
  const pending = getPending(state)
  pending.you = card

  const players = {
    ...state.players,
    you: { ...you, hand },
  }

  return setPending(
    {
      ...state,
      players,
      phase: 'waiting',
      statusText: 'Card locked face-down. Waiting for the table…',
    },
    pending,
  )
}

function startReveal(state: GameState): GameState {
  // Re-shuffle slot order at reveal start so submit order ≠ reveal order
  const reshuffled = shuffle(state.submissions).map((s, i) => ({
    ...s,
    slotId: `slot_${i}`,
    revealed: false,
  }))
  return {
    ...state,
    phase: 'revealing',
    submissions: reshuffled,
    revealIndex: 0,
    statusText: 'Revealing a card…',
  }
}

export function revealNext(state: GameState): GameState {
  if (state.phase !== 'revealing') return state
  if (state.revealIndex >= state.submissions.length) {
    return enterJudging(state)
  }

  const submissions = state.submissions.map((s, i) =>
    i === state.revealIndex ? { ...s, revealed: true } : s,
  )
  const nextIndex = state.revealIndex + 1
  const done = nextIndex >= submissions.length

  if (done) {
    return enterJudging({
      ...state,
      submissions,
      revealIndex: nextIndex,
    })
  }

  return {
    ...state,
    submissions,
    revealIndex: nextIndex,
    statusText: 'Revealing next card…',
  }
}

function enterJudging(state: GameState): GameState {
  const judge = state.players[state.judgeId]
  return {
    ...state,
    phase: 'judging',
    statusText:
      state.judgeId === 'you'
        ? 'Judge the chaos. Pick the winning Action — identities stay hidden.'
        : `${judge.name} is judging in secret…`,
  }
}

export function judgePickBySlot(state: GameState, slotId: string): GameState {
  if (state.phase !== 'judging') return state
  const slot = state.submissions.find((s) => s.slotId === slotId)
  if (!slot || !slot.revealed) return state
  if (slot.ownerId === state.judgeId) return state
  return finalizeWinner(state, slot.ownerId, slot.slotId)
}

export function judgePick(state: GameState, winnerId: PlayerId): GameState {
  if (state.phase !== 'judging') return state
  if (winnerId === state.judgeId) return state
  const slot = state.submissions.find((s) => s.ownerId === winnerId && s.revealed)
  if (!slot) return state
  return finalizeWinner(state, winnerId, slot.slotId)
}

function finalizeWinner(state: GameState, winnerId: PlayerId, slotId: string): GameState {
  const players = { ...state.players }
  players[winnerId] = {
    ...players[winnerId],
    loot: players[winnerId].loot + 1,
  }

  // Discard played actions
  const playedCards = state.submissions.map((s) => s.card)
  const actionDiscard = [...state.actionDiscard, ...playedCards]

  const winner = players[winnerId]
  const victory = winner.loot >= LOOT_TO_WIN

  return {
    ...state,
    players,
    actionDiscard,
    lastWinner: winnerId,
    lastWinningSlotId: slotId,
    phase: victory ? 'victory' : 'roundResult',
    statusText: victory
      ? `${winner.name} wins the match with ${winner.loot} Loot Tokens!`
      : `${winner.name} takes the Loot Token!`,
  }
}

/** Keyword-flavored AI judge — still chaotic, slightly thematic. */
export function aiJudgePick(state: GameState): GameState {
  if (state.phase !== 'judging' || state.judgeId === 'you') return state
  const options = state.submissions.filter((s) => s.revealed)
  if (options.length === 0) return state

  const scenarioText = (state.scenario?.text ?? '').toLowerCase()
  const scored = options.map((s) => {
    const text = s.card.text.toLowerCase()
    let score = Math.random() * 2
    const keywords = scenarioText.split(/[^a-z]+/).filter((w) => w.length > 4)
    for (const k of keywords) {
      if (text.includes(k)) score += 1.5
    }
    // Humor bias keywords
    for (const funny of ['seduce', 'chair', 'blame', 'drink', 'fake', 'curse', 'scream', 'gold']) {
      if (text.includes(funny)) score += 0.4
    }
    return { slot: s, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return finalizeWinner(state, scored[0].slot.ownerId, scored[0].slot.slotId)
}

function pickAiActionIndex(hand: CardData[], scenario: CardData | null): number {
  if (hand.length === 0) return 0
  const scenarioText = (scenario?.text ?? '').toLowerCase()
  const keywords = scenarioText.split(/[^a-z]+/).filter((w) => w.length > 4)
  let best = 0
  let bestScore = -1
  for (let i = 0; i < hand.length; i += 1) {
    const text = hand[i].text.toLowerCase()
    let score = Math.random()
    for (const k of keywords) {
      if (text.includes(k)) score += 1.2
    }
    if (score > bestScore) {
      bestScore = score
      best = i
    }
  }
  return best
}

export function advanceAfterRound(state: GameState): GameState {
  if (state.phase !== 'roundResult') return state

  const actionMaster = actions as CardData[]
  let actionPile = state.actionPile
  let actionDiscard = state.actionDiscard
  const players = { ...state.players }

  // Contenders already discarded their played cards in finalizeWinner.
  // Refill everyone who is short (judge didn't play, so only needs top-up if somehow short).
  for (const id of PLAYER_ORDER) {
    const p = players[id]
    const need = HAND_SIZE - p.hand.length
    if (need > 0) {
      const drawn = drawMany(actionPile, actionDiscard, actionMaster, need)
      actionPile = drawn.pile
      actionDiscard = drawn.discard
      players[id] = { ...p, hand: [...p.hand, ...drawn.cards] }
    }
  }

  return beginRound({
    ...state,
    players,
    actionPile,
    actionDiscard,
    submissions: [],
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

export function submittedCount(state: GameState): number {
  return state.submissions.length
}

export function expectedSubmitters(state: GameState): number {
  return participants(state.judgeId).length
}

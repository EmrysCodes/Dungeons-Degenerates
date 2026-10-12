import actions from '../data/actions.json'
import scenarios from '../data/scenarios.json'
import { EXTRA_ACTIONS, EXTRA_SCENARIOS } from '../data/extras'
import { ROLES, type Role, type RoleId } from '../data/roles'
import {
  ITEM_CATALOG,
  LOOT_DROP_POOL,
  MATCH_WIN_BONUS_GOLD,
  ROUND_WIN_GOLD,
  STARTING_GOLD,
  getItem,
  type ItemId,
} from '../data/items'
import {
  HAND_SIZE,
  LOOT_TO_WIN,
  PLAYER_ORDER,
  type CardData,
  type GameState,
  type OwnedItem,
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

let uidCounter = 0
function nextUid(): string {
  uidCounter += 1
  return `item_${uidCounter}_${Math.floor(Math.random() * 1e6)}`
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

function buildMasterDecks(): { actions: CardData[]; scenarios: CardData[] } {
  const baseActions = cloneCards(actions as CardData[])
  const baseScenarios = cloneCards(scenarios as CardData[])
  const extrasA: CardData[] = EXTRA_ACTIONS.map((c, i) => ({
    id: 1000 + i,
    text: c.text,
    image: 'text',
  }))
  const extrasS: CardData[] = EXTRA_SCENARIOS.map((c, i) => ({
    id: 2000 + i,
    text: c.text,
    image: 'text',
  }))
  return {
    actions: [...baseActions, ...extrasA],
    scenarios: [...baseScenarios, ...extrasS],
  }
}

function assignRoles(preferred?: RoleId | null): Record<PlayerId, Role> {
  if (preferred) {
    const yours = ROLES.find((r) => r.id === preferred) ?? ROLES[0]
    const rest = shuffle(ROLES.filter((r) => r.id !== yours.id))
    return { you: yours, ai1: rest[0], ai2: rest[1] }
  }
  const roles = shuffle(ROLES)
  return { you: roles[0], ai1: roles[1], ai2: roles[2] }
}

export interface MatchOptions {
  playerRole?: RoleId | null
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
    gold: STARTING_GOLD,
    items: [],
    perkUsedThisRound: false,
    tipJudgeActive: false,
    insuranceArmed: false,
    echoCharmArmed: false,
  }
}

function makeShopOffers(): ItemId[] {
  return shuffle(ITEM_CATALOG.map((i) => i.id)).slice(0, 4)
}

function grantItem(player: PlayerState, itemId: ItemId): PlayerState {
  const owned: OwnedItem = { uid: nextUid(), itemId, used: false }
  return { ...player, items: [...player.items, owned] }
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
    lastRewardText: '',
    shopOffers: [],
    statusText: '',
    switcherooArmed: false,
    recklessDiscardPending: false,
  }
}

export function startMatch(options: MatchOptions = {}): GameState {
  uidCounter = 0
  const roles = assignRoles(options.playerRole)
  const masters = buildMasterDecks()
  const actionMaster = masters.actions
  const scenarioMaster = masters.scenarios
  let actionPile = shuffle(cloneCards(actionMaster))
  let scenarioPile = shuffle(cloneCards(scenarioMaster))
  const actionDiscard: CardData[] = []

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
      gold: STARTING_GOLD,
      items: [],
      perkUsedThisRound: false,
      tipJudgeActive: false,
      insuranceArmed: false,
      echoCharmArmed: false,
    }
  }

  return beginRound({
    ...createInitialState(),
    phase: 'dealing',
    players,
    actionPile,
    actionDiscard,
    scenarioPile,
    scenarioDiscard: [],
    statusText: 'Dealing chaos…',
  })
}

export function deckCounts() {
  const masters = buildMasterDecks()
  return {
    actions: masters.actions.length,
    scenarios: masters.scenarios.length,
    items: ITEM_CATALOG.length,
  }
}

function actionMasterDeck(): CardData[] {
  return buildMasterDecks().actions
}

function scenarioMasterDeck(): CardData[] {
  return buildMasterDecks().scenarios
}

function effectiveShopCost(player: PlayerState, base: number): number {
  if (player.items.some((i) => i.itemId === 'silver_tongue' && !i.used)) {
    return Math.max(1, base - 1)
  }
  return base
}

type PendingPlays = Partial<Record<PlayerId, CardData>>

function getPending(state: GameState): PendingPlays {
  const pending: PendingPlays = {}
  for (const sub of state.submissions) {
    pending[sub.ownerId] = sub.card
  }
  return pending
}

function setPending(state: GameState, pending: PendingPlays): GameState {
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
  const scenarioMaster = scenarioMasterDeck()
  let scenarioDiscard = state.scenarioDiscard
  if (state.scenario) {
    scenarioDiscard = [...scenarioDiscard, state.scenario]
  }
  const drawn = drawOne(state.scenarioPile, scenarioDiscard, scenarioMaster)

  const judgeId = state.round === 0 ? 'you' : nextJudge(state.judgeId)
  const judgeName = state.players[judgeId].name
  const isPlayerJudge = judgeId === 'you'

  const players = { ...state.players }
  for (const id of PLAYER_ORDER) {
    const p = players[id]
    let gold = p.gold
    // Gilded Goblet passive
    if (p.items.some((i) => i.itemId === 'gilded_goblet' && !i.used)) {
      gold += 1
    }
    players[id] = {
      ...p,
      gold,
      perkUsedThisRound: false,
      tipJudgeActive: false,
      insuranceArmed: false,
      echoCharmArmed: false,
    }
  }

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
    lastRewardText: '',
    judgeId,
    players,
    switcherooArmed: false,
    recklessDiscardPending: false,
    statusText: isPlayerJudge
      ? 'You are the Judge. Waiting for anonymous submissions…'
      : `${judgeName} is judging. Play your most unhinged Action.`,
  }
}

export function autoPlayNonJudges(state: GameState): GameState {
  if (state.phase !== 'waiting' && state.phase !== 'selecting') return state

  const pending = getPending(state)
  let players = { ...state.players }
  let actionPile = state.actionPile
  let actionDiscard = state.actionDiscard
  const master = actionMasterDeck()

  for (const id of participants(state.judgeId)) {
    if (id === 'you') continue
    if (pending[id]) continue

    // AI may use Reckless Draw (barbarian) before playing
    let p = players[id]
    if (p.role.id === 'barbarian' && !p.perkUsedThisRound && p.hand.length >= 2 && Math.random() < 0.45) {
      const discardIdx = Math.floor(Math.random() * p.hand.length)
      const hand = [...p.hand]
      const [trashed] = hand.splice(discardIdx, 1)
      actionDiscard = [...actionDiscard, trashed]
      const drawn = drawMany(actionPile, actionDiscard, master, 2)
      actionPile = drawn.pile
      actionDiscard = drawn.discard
      p = { ...p, hand: [...hand, ...drawn.cards], perkUsedThisRound: true }
    }

    const hand = [...p.hand]
    if (hand.length === 0) {
      players[id] = p
      continue
    }
    const pick = pickAiActionIndex(hand, state.scenario)
    const [card] = hand.splice(pick, 1)
    players[id] = { ...p, hand }
    pending[id] = card

    // AI tip the judge sometimes
    if (players[id].items.some((i) => i.itemId === 'tip_the_judge' && !i.used) && Math.random() < 0.2) {
      players[id] = useConsumableOnPlayer(players[id], 'tip_the_judge')
      players[id] = { ...players[id], tipJudgeActive: true }
    }
  }

  let next = setPending({ ...state, players, actionPile, actionDiscard }, pending)
  const allIn = participants(state.judgeId).every((id) => Boolean(pending[id]))
  if (!allIn) {
    return {
      ...next,
      phase: 'waiting',
      statusText: 'Degenerates are scheming face-down…',
    }
  }

  // AI rogue switcheroo chance before reveal
  next = maybeAiSwitcheroo(next)

  return startReveal(next)
}

function maybeAiSwitcheroo(state: GameState): GameState {
  let players = { ...state.players }
  const pending = getPending(state)
  let changed = false
  for (const id of participants(state.judgeId)) {
    if (id === 'you') continue
    const p = players[id]
    if (p.role.id !== 'rogue' || p.perkUsedThisRound || !pending[id]) continue
    if (p.hand.length === 0 || Math.random() > 0.4) continue
    const hand = [...p.hand]
    const swapIdx = Math.floor(Math.random() * hand.length)
    const old = pending[id]!
    const [neu] = hand.splice(swapIdx, 1)
    hand.push(old)
    pending[id] = neu
    players[id] = { ...p, hand, perkUsedThisRound: true }
    changed = true
  }
  if (!changed) return state
  return setPending({ ...state, players }, pending)
}

export function playPlayerCard(state: GameState, handIndex: number): GameState {
  if (state.recklessDiscardPending) {
    return confirmRecklessDiscard(state, handIndex)
  }
  if (state.switcherooArmed) {
    return confirmSwitcheroo(state, handIndex)
  }
  if (state.phase !== 'selecting') return state
  if (state.judgeId === 'you') return state

  const you = state.players.you
  if (handIndex < 0 || handIndex >= you.hand.length) return state

  const hand = [...you.hand]
  const [card] = hand.splice(handIndex, 1)
  const pending = getPending(state)
  pending.you = card

  return setPending(
    {
      ...state,
      players: { ...state.players, you: { ...you, hand } },
      phase: 'waiting',
      statusText: 'Card locked face-down. Waiting for the table…',
    },
    pending,
  )
}

/** Barbarian: arm reckless draw — next hand click discards that card, then draw 2 */
export function armRecklessDraw(state: GameState): GameState {
  const you = state.players.you
  if (you.role.id !== 'barbarian') return state
  if (you.perkUsedThisRound) return state
  if (state.judgeId === 'you') return state
  if (you.hand.length < 1) return state
  if (state.phase !== 'selecting' && state.phase !== 'waiting') return state
  return {
    ...state,
    recklessDiscardPending: true,
    switcherooArmed: false,
    statusText: 'Reckless Draw: tap a card in hand to discard it, then draw 2.',
  }
}

function confirmRecklessDiscard(state: GameState, handIndex: number): GameState {
  const you = state.players.you
  if (handIndex < 0 || handIndex >= you.hand.length) return state
  const hand = [...you.hand]
  const [trashed] = hand.splice(handIndex, 1)
  let actionDiscard = [...state.actionDiscard, trashed]
  const drawn = drawMany(state.actionPile, actionDiscard, actionMasterDeck(), 2)
  return {
    ...state,
    actionPile: drawn.pile,
    actionDiscard: drawn.discard,
    recklessDiscardPending: false,
    players: {
      ...state.players,
      you: {
        ...you,
        hand: [...hand, ...drawn.cards],
        perkUsedThisRound: true,
      },
    },
    statusText: 'Reckless Draw spent. Bigger bad decisions acquired.',
  }
}

/** Rogue: arm switcheroo after submitting */
export function armSwitcheroo(state: GameState): GameState {
  const you = state.players.you
  if (you.role.id !== 'rogue') return state
  if (you.perkUsedThisRound) return state
  if (state.judgeId === 'you') return state
  const pending = getPending(state)
  if (!pending.you) return state
  if (state.phase !== 'waiting') return state
  if (you.hand.length < 1) return state
  return {
    ...state,
    switcherooArmed: true,
    recklessDiscardPending: false,
    statusText: 'Switcheroo: tap a hand card to swap with your face-down submission.',
  }
}

function confirmSwitcheroo(state: GameState, handIndex: number): GameState {
  const you = state.players.you
  if (handIndex < 0 || handIndex >= you.hand.length) return state
  const pending = getPending(state)
  if (!pending.you) return state
  const hand = [...you.hand]
  const [neu] = hand.splice(handIndex, 1)
  hand.push(pending.you)
  pending.you = neu
  return setPending(
    {
      ...state,
      switcherooArmed: false,
      players: {
        ...state.players,
        you: { ...you, hand, perkUsedThisRound: true },
      },
      statusText: 'Switcheroo done. Totally part of the plan.',
    },
    pending,
  )
}

function startReveal(state: GameState): GameState {
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
    switcherooArmed: false,
    recklessDiscardPending: false,
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
    return enterJudging({ ...state, submissions, revealIndex: nextIndex })
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
        ? 'YOUR CALL — tap Option A or B to crown the winner. Identities stay hidden.'
        : `${judge.name} is judging in secret…`,
  }
}

export function judgePickBySlot(state: GameState, slotId: string): GameState {
  if (state.phase !== 'judging') return state
  if (state.judgeId !== 'you') return state
  const slot = state.submissions.find((s) => s.slotId === slotId)
  if (!slot || !slot.revealed) return state
  return finalizeWinner(state, slot.ownerId, slot.slotId)
}

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
    for (const funny of ['seduce', 'chair', 'blame', 'drink', 'fake', 'curse', 'scream', 'gold']) {
      if (text.includes(funny)) score += 0.4
    }
    if (state.players[s.ownerId].tipJudgeActive) score += 5
    return { slot: s, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return finalizeWinner(state, scored[0].slot.ownerId, scored[0].slot.slotId)
}

function finalizeWinner(state: GameState, winnerId: PlayerId, slotId: string): GameState {
  let players = { ...state.players }
  const winner = players[winnerId]
  let goldGain = ROUND_WIN_GOLD
  const rewardBits: string[] = [`+${ROUND_WIN_GOLD}g`, '+1 Loot Token']

  // Passives on win
  if (winner.items.some((i) => i.itemId === 'heirloom_dagger' && !i.used)) {
    goldGain += 1
    rewardBits.push('+1g dagger')
  }
  if (winner.items.some((i) => i.itemId === 'crowbar_of_destiny' && !i.used)) {
    goldGain += 1
    rewardBits.push('+1g crowbar')
  }
  // Bard Crowd Favorite + Charm Amulet draws
  let actionPile = state.actionPile
  let actionDiscard = state.actionDiscard
  let drawBonus = 0
  if (winner.role.id === 'bard') {
    goldGain += 2
    rewardBits.push('+2g bard encore')
    drawBonus += 1
  }
  if (winner.items.some((i) => i.itemId === 'charm_amulet' && !i.used)) {
    drawBonus += 1
    rewardBits.push('+1 card charm')
  }
  if (winner.echoCharmArmed) {
    drawBonus += 1
    rewardBits.push('+1 card echo')
  }
  if (drawBonus > 0) {
    const drawn = drawMany(actionPile, actionDiscard, actionMasterDeck(), drawBonus)
    actionPile = drawn.pile
    actionDiscard = drawn.discard
    players[winnerId] = {
      ...winner,
      hand: [...winner.hand, ...drawn.cards],
    }
  }

  // Loot item drop
  const dropId = LOOT_DROP_POOL[Math.floor(Math.random() * LOOT_DROP_POOL.length)]
  const drop = getItem(dropId)
  players[winnerId] = grantItem(
    {
      ...players[winnerId],
      loot: players[winnerId].loot + 1,
      gold: players[winnerId].gold + goldGain,
    },
    dropId,
  )
  rewardBits.push(`item: ${drop.name}`)

  // Insurance for losers
  for (const id of participants(state.judgeId)) {
    if (id === winnerId) continue
    const p = players[id]
    if (p.insuranceArmed) {
      players[id] = { ...p, gold: p.gold + 3, insuranceArmed: false }
    }
  }

  const playedCards = state.submissions.map((s) => s.card)
  actionDiscard = [...actionDiscard, ...playedCards]

  const victory = players[winnerId].loot >= LOOT_TO_WIN
  if (victory) {
    players[winnerId] = {
      ...players[winnerId],
      gold: players[winnerId].gold + MATCH_WIN_BONUS_GOLD,
    }
    rewardBits.push(`+${MATCH_WIN_BONUS_GOLD}g match bonus`)
  }

  const rewardText = `${players[winnerId].name} wins — ${rewardBits.join(' · ')}`

  return {
    ...state,
    players,
    actionPile,
    actionDiscard,
    lastWinner: winnerId,
    lastWinningSlotId: slotId,
    lastRewardText: rewardText,
    phase: victory ? 'victory' : 'roundResult',
    statusText: victory
      ? `${players[winnerId].name} wins the match! ${rewardText}`
      : rewardText,
  }
}

export function enterShop(state: GameState): GameState {
  if (state.phase !== 'roundResult') return state
  // AI impulse-buys something affordable
  let players = { ...state.players }
  const offers = makeShopOffers()
  for (const id of ['ai1', 'ai2'] as PlayerId[]) {
    const p = players[id]
    const affordable = offers
      .map(getItem)
      .filter((item) => item.cost <= p.gold)
      .sort((a, b) => b.cost - a.cost)
    if (affordable.length && Math.random() < 0.55) {
      const buy = affordable[0]
      players[id] = grantItem({ ...p, gold: p.gold - buy.cost }, buy.id)
    }
  }
  return {
    ...state,
    phase: 'shop',
    players,
    shopOffers: offers,
    statusText: 'Tavern shop is open. Spend gold on dubious gear, or skip.',
  }
}

export function buyShopItem(state: GameState, itemId: ItemId): GameState {
  if (state.phase !== 'shop') return state
  if (!state.shopOffers.includes(itemId)) return state
  const def = getItem(itemId)
  const you = state.players.you
  const cost = effectiveShopCost(you, def.cost)
  if (you.gold < cost) return state
  let nextYou = grantItem({ ...you, gold: you.gold - cost }, itemId)
  if (nextYou.items.some((i) => i.itemId === 'mimic_tooth' && !i.used)) {
    nextYou = { ...nextYou, gold: nextYou.gold + 1 }
  }
  return {
    ...state,
    players: {
      ...state.players,
      you: nextYou,
    },
    shopOffers: state.shopOffers.filter((id) => id !== itemId),
    statusText: `Bought ${def.name} for ${cost}g. What could go wrong?`,
  }
}

export function shopCostFor(state: GameState, itemId: ItemId): number {
  return effectiveShopCost(state.players.you, getItem(itemId).cost)
}

export function leaveShop(state: GameState): GameState {
  if (state.phase !== 'shop') return state
  return advanceAfterRound({ ...state, phase: 'roundResult' })
}

export function advanceAfterRound(state: GameState): GameState {
  if (state.phase !== 'roundResult') return state

  const actionMaster = actionMasterDeck()
  let actionPile = state.actionPile
  let actionDiscard = state.actionDiscard
  const players = { ...state.players }

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

function useConsumableOnPlayer(player: PlayerState, itemId: ItemId): PlayerState {
  const idx = player.items.findIndex((i) => i.itemId === itemId && !i.used)
  if (idx < 0) return player
  const items = player.items.map((it, i) =>
    i === idx ? { ...it, used: true } : it,
  )
  // Remove used consumables from inventory display
  return { ...player, items: items.filter((i) => !i.used || getItem(i.itemId).kind === 'passive') }
}

export function usePlayerItem(state: GameState, uid: string): GameState {
  const you = state.players.you
  const owned = you.items.find((i) => i.uid === uid && !i.used)
  if (!owned) return state
  const def = getItem(owned.itemId)
  if (def.kind === 'passive') return state

  let next: GameState = { ...state }
  let player = { ...you }

  switch (owned.itemId) {
    case 'tavern_tab': {
      const drawn = drawMany(state.actionPile, state.actionDiscard, actionMasterDeck(), 2)
      next = { ...next, actionPile: drawn.pile, actionDiscard: drawn.discard }
      player = { ...player, hand: [...player.hand, ...drawn.cards] }
      next.statusText = 'Tavern Tab: +2 Actions. The bartender looks concerned.'
      break
    }
    case 'second_thought': {
      const pending = getPending(state)
      if (!pending.you || (state.phase !== 'waiting' && state.phase !== 'selecting')) {
        return { ...state, statusText: 'Second Thought only works with a face-down submission.' }
      }
      const hand = [...player.hand, pending.you]
      delete pending.you
      player = { ...player, hand }
      next = setPending(
        { ...next, phase: 'selecting', statusText: 'Second Thought: play a different Action.' },
        pending,
      )
      break
    }
    case 'tip_the_judge': {
      player = { ...player, tipJudgeActive: true }
      next.statusText = 'Tip the Judge slipped under the table.'
      break
    }
    case 'insurance': {
      player = { ...player, insuranceArmed: true }
      next.statusText = 'Insurance armed. Losing still pays… a little.'
      break
    }
    case 'lucky_coin': {
      let actionDiscard = [...state.actionDiscard, ...player.hand]
      const drawn = drawMany(state.actionPile, actionDiscard, actionMasterDeck(), HAND_SIZE)
      next = { ...next, actionPile: drawn.pile, actionDiscard: drawn.discard }
      player = { ...player, hand: drawn.cards }
      next.statusText = 'Lucky Coin flip — new hand of chaos.'
      break
    }
    case 'smoke_bomb': {
      player = { ...player, gold: player.gold + 2 }
      next.statusText = 'Smoke Bomb sold to a goblin for 2g. Textbook degeneracy.'
      break
    }
    case 'pocket_sand': {
      const drawn = drawMany(state.actionPile, state.actionDiscard, actionMasterDeck(), 1)
      next = { ...next, actionPile: drawn.pile, actionDiscard: drawn.discard }
      player = { ...player, hand: [...player.hand, ...drawn.cards], gold: player.gold + 1 }
      next.statusText = 'Pocket Sand: +1 card, +1g. Eyes everywhere.'
      break
    }
    case 'loaded_dice': {
      const drawn = drawMany(state.actionPile, state.actionDiscard, actionMasterDeck(), 3)
      let hand = [...player.hand, ...drawn.cards]
      let actionDiscard = drawn.discard
      if (hand.length > 0) {
        const toss = Math.floor(Math.random() * hand.length)
        const [trashed] = hand.splice(toss, 1)
        actionDiscard = [...actionDiscard, trashed]
      }
      next = { ...next, actionPile: drawn.pile, actionDiscard }
      player = { ...player, hand }
      next.statusText = 'Loaded Dice: drew 3, tossed 1. Totally fair.'
      break
    }
    case 'emergency_ale': {
      player = { ...player, gold: player.gold + 1 }
      next.statusText = 'Emergency Ale: +1g. Courage tastes like regret.'
      break
    }
    case 'wanted_poster': {
      player = { ...player, gold: player.gold + 4 }
      next.statusText = 'Wanted Poster cashed in for 4g. Lay low.'
      break
    }
    case 'flask_of_courage': {
      const drawn = drawMany(state.actionPile, state.actionDiscard, actionMasterDeck(), 1)
      next = { ...next, actionPile: drawn.pile, actionDiscard: drawn.discard }
      player = { ...player, hand: [...player.hand, ...drawn.cards], tipJudgeActive: true }
      next.statusText = 'Flask of Courage: +1 card and a wink at the judge.'
      break
    }
    case 'bargain_bin_wand': {
      const drawn = drawMany(state.actionPile, state.actionDiscard, actionMasterDeck(), 2)
      let hand = [...player.hand, ...drawn.cards]
      let actionDiscard = drawn.discard
      if (hand.length > 0) {
        const toss = Math.floor(Math.random() * hand.length)
        const [trashed] = hand.splice(toss, 1)
        actionDiscard = [...actionDiscard, trashed]
      }
      next = { ...next, actionPile: drawn.pile, actionDiscard }
      player = { ...player, hand }
      next.statusText = 'Bargain-Bin Wand: sparks, then a sneeze.'
      break
    }
    case 'ration_of_regret': {
      player = { ...player, gold: player.gold + 2 }
      next.statusText = 'Ration of Regret: +2g. Still tastes like ash.'
      break
    }
    case 'bribe_purse': {
      player = { ...player, tipJudgeActive: true }
      next.statusText = 'Bribe Purse emptied under the table. The scales tip.'
      break
    }
    case 'echo_charm': {
      const drawn = drawMany(state.actionPile, state.actionDiscard, actionMasterDeck(), 1)
      next = { ...next, actionPile: drawn.pile, actionDiscard: drawn.discard }
      player = {
        ...player,
        hand: [...player.hand, ...drawn.cards],
        echoCharmArmed: true,
      }
      next.statusText = 'Echo Charm: +1 card now, +1 more if you win.'
      break
    }
    default:
      return state
  }

  player = useConsumableOnPlayer(player, owned.itemId)
  return {
    ...next,
    players: { ...next.players, you: player },
  }
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

export function setPhase(state: GameState, phase: Phase, statusText?: string): GameState {
  return { ...state, phase, statusText: statusText ?? state.statusText }
}

export function isPlayable(state: GameState): boolean {
  if (state.recklessDiscardPending || state.switcherooArmed) return true
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

export function canUseReckless(state: GameState): boolean {
  const you = state.players.you
  return (
    you.role.id === 'barbarian' &&
    !you.perkUsedThisRound &&
    state.judgeId !== 'you' &&
    you.hand.length > 0 &&
    (state.phase === 'selecting' || state.phase === 'waiting') &&
    !state.recklessDiscardPending
  )
}

export function canUseSwitcheroo(state: GameState): boolean {
  const you = state.players.you
  return (
    you.role.id === 'rogue' &&
    !you.perkUsedThisRound &&
    state.judgeId !== 'you' &&
    state.phase === 'waiting' &&
    Boolean(getPending(state).you) &&
    you.hand.length > 0 &&
    !state.switcherooArmed
  )
}

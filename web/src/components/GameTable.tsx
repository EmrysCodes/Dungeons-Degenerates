import { CardView } from './CardView'
import { getItem } from '../data/items'
import type { GameState } from '../game/types'
import { LOOT_TO_WIN, PLAYER_ORDER } from '../game/types'
import {
  canJudge,
  canUseReckless,
  canUseSwitcheroo,
  expectedSubmitters,
  isPlayable,
  submittedCount,
} from '../game/engine'

interface Props {
  state: GameState
  onPlayCard: (index: number) => void
  onJudgeSlot: (slotId: string) => void
  onRestart: () => void
  onHowTo: () => void
  onReckless: () => void
  onSwitcheroo: () => void
  onUseItem: (uid: string) => void
}

export function GameTable({
  state,
  onPlayCard,
  onJudgeSlot,
  onRestart,
  onHowTo,
  onReckless,
  onSwitcheroo,
  onUseItem,
}: Props) {
  const judge = state.players[state.judgeId]
  const playable = isPlayable(state)
  const judging = canJudge(state)
  const showWinnerName = state.phase === 'roundResult' || state.phase === 'victory'
  const submitted = submittedCount(state)
  const expected = expectedSubmitters(state)
  const you = state.players.you

  return (
    <section className="game-table">
      <header className="top-bar">
        <div className="top-left">
          <span className="round-pill">Round {state.round}</span>
          <span className={`judge-pill ${judging ? 'judge-active' : ''}`}>
            Judge: <strong>{judge.name}</strong>
          </span>
        </div>
        <div className="brand-mini">Dungeons &amp; Degenerates</div>
        <div className="top-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onHowTo}>
            Rules
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRestart}>
            Restart
          </button>
        </div>
      </header>

      <div className="score-strip" aria-label="Scoreboard">
        {PLAYER_ORDER.map((id) => {
          const p = state.players[id]
          const isJudge = state.judgeId === id
          const isWinner = showWinnerName && state.lastWinner === id
          return (
            <div
              key={id}
              className={`score-chip ${isJudge ? 'is-judge' : ''} ${isWinner ? 'is-winner' : ''}`}
            >
              <span className="score-name">{p.name}</span>
              <span className="role-chip">{p.role.name}</span>
              <span className="gold-chip">{p.gold}g</span>
              <span className="score-loot">
                {Array.from({ length: LOOT_TO_WIN }).map((_, i) => (
                  <span key={i} className={`loot-token ${i < p.loot ? 'filled' : ''}`} />
                ))}
              </span>
            </div>
          )
        })}
      </div>

      <div className="scenario-zone">
        <CardView card={state.scenario} variant="scenario" size="lg" className="scenario-card" />
        <p className="status-line" key={state.statusText}>
          {state.statusText}
        </p>
        {judging && (
          <div className="judge-banner" role="status">
            <strong>Pick the winner</strong>
            <span>Tap an Option below — only you decide this round.</span>
          </div>
        )}
      </div>

      <div className="opponents-row">
        {(['ai1', 'ai2'] as const).map((id) => {
          const p = state.players[id]
          const isJudge = state.judgeId === id
          return (
            <article key={id} className={`player-panel ${isJudge ? 'is-judge' : ''}`}>
              <header>
                <h3>{p.name}</h3>
                <span className="role-chip">{p.role.name}</span>
              </header>
              <p className="perk">{p.role.perk}</p>
              <p className="perk-effect">{p.role.effect}</p>
              <div className="panel-meta">
                <span>Loot {p.loot}/{LOOT_TO_WIN}</span>
                <span>{p.gold}g</span>
                <span>Hand {p.hand.length}</span>
                {isJudge && <span className="judge-flag">Judging</span>}
              </div>
            </article>
          )
        })}
      </div>

      <div className={`play-area ${judging ? 'judging-mode' : ''}`} aria-label="Anonymous submissions">
        {state.submissions.length === 0 && (
          <div className="played-slot empty-hint">
            <div className="empty-slot-card">
              <span>Waiting for submissions…</span>
              <span className="muted">
                {submitted}/{expected} in
              </span>
            </div>
          </div>
        )}
        {state.submissions.map((slot, index) => {
          const faceDown = !slot.revealed
          const clickable = judging && slot.revealed
          const isWinning = showWinnerName && state.lastWinningSlotId === slot.slotId
          const optionLabel = `Option ${String.fromCharCode(65 + index)}`
          const label = faceDown
            ? `Submission ${index + 1}`
            : showWinnerName && isWinning
              ? state.players[slot.ownerId].name
              : optionLabel

          return (
            <div
              key={slot.slotId}
              className={`played-slot ${isWinning ? 'winning-slot' : ''} ${clickable ? 'pickable' : ''}`}
            >
              <CardView
                card={slot.card}
                variant={faceDown ? 'back' : 'action'}
                faceDown={faceDown}
                size="md"
                label={label}
                selected={clickable}
                onClick={clickable ? () => onJudgeSlot(slot.slotId) : undefined}
                className={clickable ? 'judge-target' : ''}
              />
              {clickable && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm pick-winner-btn"
                  onClick={() => onJudgeSlot(slot.slotId)}
                >
                  Crown {optionLabel}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <footer className="player-zone">
        <div className="player-header">
          <div>
            <h3>
              You · {you.role.name}
              {state.judgeId === 'you' ? ' · Judge' : ''} · {you.gold}g
            </h3>
            <p className="perk">{you.role.perk}</p>
            <p className="perk-effect">{you.role.effect}</p>
          </div>
          <div className="loot-meter" aria-label="Your loot tokens">
            {Array.from({ length: LOOT_TO_WIN }).map((_, i) => (
              <span key={i} className={`loot-token ${i < you.loot ? 'filled' : ''}`} />
            ))}
          </div>
        </div>

        <div className="perk-bar">
          {canUseReckless(state) && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onReckless}>
              Use Reckless Draw
            </button>
          )}
          {canUseSwitcheroo(state) && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSwitcheroo}>
              Use Switcheroo
            </button>
          )}
          {state.recklessDiscardPending && (
            <span className="perk-armed">Tap a hand card to discard…</span>
          )}
          {state.switcherooArmed && (
            <span className="perk-armed">Tap a hand card to swap…</span>
          )}
        </div>

        {you.items.filter((i) => !i.used).length > 0 && (
          <div className="inventory-row" aria-label="Your items">
            {you.items
              .filter((i) => !i.used)
              .map((owned) => {
                const def = getItem(owned.itemId)
                const usable = def.kind === 'consumable'
                return (
                  <button
                    key={owned.uid}
                    type="button"
                    className={`inv-chip ${usable ? '' : 'passive'}`}
                    disabled={!usable}
                    title={def.description}
                    onClick={() => usable && onUseItem(owned.uid)}
                  >
                    <strong>{def.name}</strong>
                    <span>{def.kind === 'passive' ? 'passive' : 'use'}</span>
                  </button>
                )
              })}
          </div>
        )}

        <div className={`hand ${!playable ? 'locked' : ''} ${judging ? 'dimmed-hand' : ''}`}>
          {you.hand.map((card, index) => (
            <CardView
              key={`${card.id}-${index}`}
              card={card}
              variant="action"
              size="md"
              disabled={!playable}
              onClick={playable ? () => onPlayCard(index) : undefined}
              className="hand-card"
            />
          ))}
        </div>
        {state.judgeId === 'you' && state.phase !== 'judging' && state.phase !== 'victory' && (
          <p className="hand-hint">You are judging — no Action this round. Identities stay hidden.</p>
        )}
        {judging && (
          <p className="hand-hint judge-hint">
            Explicit pick required: use <strong>Crown Option A/B</strong> or tap a glowing card.
          </p>
        )}
      </footer>
    </section>
  )
}

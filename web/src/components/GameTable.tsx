import { CardView } from './CardView'
import type { GameState } from '../game/types'
import { LOOT_TO_WIN, PLAYER_ORDER } from '../game/types'
import { canJudge, expectedSubmitters, isPlayable, submittedCount } from '../game/engine'

interface Props {
  state: GameState
  onPlayCard: (index: number) => void
  onJudgeSlot: (slotId: string) => void
  onRestart: () => void
  onHowTo: () => void
}

export function GameTable({ state, onPlayCard, onJudgeSlot, onRestart, onHowTo }: Props) {
  const judge = state.players[state.judgeId]
  const playable = isPlayable(state)
  const judging = canJudge(state)
  const showWinnerName = state.phase === 'roundResult' || state.phase === 'victory'
  const submitted = submittedCount(state)
  const expected = expectedSubmitters(state)

  return (
    <section className="game-table">
      <header className="top-bar">
        <div className="top-left">
          <span className="round-pill">Round {state.round}</span>
          <span className="judge-pill">
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

      <div className="score-strip" aria-label="Loot scoreboard">
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
              <div className="panel-meta">
                <span>Loot {p.loot}/{LOOT_TO_WIN}</span>
                <span>Hand {p.hand.length}</span>
                {isJudge && <span className="judge-flag">Judging</span>}
              </div>
            </article>
          )
        })}
      </div>

      <div className="play-area" aria-label="Anonymous submissions">
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
          const isWinning =
            showWinnerName && state.lastWinningSlotId === slot.slotId
          const label = faceDown
            ? `Submission ${index + 1}`
            : showWinnerName && isWinning
              ? state.players[slot.ownerId].name
              : `Option ${String.fromCharCode(65 + index)}`

          return (
            <div
              key={slot.slotId}
              className={`played-slot ${isWinning ? 'winning-slot' : ''}`}
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
            </div>
          )
        })}
      </div>

      <footer className="player-zone">
        <div className="player-header">
          <div>
            <h3>
              You · {state.players.you.role.name}
              {state.judgeId === 'you' ? ' · Judge' : ''}
            </h3>
            <p className="perk">{state.players.you.role.perk}</p>
          </div>
          <div className="loot-meter" aria-label="Your loot tokens">
            {Array.from({ length: LOOT_TO_WIN }).map((_, i) => (
              <span
                key={i}
                className={`loot-token ${i < state.players.you.loot ? 'filled' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className={`hand ${!playable ? 'locked' : ''}`}>
          {state.players.you.hand.map((card, index) => (
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
          <p className="hand-hint">Tap a revealed card to award the Loot Token. Who played it stays secret until you choose.</p>
        )}
      </footer>
    </section>
  )
}

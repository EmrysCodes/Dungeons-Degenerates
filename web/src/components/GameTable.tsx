import { CardView } from './CardView'
import type { GameState, PlayerId } from '../game/types'
import { LOOT_TO_WIN, PLAYER_ORDER } from '../game/types'
import { canJudge, isPlayable } from '../game/engine'

interface Props {
  state: GameState
  onPlayCard: (index: number) => void
  onJudge: (winnerId: PlayerId) => void
  onRestart: () => void
}

export function GameTable({ state, onPlayCard, onJudge, onRestart }: Props) {
  const judge = state.players[state.judgeId]
  const playable = isPlayable(state)
  const judging = canJudge(state)

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
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRestart}>
          Restart
        </button>
      </header>

      <div className="scenario-zone">
        <CardView card={state.scenario} variant="scenario" size="lg" className="scenario-card" />
        <p className="status-line" key={state.statusText}>
          {state.statusText}
        </p>
      </div>

      <div className="opponents-row">
        {(['ai1', 'ai2'] as PlayerId[]).map((id) => {
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

      <div className="play-area">
        {PLAYER_ORDER.map((id) => {
          const p = state.players[id]
          const isJudge = state.judgeId === id
          if (isJudge) {
            return (
              <div key={id} className="played-slot judge-slot">
                <CardView variant="back" size="md" label={`${p.name} · Judge`} className="dim" />
              </div>
            )
          }
          const faceDown = Boolean(p.played) && !p.revealed
          const showCard = Boolean(p.played) && p.revealed
          const clickable = judging && showCard
          return (
            <div key={id} className="played-slot">
              <CardView
                card={p.played}
                variant={faceDown || !p.played ? 'back' : 'action'}
                faceDown={faceDown || !p.played}
                size="md"
                label={p.name}
                selected={clickable}
                onClick={clickable ? () => onJudge(id) : undefined}
                className={clickable ? 'judge-target' : ''}
              />
            </div>
          )
        })}
      </div>

      <footer className="player-zone">
        <div className="player-header">
          <div>
            <h3>You · {state.players.you.role.name}</h3>
            <p className="perk">{state.players.you.role.perk}</p>
          </div>
          <div className="loot-meter" aria-label="Loot tokens">
            {Array.from({ length: LOOT_TO_WIN }).map((_, i) => (
              <span key={i} className={`loot-token ${i < state.players.you.loot ? 'filled' : ''}`} />
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
          <p className="hand-hint">You are judging this round — no Action to play.</p>
        )}
        {judging && <p className="hand-hint">Tap a revealed card above to award the Loot Token.</p>}
      </footer>
    </section>
  )
}

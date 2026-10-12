import { getItem } from '../data/items'
import type { GameState } from '../game/types'

interface Props {
  state: GameState
  onRestart: () => void
  onTitle: () => void
}

export function VictoryScreen({ state, onRestart, onTitle }: Props) {
  const winnerId = state.lastWinner
  const winner = winnerId ? state.players[winnerId] : null

  return (
    <section className="victory-screen">
      <div className="victory-panel">
        <p className="victory-kicker">Match over</p>
        <h2 className="victory-title">
          {winner ? `${winner.name} claims the tavern` : 'Chaos reigns'}
        </h2>
        {winner && (
          <p className="victory-sub">
            {winner.role.name} · {winner.loot} Loot Tokens · {winner.gold}g · Round {state.round}
          </p>
        )}
        {state.lastRewardText && <p className="howto-note">{state.lastRewardText}</p>}
        <div className="loot-board">
          {Object.values(state.players).map((p) => (
            <div key={p.id} className={`loot-row ${p.id === winnerId ? 'winner' : ''}`}>
              <span>{p.name}</span>
              <span className="role-chip">{p.role.name}</span>
              <span className="gold-chip">{p.gold}g</span>
              <span className="loot-count">{p.loot}</span>
            </div>
          ))}
        </div>
        {winner && winner.items.length > 0 && (
          <div className="victory-items">
            <p className="victory-kicker">Winner’s stash</p>
            <div className="inventory-row center">
              {winner.items.map((i) => (
                <span key={i.uid} className="inv-chip passive">
                  <strong>{getItem(i.itemId).name}</strong>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="title-cta">
          <button type="button" className="btn btn-primary" onClick={onRestart}>
            Play Again
          </button>
          <button type="button" className="btn btn-ghost" onClick={onTitle}>
            Title Screen
          </button>
        </div>
      </div>
    </section>
  )
}

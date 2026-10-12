import { getItem, type ItemId } from '../data/items'
import type { GameState } from '../game/types'

interface Props {
  state: GameState
  onBuy: (itemId: ItemId) => void
  onLeave: () => void
}

export function ShopPanel({ state, onBuy, onLeave }: Props) {
  const gold = state.players.you.gold

  return (
    <section className="shop-overlay">
      <div className="shop-panel">
        <header className="shop-hero">
          <p className="victory-kicker">Between rounds</p>
          <h2>Tavern Shop</h2>
          <p className="shop-gold">
            Your purse <strong>{gold}g</strong>
          </p>
          {state.lastRewardText && <p className="shop-reward">{state.lastRewardText}</p>}
        </header>

        <div className="shop-grid">
          {state.shopOffers.map((id) => {
            const item = getItem(id)
            const canAfford = gold >= item.cost
            return (
              <article key={id} className={`shop-card ${canAfford ? '' : 'broke'}`}>
                <header>
                  <h3>{item.name}</h3>
                  <span className="shop-price">{item.cost}g</span>
                </header>
                <p>{item.description}</p>
                <div className="shop-card-foot">
                  <span className="role-chip">{item.kind}</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={!canAfford}
                    onClick={() => onBuy(id)}
                  >
                    {canAfford ? 'Buy' : 'Broke'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {state.shopOffers.length === 0 && (
          <p className="howto-note">The merchant packed up. Nothing left but regret.</p>
        )}

        <button type="button" className="btn btn-ghost" onClick={onLeave}>
          Leave shop · next round
        </button>
      </div>
    </section>
  )
}

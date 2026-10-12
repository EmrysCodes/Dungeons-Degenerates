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
        <p className="victory-kicker">Between rounds</p>
        <h2>Tavern Shop</h2>
        <p className="shop-gold">Your purse: <strong>{gold}g</strong></p>
        <p className="howto-note">{state.lastRewardText}</p>
        <div className="shop-grid">
          {state.shopOffers.map((id) => {
            const item = getItem(id)
            const canAfford = gold >= item.cost
            return (
              <article key={id} className="shop-card">
                <header>
                  <h3>{item.name}</h3>
                  <span className="shop-price">{item.cost}g</span>
                </header>
                <p>{item.description}</p>
                <span className="role-chip">{item.kind}</span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={!canAfford}
                  onClick={() => onBuy(id)}
                >
                  {canAfford ? 'Buy' : 'Too broke'}
                </button>
              </article>
            )
          })}
        </div>
        {state.shopOffers.length === 0 && (
          <p className="howto-note">Shelf is empty. The merchant has fled.</p>
        )}
        <button type="button" className="btn btn-ghost" onClick={onLeave}>
          Leave shop · next round
        </button>
      </div>
    </section>
  )
}

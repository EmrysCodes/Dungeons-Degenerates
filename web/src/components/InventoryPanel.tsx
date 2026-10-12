import { getItem } from '../data/items'
import type { GameState } from '../game/types'

interface Props {
  open: boolean
  state: GameState
  onClose: () => void
  onUseItem: (uid: string) => void
}

export function InventoryPanel({ open, state, onClose, onUseItem }: Props) {
  if (!open) return null
  const you = state.players.you
  const items = you.items.filter((i) => !i.used)

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel wide"
        role="dialog"
        aria-modal="true"
        aria-label="Inventory"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="victory-kicker">Your satchel</p>
        <h2>Inventory</h2>
        <p className="menu-lead">
          {you.gold}g · {you.loot} loot tokens · {you.role.name}
        </p>
        {items.length === 0 ? (
          <p className="howto-note">Empty pockets. The shop waits between rounds.</p>
        ) : (
          <div className="codex-list">
            {items.map((owned) => {
              const def = getItem(owned.itemId)
              const usable = def.kind === 'consumable'
              return (
                <article key={owned.uid} className="codex-item">
                  <header>
                    <h3>{def.name}</h3>
                    <span className="role-chip">{def.kind}</span>
                  </header>
                  <p>{def.description}</p>
                  {usable && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        onUseItem(owned.uid)
                        onClose()
                      }}
                    >
                      Use
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        )}
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}

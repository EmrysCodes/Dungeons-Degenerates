import { useMemo, useState } from 'react'
import { ITEM_CATALOG } from '../data/items'
import { ROLES } from '../data/roles'
import { EXTRA_ACTIONS, EXTRA_SCENARIOS } from '../data/extras'
import actions from '../data/actions.json'
import scenarios from '../data/scenarios.json'
import { CardView } from './CardView'
import type { CardData } from '../game/types'

type Tab = 'actions' | 'scenarios' | 'items' | 'roles'

interface Props {
  onBack: () => void
}

export function CodexPage({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('actions')
  const actionCards = useMemo(() => {
    const base = actions as CardData[]
    const extras = EXTRA_ACTIONS.map((c, i) => ({
      id: 1000 + i,
      text: c.text,
      image: 'text',
    }))
    return [...base, ...extras]
  }, [])
  const scenarioCards = useMemo(() => {
    const base = scenarios as CardData[]
    const extras = EXTRA_SCENARIOS.map((c, i) => ({
      id: 2000 + i,
      text: c.text,
      image: 'text',
    }))
    return [...base, ...extras]
  }, [])

  return (
    <section className="menu-screen">
      <div className="menu-panel wide scroll codex">
        <p className="victory-kicker">Library of bad ideas</p>
        <h2>Codex</h2>
        <div className="codex-tabs">
          {(
            [
              ['actions', `Actions (${actionCards.length})`],
              ['scenarios', `Scenarios (${scenarioCards.length})`],
              ['items', `Items (${ITEM_CATALOG.length})`],
              ['roles', 'Roles'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`btn btn-sm ${tab === id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'actions' && (
          <div className="codex-grid">
            {actionCards.map((c) => (
              <CardView key={c.id} card={c} variant="action" size="sm" />
            ))}
          </div>
        )}
        {tab === 'scenarios' && (
          <div className="codex-grid">
            {scenarioCards.map((c) => (
              <CardView key={c.id} card={c} variant="scenario" size="sm" />
            ))}
          </div>
        )}
        {tab === 'items' && (
          <div className="codex-list">
            {ITEM_CATALOG.map((item) => (
              <article key={item.id} className="codex-item">
                <header>
                  <h3>{item.name}</h3>
                  <span className="shop-price">{item.cost}g</span>
                </header>
                <p>{item.description}</p>
                <span className="role-chip">{item.kind}</span>
              </article>
            ))}
          </div>
        )}
        {tab === 'roles' && (
          <div className="role-grid">
            {ROLES.map((role) => (
              <article key={role.id} className="role-card static">
                <span className="role-chip">{role.name}</span>
                <em>{role.perk}</em>
                <p>{role.effect}</p>
              </article>
            ))}
          </div>
        )}

        <button type="button" className="btn btn-primary" onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </section>
  )
}

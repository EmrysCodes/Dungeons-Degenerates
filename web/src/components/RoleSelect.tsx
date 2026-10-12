import { ROLES, type RoleId } from '../data/roles'

interface Props {
  selected: RoleId | null
  onSelect: (id: RoleId) => void
  onBack: () => void
  onConfirm: () => void
}

export function RoleSelect({ selected, onSelect, onBack, onConfirm }: Props) {
  return (
    <section className="menu-screen role-select">
      <div className="menu-panel wide">
        <p className="victory-kicker">Before the tavern</p>
        <h2>Choose your Role</h2>
        <p className="menu-lead">AI rivals take the other two. Perks are mechanical — use them.</p>

        <div className="role-grid">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`role-card ${selected === role.id ? 'selected' : ''}`}
              onClick={() => onSelect(role.id)}
            >
              <span className="role-chip">{role.name}</span>
              <em>{role.perk}</em>
              <p>{role.effect}</p>
            </button>
          ))}
        </div>

        <div className="menu-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selected}
            onClick={onConfirm}
          >
            Enter the Tavern
          </button>
        </div>
      </div>
    </section>
  )
}

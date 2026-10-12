import type { Settings } from '../game/settings'

interface Props {
  settings: Settings
  onChange: (next: Settings) => void
  onBack: () => void
  embedded?: boolean
}

export function SettingsPage({ settings, onChange, onBack, embedded }: Props) {
  const panel = (
    <div className={embedded ? '' : 'menu-panel'}>
      <p className="victory-kicker">Tavern options</p>
      <h2>Settings</h2>

      <label className="setting-row">
        <span>Sound effects</span>
        <input
          type="checkbox"
          checked={settings.sfx}
          onChange={(e) => onChange({ ...settings, sfx: e.target.checked })}
        />
      </label>
      <label className="setting-row">
        <span>Fast reveals</span>
        <input
          type="checkbox"
          checked={settings.fastReveals}
          onChange={(e) => onChange({ ...settings, fastReveals: e.target.checked })}
        />
      </label>
      <label className="setting-row">
        <span>Show perk details on table</span>
        <input
          type="checkbox"
          checked={settings.showPerkDetails}
          onChange={(e) => onChange({ ...settings, showPerkDetails: e.target.checked })}
        />
      </label>

      <p className="menu-lead">Settings save in this browser.</p>
      <button type="button" className="btn btn-primary" onClick={onBack}>
        {embedded ? 'Done' : 'Back to Menu'}
      </button>
    </div>
  )

  if (embedded) return panel
  return <section className="menu-screen">{panel}</section>
}

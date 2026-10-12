import { deckCounts } from '../game/engine'

export type MenuScreen =
  | 'main'
  | 'howto'
  | 'rules'
  | 'settings'
  | 'roles'
  | 'codex'
  | 'playing'

interface Props {
  onNavigate: (screen: MenuScreen) => void
  onPlay: () => void
}

export function MainMenu({ onNavigate, onPlay }: Props) {
  const counts = deckCounts()

  return (
    <section className="menu-screen main-menu">
      <div className="menu-wash" aria-hidden="true" />
      <div className="menu-stage">
        <div className="menu-hero">
          <p className="title-kicker">A party of terrible decisions</p>
          <h1 className="brand-title">
            <span>Dungeons</span>
            <span className="amp">&amp;</span>
            <span>Degenerates</span>
          </h1>
          <p className="title-tagline">
            Absurd scenarios. Anonymous chaos. Gold, gear, and bad ideas.
          </p>
          <p className="menu-deck-meta">
            {counts.actions} Actions · {counts.scenarios} Scenarios · {counts.items} Items
          </p>
        </div>

        <nav className="menu-nav" aria-label="Main menu">
          <button type="button" className="btn btn-primary btn-lg menu-primary" onClick={onPlay}>
            Quick Play
          </button>
          <button type="button" className="btn btn-ghost menu-link" onClick={() => onNavigate('roles')}>
            Choose Role &amp; Play
          </button>
          <button type="button" className="btn btn-ghost menu-link" onClick={() => onNavigate('howto')}>
            How to Play
          </button>
          <button type="button" className="btn btn-ghost menu-link" onClick={() => onNavigate('rules')}>
            Full Rules
          </button>
          <button type="button" className="btn btn-ghost menu-link" onClick={() => onNavigate('codex')}>
            Codex
          </button>
          <button type="button" className="btn btn-ghost menu-link" onClick={() => onNavigate('settings')}>
            Settings
          </button>
        </nav>

        <div className="menu-fan" aria-hidden="true">
          <img src="/cards/scenario/000.png" alt="" className="fan-card fan-1" />
          <img src="/cards/action/000.png" alt="" className="fan-card fan-2" />
          <img src="/cards/action/010.png" alt="" className="fan-card fan-3" />
        </div>
      </div>
    </section>
  )
}

interface Props {
  open: boolean
  onResume: () => void
  onHowTo: () => void
  onInventory: () => void
  onSettings: () => void
  onQuit: () => void
}

export function PauseMenu({ open, onResume, onHowTo, onInventory, onSettings, onQuit }: Props) {
  if (!open) return null
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Paused">
        <p className="victory-kicker">Paused</p>
        <h2>Table Talk</h2>
        <nav className="pause-nav">
          <button type="button" className="btn btn-primary" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="btn btn-ghost" onClick={onInventory}>
            Inventory
          </button>
          <button type="button" className="btn btn-ghost" onClick={onHowTo}>
            How to Play
          </button>
          <button type="button" className="btn btn-ghost" onClick={onSettings}>
            Settings
          </button>
          <button type="button" className="btn btn-ghost" onClick={onQuit}>
            Quit to Menu
          </button>
        </nav>
      </div>
    </div>
  )
}

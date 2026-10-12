interface Props {
  open: boolean
  onClose: () => void
}

export function HowToPlay({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="howto-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="howto-title">How to play</h2>
        <ol className="howto-list">
          <li>Each player gets a <strong>Role</strong> and <strong>7 Action</strong> cards.</li>
          <li>A <strong>Scenario</strong> hits the table every round.</li>
          <li>The <strong>Judge</strong> rotates and does not play. Everyone else submits face-down.</li>
          <li>Cards flip one at a time — <strong>anonymous</strong>. No names until someone wins.</li>
          <li>The Judge picks the funniest / most unhinged Action.</li>
          <li>Winner takes <strong>1 Loot Token</strong>. First to <strong>5</strong> owns the tavern.</li>
        </ol>
        <p className="howto-note">
          Controlled chaos. Bad decisions encouraged. Judge by the bit, not the bard.
        </p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}

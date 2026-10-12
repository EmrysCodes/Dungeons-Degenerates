interface Props {
  open: boolean
  onClose: () => void
}

export function HowToPlay({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel howto-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="howto-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="howto-title">How to play</h2>
        <ol className="howto-list">
          <li>Each player gets a <strong>Role</strong>, <strong>7 Actions</strong>, and <strong>5 gold</strong>.</li>
          <li>A <strong>Scenario</strong> hits the table every round.</li>
          <li>The <strong>Judge</strong> rotates and does not play. Others submit face-down.</li>
          <li>Cards flip anonymously. The Judge <strong>must explicitly crown</strong> Option A or B.</li>
          <li>Winner takes <strong>1 Loot Token</strong>, <strong>gold</strong>, and a random <strong>item</strong>.</li>
          <li>Visit the <strong>Tavern Shop</strong> between rounds. First to <strong>5 tokens</strong> wins (+bonus gold).</li>
        </ol>
        <h3 className="howto-sub">Role perks</h3>
        <ul className="howto-list">
          <li><strong>Barbarian — Reckless Draw:</strong> discard 1, draw 2 (once/round).</li>
          <li><strong>Rogue — Switcheroo:</strong> swap your face-down card with one from hand before reveal.</li>
          <li><strong>Bard — Crowd Favorite:</strong> on a win, +2g and draw 1 Action.</li>
        </ul>
        <p className="howto-note">
          Controlled chaos. Bad decisions encouraged. Judge the bit — not the bard.
        </p>
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}

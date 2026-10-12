interface Props {
  open?: boolean
  onClose: () => void
  /** When true, render as full menu page instead of modal */
  asPage?: boolean
}

export function HowToPlay({ open = true, onClose, asPage = false }: Props) {
  if (!asPage && !open) return null

  const body = (
    <div className={asPage ? 'menu-panel wide scroll' : 'modal-panel howto-wide'}>
      <p className="victory-kicker">Quick start</p>
      <h2 id="howto-title">How to Play</h2>
      <ol className="howto-list">
        <li>Pick a <strong>Role</strong>. Draw <strong>7 Actions</strong> and <strong>5 gold</strong>.</li>
        <li>A <strong>Scenario</strong> hits the table.</li>
        <li>The <strong>Judge</strong> rotates and does not play. Others submit face-down.</li>
        <li>Cards flip anonymously. Judge <strong>crowns</strong> Option A or B.</li>
        <li>Winner takes a <strong>Loot Token</strong>, <strong>gold</strong>, and an <strong>item</strong>.</li>
        <li>Shop between rounds. First to <strong>5 tokens</strong> owns the tavern.</li>
      </ol>
      <h3 className="howto-sub">Role perks</h3>
      <ul className="howto-list">
        <li><strong>Barbarian — Reckless Draw:</strong> discard 1, draw 2.</li>
        <li><strong>Rogue — Switcheroo:</strong> swap your face-down card before reveal.</li>
        <li><strong>Bard — Crowd Favorite:</strong> on a win, +2g and draw 1.</li>
      </ul>
      <p className="howto-note">Judge the bit — not the bard.</p>
      <button type="button" className="btn btn-primary" onClick={onClose}>
        {asPage ? 'Back to Menu' : 'Got it'}
      </button>
    </div>
  )

  if (asPage) {
    return <section className="menu-screen">{body}</section>
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="howto-title" onClick={(e) => e.stopPropagation()}>
        {body}
      </div>
    </div>
  )
}

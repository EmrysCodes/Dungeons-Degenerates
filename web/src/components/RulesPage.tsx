interface Props {
  onBack: () => void
}

export function RulesPage({ onBack }: Props) {
  return (
    <section className="menu-screen">
      <div className="menu-panel wide scroll">
        <p className="victory-kicker">Rulebook</p>
        <h2>Full Rules</h2>

        <h3 className="howto-sub">Setup</h3>
        <p className="rules-p">
          3 players (you + 2 AI). Each gets a Role, 7 Action cards, and 5 gold. The Action and Scenario
          decks are shuffled; no duplicates until reshuffle.
        </p>

        <h3 className="howto-sub">Round flow</h3>
        <ol className="howto-list">
          <li>Reveal one Scenario.</li>
          <li>The Judge rotates clockwise and does not play.</li>
          <li>Other players submit one Action face-down.</li>
          <li>Cards flip one at a time on anonymous slots.</li>
          <li>The Judge crowns Option A or B. Only then is the winner named.</li>
          <li>Winner gets 1 Loot Token, gold, and a loot item.</li>
          <li>Tavern Shop opens. Then hands refill and a new round begins.</li>
        </ol>

        <h3 className="howto-sub">Winning</h3>
        <p className="rules-p">First to 5 Loot Tokens wins the match and a gold bonus.</p>

        <h3 className="howto-sub">Anonymity</h3>
        <p className="rules-p">
          Submission order and slot labels never reveal who played what until a winner is crowned.
        </p>

        <h3 className="howto-sub">Roles</h3>
        <ul className="howto-list">
          <li><strong>Barbarian:</strong> Reckless Draw — discard 1, draw 2 (once/round).</li>
          <li><strong>Rogue:</strong> Switcheroo — swap your face-down card before reveal.</li>
          <li><strong>Bard:</strong> Crowd Favorite — on win, +2g and draw 1.</li>
        </ul>

        <h3 className="howto-sub">Gold &amp; items</h3>
        <p className="rules-p">
          Start with 5 gold. Round wins pay gold plus a random loot drop. Between rounds the Tavern
          Shop offers four items. Consumables fire from Pack or the dock; passives stay in your
          satchel and tick quietly.
        </p>

        <h3 className="howto-sub">Menus</h3>
        <p className="rules-p">
          Main menu covers Quick Play, Role Select, How to Play, Full Rules, Codex, and Settings.
          In-match: Menu pauses the table (resume, inventory, how-to, settings, quit). Pack opens
          inventory without pausing timers for long — both halt AI until closed.
        </p>

        <button type="button" className="btn btn-primary" onClick={onBack}>
          Back to Menu
        </button>
      </div>
    </section>
  )
}

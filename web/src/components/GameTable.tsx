import { CardView } from './CardView'
import { getItem } from '../data/items'
import type { GameState, PlayerId } from '../game/types'
import { LOOT_TO_WIN } from '../game/types'
import {
  canJudge,
  canUseReckless,
  canUseSwitcheroo,
  expectedSubmitters,
  isPlayable,
  submittedCount,
} from '../game/engine'

interface Props {
  state: GameState
  showPerkDetails?: boolean
  onPlayCard: (index: number) => void
  onJudgeSlot: (slotId: string) => void
  onMenu: () => void
  onInventory: () => void
  onHowTo: () => void
  onReckless: () => void
  onSwitcheroo: () => void
  onUseItem: (uid: string) => void
}

function SeatChip({
  name,
  role,
  gold,
  loot,
  isJudge,
  isWinner,
  isYou,
}: {
  name: string
  role: string
  gold: number
  loot: number
  isJudge: boolean
  isWinner: boolean
  isYou?: boolean
}) {
  return (
    <div className={`seat-chip ${isJudge ? 'is-judge' : ''} ${isWinner ? 'is-winner' : ''} ${isYou ? 'is-you' : ''}`}>
      <div className="seat-top">
        <span className="seat-name">{name}</span>
        <span className="role-chip">{role}</span>
      </div>
      <div className="seat-bottom">
        <span className="gold-chip">{gold}g</span>
        <span className="score-loot" aria-label={`${loot} loot tokens`}>
          {Array.from({ length: LOOT_TO_WIN }).map((_, i) => (
            <span key={i} className={`loot-token ${i < loot ? 'filled' : ''}`} />
          ))}
        </span>
        {isJudge && <span className="judge-flag">Judge</span>}
      </div>
    </div>
  )
}

export function GameTable({
  state,
  showPerkDetails = true,
  onPlayCard,
  onJudgeSlot,
  onMenu,
  onInventory,
  onHowTo,
  onReckless,
  onSwitcheroo,
  onUseItem,
}: Props) {
  const judge = state.players[state.judgeId]
  const playable = isPlayable(state)
  const judging = canJudge(state)
  const showWinnerName = state.phase === 'roundResult' || state.phase === 'victory'
  const submitted = submittedCount(state)
  const expected = expectedSubmitters(state)
  const you = state.players.you
  const rivals = (['ai1', 'ai2'] as PlayerId[]).map((id) => state.players[id])

  return (
    <section className={`game-table ${judging ? 'is-judging' : ''}`}>
      <header className="table-rail">
        <div className="rail-left">
          <span className="round-pill">Round {state.round}</span>
          <span className={`judge-pill ${judging ? 'judge-active' : ''}`}>
            Judge <strong>{judge.name}</strong>
          </span>
        </div>
        <p className="brand-mark">Dungeons &amp; Degenerates</p>
        <div className="rail-right">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onInventory}>
            Pack
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onHowTo}>
            Rules
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onMenu}>
            Menu
          </button>
        </div>
      </header>

      <div className="table-felt">
        <div className="rival-row">
          {rivals.map((p) => (
            <SeatChip
              key={p.id}
              name={p.name}
              role={p.role.name}
              gold={p.gold}
              loot={p.loot}
              isJudge={state.judgeId === p.id}
              isWinner={showWinnerName && state.lastWinner === p.id}
            />
          ))}
        </div>

        <div className="table-center">
          <div className="scenario-stage">
            <p className="stage-label">Scenario</p>
            <CardView card={state.scenario} variant="scenario" size="lg" className="scenario-card" />
          </div>

          <div className={`submission-stage ${judging ? 'judging-mode' : ''}`}>
            <p className="stage-label">{judging ? 'Crown a winner' : 'Submissions'}</p>
            <p className="status-line" key={state.statusText}>
              {state.statusText}
            </p>

            <div className="play-area" aria-label="Anonymous submissions">
              {state.submissions.length === 0 && (
                <div className="empty-slot-card">
                  <span>Waiting for plays…</span>
                  <span className="muted">
                    {submitted}/{expected}
                  </span>
                </div>
              )}
              {state.submissions.map((slot, index) => {
                const faceDown = !slot.revealed
                const clickable = judging && slot.revealed
                const isWinning = showWinnerName && state.lastWinningSlotId === slot.slotId
                const optionLabel = `Option ${String.fromCharCode(65 + index)}`
                const label = faceDown
                  ? 'Face down'
                  : showWinnerName && isWinning
                    ? state.players[slot.ownerId].name
                    : optionLabel

                return (
                  <div
                    key={slot.slotId}
                    className={`played-slot ${isWinning ? 'winning-slot' : ''} ${clickable ? 'pickable' : ''}`}
                  >
                    <CardView
                      card={slot.card}
                      variant={faceDown ? 'back' : 'action'}
                      faceDown={faceDown}
                      size={judging ? 'lg' : 'md'}
                      label={label}
                      selected={clickable}
                      onClick={clickable ? () => onJudgeSlot(slot.slotId) : undefined}
                      className={clickable ? 'judge-target' : ''}
                    />
                    {clickable && (
                      <button
                        type="button"
                        className="btn btn-primary pick-winner-btn"
                        onClick={() => onJudgeSlot(slot.slotId)}
                      >
                        Crown {optionLabel}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <footer className="player-dock">
        <div className="dock-meta">
          <SeatChip
            name="You"
            role={you.role.name}
            gold={you.gold}
            loot={you.loot}
            isJudge={state.judgeId === 'you'}
            isWinner={showWinnerName && state.lastWinner === 'you'}
            isYou
          />
          {showPerkDetails && (
            <p className="dock-perk" title={you.role.effect}>
              <em>{you.role.perk}</em>
              <span>{you.role.effect}</span>
            </p>
          )}
        </div>

        <div className="dock-tools">
          {canUseReckless(state) && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onReckless}>
              Reckless Draw
            </button>
          )}
          {canUseSwitcheroo(state) && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onSwitcheroo}>
              Switcheroo
            </button>
          )}
          {state.recklessDiscardPending && <span className="perk-armed">Tap a card to discard</span>}
          {state.switcherooArmed && <span className="perk-armed">Tap a card to swap</span>}
          {you.items
            .filter((i) => !i.used)
            .slice(0, 4)
            .map((owned) => {
              const def = getItem(owned.itemId)
              const usable = def.kind === 'consumable'
              return (
                <button
                  key={owned.uid}
                  type="button"
                  className={`inv-chip ${usable ? '' : 'passive'}`}
                  disabled={!usable}
                  title={def.description}
                  onClick={() => usable && onUseItem(owned.uid)}
                >
                  <strong>{def.name}</strong>
                  <span>{def.kind === 'passive' ? 'passive' : 'use'}</span>
                </button>
              )
            })}
        </div>

        <div className={`hand ${!playable ? 'locked' : ''} ${judging ? 'dimmed-hand' : ''}`}>
          {you.hand.map((card, index) => (
            <CardView
              key={`${card.id}-${index}`}
              card={card}
              variant="action"
              size="md"
              disabled={!playable}
              onClick={playable ? () => onPlayCard(index) : undefined}
              className="hand-card"
            />
          ))}
        </div>

        {state.judgeId === 'you' && !judging && state.phase !== 'victory' && (
          <p className="hand-hint">Judging this round — your hand rests while others play.</p>
        )}
        {judging && (
          <p className="hand-hint judge-hint">Tap a glowing option or use Crown — identities stay hidden.</p>
        )}
      </footer>
    </section>
  )
}

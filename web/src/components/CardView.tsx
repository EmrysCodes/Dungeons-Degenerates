import type { CardData } from '../game/types'

type Variant = 'action' | 'scenario' | 'back' | 'slot'

interface Props {
  card?: CardData | null
  variant: Variant
  selected?: boolean
  disabled?: boolean
  faceDown?: boolean
  label?: string
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CardView({
  card,
  variant,
  selected,
  disabled,
  faceDown,
  label,
  onClick,
  className = '',
  size = 'md',
}: Props) {
  const isButton = Boolean(onClick) && !disabled
  const Tag = isButton ? 'button' : 'div'
  const showBack = faceDown || variant === 'back' || !card
  const isTextCard = Boolean(card && (!card.image || card.image === 'text'))

  return (
    <Tag
      type={isButton ? 'button' : undefined}
      className={`card-view size-${size} variant-${variant} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${faceDown ? 'face-down' : ''} ${isTextCard && !showBack ? 'text-card' : ''} ${className}`}
      onClick={isButton ? onClick : undefined}
      disabled={isButton ? disabled : undefined}
      aria-label={card?.text ?? label ?? 'Card'}
    >
      {showBack ? (
        <img src="/cards/card-back.png" alt="Face-down card" draggable={false} />
      ) : isTextCard ? (
        <div className={`card-text-face ${variant === 'scenario' ? 'scenario-face' : 'action-face'}`}>
          <p>{card!.text}</p>
        </div>
      ) : (
        <img
          src={
            variant === 'scenario'
              ? `/cards/scenario/${card!.image}`
              : `/cards/action/${card!.image}`
          }
          alt={card!.text}
          draggable={false}
        />
      )}
      {label && <span className="card-slot-label">{label}</span>}
    </Tag>
  )
}

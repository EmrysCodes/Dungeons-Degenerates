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
  const imgSrc = faceDown || variant === 'back' || !card
    ? '/cards/card-back.png'
    : variant === 'scenario'
      ? `/cards/scenario/${card.image}`
      : `/cards/action/${card.image}`

  return (
    <Tag
      type={isButton ? 'button' : undefined}
      className={`card-view size-${size} variant-${variant} ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${faceDown ? 'face-down' : ''} ${className}`}
      onClick={isButton ? onClick : undefined}
      disabled={isButton ? disabled : undefined}
      aria-label={card?.text ?? label ?? 'Card'}
    >
      <img src={imgSrc} alt={faceDown ? 'Face-down card' : (card?.text ?? 'Card back')} draggable={false} />
      {label && <span className="card-slot-label">{label}</span>}
    </Tag>
  )
}

export type RoleId = 'barbarian' | 'rogue' | 'bard'

export interface Role {
  id: RoleId
  name: string
  /** Short flavor line shown on panels */
  perk: string
  /** Mechanical effect description */
  effect: string
}

export const ROLES: Role[] = [
  {
    id: 'barbarian',
    name: 'Barbarian',
    perk: 'Big energy. Bigger bad decisions.',
    effect:
      'Reckless Draw — once per round (when not Judge): discard 1 Action from hand to draw 2.',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    perk: 'Pretend this was all part of the plan.',
    effect:
      'Switcheroo — once per round after you submit face-down (before reveal): swap your submission with another card from hand.',
  },
  {
    id: 'bard',
    name: 'Bard',
    perk: 'Charm first. Regret later.',
    effect:
      'Crowd Favorite — when you win a round, gain +2 bonus gold and draw 1 Action.',
  },
]

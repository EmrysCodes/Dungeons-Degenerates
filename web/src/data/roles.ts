export type RoleId = 'barbarian' | 'rogue' | 'bard'

export interface Role {
  id: RoleId
  name: string
  perk: string
}

export const ROLES: Role[] = [
  {
    id: 'barbarian',
    name: 'Barbarian',
    perk: 'Big energy. Bigger bad decisions.',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    perk: 'Pretend this was all part of the plan.',
  },
  {
    id: 'bard',
    name: 'Bard',
    perk: 'Charm first. Regret later.',
  },
]

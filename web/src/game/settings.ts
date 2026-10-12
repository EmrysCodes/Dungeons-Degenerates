export interface Settings {
  sfx: boolean
  fastReveals: boolean
  showPerkDetails: boolean
}

const KEY = 'dnd_settings_v1'

export const DEFAULT_SETTINGS: Settings = {
  sfx: true,
  fastReveals: false,
  showPerkDetails: true,
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

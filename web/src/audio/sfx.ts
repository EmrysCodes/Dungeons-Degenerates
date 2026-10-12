/** Lightweight Web Audio stings — no asset files required. */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

function tone(freq: number, duration: number, type: OscillatorType, gain = 0.04, when = 0) {
  const audio = getCtx()
  if (!audio) return
  const t0 = audio.currentTime + when
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function unlockAudio() {
  const audio = getCtx()
  if (audio?.state === 'suspended') void audio.resume()
}

export function playTap() {
  tone(220, 0.08, 'triangle', 0.03)
}

export function playFlip() {
  tone(330, 0.12, 'square', 0.025)
  tone(440, 0.1, 'triangle', 0.02, 0.05)
}

export function playWin() {
  tone(392, 0.15, 'triangle', 0.04)
  tone(523, 0.18, 'triangle', 0.04, 0.12)
  tone(659, 0.22, 'triangle', 0.035, 0.26)
}

export function playJudge() {
  tone(180, 0.2, 'sawtooth', 0.02)
}

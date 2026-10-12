import { useState } from 'react'
import { HowToPlay } from './HowToPlay'
import { unlockAudio } from '../audio/sfx'

interface Props {
  onStart: () => void
}

export function TitleScreen({ onStart }: Props) {
  const [howto, setHowto] = useState(false)

  return (
    <section className="title-screen">
      <div className="title-atmosphere" aria-hidden="true" />
      <div className="title-content">
        <p className="title-kicker">A party of terrible decisions</p>
        <h1 className="brand-title">
          <span>Dungeons</span>
          <span className="amp">&amp;</span>
          <span>Degenerates</span>
        </h1>
        <p className="title-tagline">
          Absurd fantasy scenarios. Ridiculous action cards. One rotating judge.
          Submissions stay anonymous. First to five Loot Tokens owns the tavern.
        </p>
        <div className="title-cta">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              unlockAudio()
              onStart()
            }}
          >
            Start Demo
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setHowto(true)}>
            How to Play
          </button>
        </div>
        <p className="title-meta">Local vs 2 AI · Roles · Rotating Judge · Anonymous reveals</p>
      </div>
      <div className="title-fan" aria-hidden="true">
        <img src="/cards/scenario/000.png" alt="" className="fan-card fan-1" />
        <img src="/cards/action/000.png" alt="" className="fan-card fan-2" />
        <img src="/cards/action/010.png" alt="" className="fan-card fan-3" />
      </div>
      <HowToPlay open={howto} onClose={() => setHowto(false)} />
    </section>
  )
}

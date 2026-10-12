import { useEffect, useRef, useState } from 'react'
import { TitleScreen } from './components/TitleScreen'
import { GameTable } from './components/GameTable'
import { VictoryScreen } from './components/VictoryScreen'
import { HowToPlay } from './components/HowToPlay'
import {
  advanceAfterRound,
  aiJudgePick,
  autoPlayNonJudges,
  createInitialState,
  playPlayerCard,
  revealNext,
  startMatch,
  judgePickBySlot,
} from './game/engine'
import type { GameState } from './game/types'
import { playFlip, playJudge, playTap, playWin, unlockAudio } from './audio/sfx'

function useTimeout(callback: () => void, delay: number | null) {
  const saved = useRef(callback)
  useEffect(() => {
    saved.current = callback
  }, [callback])
  useEffect(() => {
    if (delay === null) return
    const id = window.setTimeout(() => saved.current(), delay)
    return () => window.clearTimeout(id)
  }, [delay])
}

export default function App() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [howto, setHowto] = useState(false)
  const prevPhase = useRef(state.phase)
  const prevReveal = useRef(state.revealIndex)

  const start = () => {
    unlockAudio()
    setState(startMatch())
  }
  const restart = () => {
    unlockAudio()
    setState(startMatch())
  }
  const toTitle = () => setState(createInitialState())

  // SFX on phase / reveal transitions
  useEffect(() => {
    if (state.phase === 'revealing' && state.revealIndex !== prevReveal.current) {
      playFlip()
    }
    if (state.phase === 'judging' && prevPhase.current !== 'judging') {
      playJudge()
    }
    if (
      (state.phase === 'roundResult' || state.phase === 'victory') &&
      prevPhase.current !== state.phase
    ) {
      playWin()
    }
    prevPhase.current = state.phase
    prevReveal.current = state.revealIndex
  }, [state.phase, state.revealIndex])

  // When player is judge: AI auto-submit after short delay
  useTimeout(
    () => setState((s) => autoPlayNonJudges(s)),
    state.phase === 'waiting' && state.judgeId === 'you' ? 900 : null,
  )

  // After player plays: AI finish submitting (staggered window ~ like GDD 5s)
  useTimeout(
    () => setState((s) => autoPlayNonJudges(s)),
    state.phase === 'waiting' && state.judgeId !== 'you' && state.submissions.some((s) => s.ownerId === 'you')
      ? 800 + Math.random() * 1800
      : null,
  )

  // Reveal cadence — readable pause between flips (GDD used 5s; web uses ~3s)
  useTimeout(
    () => setState((s) => revealNext(s)),
    state.phase === 'revealing' ? (state.revealIndex === 0 ? 700 : 3000) : null,
  )

  // AI judge
  useTimeout(
    () => setState((s) => aiJudgePick(s)),
    state.phase === 'judging' && state.judgeId !== 'you' ? 1800 : null,
  )

  // Advance after round result
  useTimeout(
    () => setState((s) => advanceAfterRound(s)),
    state.phase === 'roundResult' ? 2600 : null,
  )

  const onPlayCard = (index: number) => {
    playTap()
    setState((s) => playPlayerCard(s, index))
  }

  const onJudgeSlot = (slotId: string) => {
    playTap()
    setState((s) => judgePickBySlot(s, slotId))
  }

  if (state.phase === 'title') {
    return <TitleScreen onStart={start} />
  }

  if (state.phase === 'victory') {
    return <VictoryScreen state={state} onRestart={restart} onTitle={toTitle} />
  }

  return (
    <>
      <GameTable
        state={state}
        onPlayCard={onPlayCard}
        onJudgeSlot={onJudgeSlot}
        onRestart={restart}
        onHowTo={() => setHowto(true)}
      />
      <HowToPlay open={howto} onClose={() => setHowto(false)} />
    </>
  )
}

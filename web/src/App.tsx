import { useEffect, useRef, useState } from 'react'
import { TitleScreen } from './components/TitleScreen'
import { GameTable } from './components/GameTable'
import { VictoryScreen } from './components/VictoryScreen'
import {
  advanceAfterRound,
  aiJudgePick,
  autoPlayNonJudges,
  createInitialState,
  playPlayerCard,
  revealNext,
  startMatch,
  judgePick,
} from './game/engine'
import type { GameState, PlayerId } from './game/types'

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

  const start = () => setState(startMatch())
  const restart = () => setState(startMatch())
  const toTitle = () => setState(createInitialState())

  // When player is judge: AI auto-submit after short delay
  useTimeout(
    () => setState((s) => autoPlayNonJudges(s)),
    state.phase === 'waiting' && state.judgeId === 'you' ? 900 : null,
  )

  // After player plays: AI finish submitting
  useTimeout(
    () => setState((s) => autoPlayNonJudges(s)),
    state.phase === 'waiting' && state.judgeId !== 'you' && state.players.you.played
      ? 700 + Math.random() * 1200
      : null,
  )

  // Reveal cadence
  useTimeout(
    () => setState((s) => revealNext(s)),
    state.phase === 'revealing' ? (state.revealIndex === 0 ? 600 : 2200) : null,
  )

  // AI judge
  useTimeout(
    () => setState((s) => aiJudgePick(s)),
    state.phase === 'judging' && state.judgeId !== 'you' ? 1600 : null,
  )

  // Advance after round result
  useTimeout(
    () => setState((s) => advanceAfterRound(s)),
    state.phase === 'roundResult' ? 2400 : null,
  )

  const onPlayCard = (index: number) => {
    setState((s) => playPlayerCard(s, index))
  }

  const onJudge = (winnerId: PlayerId) => {
    setState((s) => judgePick(s, winnerId))
  }

  if (state.phase === 'title') {
    return <TitleScreen onStart={start} />
  }

  if (state.phase === 'victory') {
    return <VictoryScreen state={state} onRestart={restart} onTitle={toTitle} />
  }

  return (
    <GameTable
      state={state}
      onPlayCard={onPlayCard}
      onJudge={onJudge}
      onRestart={restart}
    />
  )
}

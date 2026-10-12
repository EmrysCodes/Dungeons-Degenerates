import { useEffect, useRef, useState } from 'react'
import { TitleScreen } from './components/TitleScreen'
import { GameTable } from './components/GameTable'
import { VictoryScreen } from './components/VictoryScreen'
import { HowToPlay } from './components/HowToPlay'
import { ShopPanel } from './components/ShopPanel'
import {
  aiJudgePick,
  armRecklessDraw,
  armSwitcheroo,
  autoPlayNonJudges,
  buyShopItem,
  createInitialState,
  enterShop,
  judgePickBySlot,
  leaveShop,
  playPlayerCard,
  revealNext,
  startMatch,
  usePlayerItem,
} from './game/engine'
import type { GameState } from './game/types'
import type { ItemId } from './data/items'
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

  useEffect(() => {
    if (state.phase === 'revealing' && state.revealIndex !== prevReveal.current) {
      playFlip()
    }
    if (state.phase === 'judging' && prevPhase.current !== 'judging') {
      playJudge()
    }
    if (
      (state.phase === 'roundResult' || state.phase === 'victory' || state.phase === 'shop') &&
      prevPhase.current !== state.phase
    ) {
      if (state.phase !== 'shop') playWin()
    }
    prevPhase.current = state.phase
    prevReveal.current = state.revealIndex
  }, [state.phase, state.revealIndex])

  useTimeout(
    () => setState((s) => autoPlayNonJudges(s)),
    state.phase === 'waiting' && state.judgeId === 'you' ? 900 : null,
  )

  useTimeout(
    () => setState((s) => autoPlayNonJudges(s)),
    state.phase === 'waiting' &&
      state.judgeId !== 'you' &&
      state.submissions.some((s) => s.ownerId === 'you')
      ? 800 + Math.random() * 1800
      : null,
  )

  useTimeout(
    () => setState((s) => revealNext(s)),
    state.phase === 'revealing' ? (state.revealIndex === 0 ? 700 : 3000) : null,
  )

  // AI judge only — human MUST click (no auto-pick)
  useTimeout(
    () => setState((s) => aiJudgePick(s)),
    state.phase === 'judging' && state.judgeId !== 'you' ? 1800 : null,
  )

  // After round result, open shop (human chooses purchases)
  useTimeout(
    () => setState((s) => enterShop(s)),
    state.phase === 'roundResult' ? 2200 : null,
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
        onReckless={() => setState((s) => armRecklessDraw(s))}
        onSwitcheroo={() => setState((s) => armSwitcheroo(s))}
        onUseItem={(uid) => setState((s) => usePlayerItem(s, uid))}
      />
      {state.phase === 'shop' && (
        <ShopPanel
          state={state}
          onBuy={(itemId: ItemId) => setState((s) => buyShopItem(s, itemId))}
          onLeave={() => setState((s) => leaveShop(s))}
        />
      )}
      <HowToPlay open={howto} onClose={() => setHowto(false)} />
    </>
  )
}

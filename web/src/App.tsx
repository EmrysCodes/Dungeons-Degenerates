import { useEffect, useRef, useState } from 'react'
import { MainMenu, type MenuScreen } from './components/MainMenu'
import { RoleSelect } from './components/RoleSelect'
import { RulesPage } from './components/RulesPage'
import { SettingsPage } from './components/SettingsPage'
import { CodexPage } from './components/CodexPage'
import { HowToPlay } from './components/HowToPlay'
import { GameTable } from './components/GameTable'
import { VictoryScreen } from './components/VictoryScreen'
import { ShopPanel } from './components/ShopPanel'
import { PauseMenu } from './components/PauseMenu'
import { InventoryPanel } from './components/InventoryPanel'
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
import type { RoleId } from './data/roles'
import { loadSettings, saveSettings, type Settings } from './game/settings'
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
  const [screen, setScreen] = useState<MenuScreen>('main')
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [settings, setSettings] = useState<Settings>(() => loadSettings())
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null)
  const [paused, setPaused] = useState(false)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [howtoOpen, setHowtoOpen] = useState(false)
  const [settingsOverlay, setSettingsOverlay] = useState(false)
  const prevPhase = useRef(state.phase)
  const prevReveal = useRef(state.revealIndex)

  const updateSettings = (next: Settings) => {
    setSettings(next)
    saveSettings(next)
  }

  const begin = (role?: RoleId | null) => {
    unlockAudio()
    setPaused(false)
    setInventoryOpen(false)
    setState(startMatch({ playerRole: role ?? selectedRole }))
    setScreen('playing')
  }

  const quitToMenu = () => {
    setPaused(false)
    setInventoryOpen(false)
    setState(createInitialState())
    setScreen('main')
  }

  const restart = () => begin(selectedRole)

  useEffect(() => {
    if (screen !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (settingsOverlay) {
        setSettingsOverlay(false)
        return
      }
      if (howtoOpen) {
        setHowtoOpen(false)
        return
      }
      if (inventoryOpen) {
        setInventoryOpen(false)
        return
      }
      setPaused((p) => !p)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, settingsOverlay, howtoOpen, inventoryOpen])

  useEffect(() => {
    if (!settings.sfx) {
      prevPhase.current = state.phase
      prevReveal.current = state.revealIndex
      return
    }
    if (state.phase === 'revealing' && state.revealIndex !== prevReveal.current) playFlip()
    if (state.phase === 'judging' && prevPhase.current !== 'judging') playJudge()
    if (
      (state.phase === 'roundResult' || state.phase === 'victory') &&
      prevPhase.current !== state.phase
    ) {
      playWin()
    }
    prevPhase.current = state.phase
    prevReveal.current = state.revealIndex
  }, [state.phase, state.revealIndex, settings.sfx])

  const pausedPlay = paused || inventoryOpen || howtoOpen || settingsOverlay

  useTimeout(
    () => setState((s) => autoPlayNonJudges(s)),
    !pausedPlay && state.phase === 'waiting' && state.judgeId === 'you' ? 900 : null,
  )

  useTimeout(
    () => setState((s) => autoPlayNonJudges(s)),
    !pausedPlay &&
      state.phase === 'waiting' &&
      state.judgeId !== 'you' &&
      state.submissions.some((s) => s.ownerId === 'you')
      ? 800 + Math.random() * 1800
      : null,
  )

  const revealDelay = settings.fastReveals ? 900 : 3000
  useTimeout(
    () => setState((s) => revealNext(s)),
    !pausedPlay && state.phase === 'revealing'
      ? state.revealIndex === 0
        ? 500
        : revealDelay
      : null,
  )

  useTimeout(
    () => setState((s) => aiJudgePick(s)),
    !pausedPlay && state.phase === 'judging' && state.judgeId !== 'you' ? 1800 : null,
  )

  useTimeout(
    () => setState((s) => enterShop(s)),
    !pausedPlay && state.phase === 'roundResult' ? 2200 : null,
  )

  const sfxTap = () => {
    if (settings.sfx) playTap()
  }

  if (screen === 'main') {
    return (
      <MainMenu
        onNavigate={setScreen}
        onPlay={() => begin(null)}
      />
    )
  }

  if (screen === 'roles') {
    return (
      <RoleSelect
        selected={selectedRole}
        onSelect={setSelectedRole}
        onBack={() => setScreen('main')}
        onConfirm={() => begin(selectedRole)}
      />
    )
  }

  if (screen === 'howto') {
    return <HowToPlay asPage onClose={() => setScreen('main')} />
  }

  if (screen === 'rules') {
    return <RulesPage onBack={() => setScreen('main')} />
  }

  if (screen === 'settings') {
    return (
      <SettingsPage
        settings={settings}
        onChange={updateSettings}
        onBack={() => setScreen('main')}
      />
    )
  }

  if (screen === 'codex') {
    return <CodexPage onBack={() => setScreen('main')} />
  }

  // playing
  if (state.phase === 'victory') {
    return (
      <VictoryScreen
        state={state}
        onRestart={restart}
        onTitle={quitToMenu}
      />
    )
  }

  return (
    <>
      <GameTable
        state={state}
        showPerkDetails={settings.showPerkDetails}
        onPlayCard={(index) => {
          sfxTap()
          setState((s) => playPlayerCard(s, index))
        }}
        onJudgeSlot={(slotId) => {
          sfxTap()
          setState((s) => judgePickBySlot(s, slotId))
        }}
        onMenu={() => setPaused(true)}
        onInventory={() => setInventoryOpen(true)}
        onHowTo={() => setHowtoOpen(true)}
        onReckless={() => setState((s) => armRecklessDraw(s))}
        onSwitcheroo={() => setState((s) => armSwitcheroo(s))}
        onUseItem={(uid) => setState((s) => usePlayerItem(s, uid))}
      />
      {state.phase === 'shop' && !paused && (
        <ShopPanel
          state={state}
          onBuy={(itemId: ItemId) => setState((s) => buyShopItem(s, itemId))}
          onLeave={() => setState((s) => leaveShop(s))}
        />
      )}
      <PauseMenu
        open={paused}
        onResume={() => setPaused(false)}
        onHowTo={() => {
          setPaused(false)
          setHowtoOpen(true)
        }}
        onInventory={() => {
          setPaused(false)
          setInventoryOpen(true)
        }}
        onSettings={() => {
          setPaused(false)
          setSettingsOverlay(true)
        }}
        onQuit={quitToMenu}
      />
      <InventoryPanel
        open={inventoryOpen}
        state={state}
        onClose={() => setInventoryOpen(false)}
        onUseItem={(uid) => setState((s) => usePlayerItem(s, uid))}
      />
      <HowToPlay open={howtoOpen} onClose={() => setHowtoOpen(false)} />
      {settingsOverlay && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <SettingsPage
              embedded
              settings={settings}
              onChange={updateSettings}
              onBack={() => setSettingsOverlay(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}

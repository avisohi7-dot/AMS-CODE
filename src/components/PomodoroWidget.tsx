import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'

type Mode = 'pomodoro' | 'short' | 'long'

const DURATIONS: Record<Mode, number> = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
}

const MODE_LABEL: Record<Mode, string> = {
  pomodoro: 'Pomodoro',
  short: 'Short break',
  long: 'Long break',
}

export function PomodoroWidget() {
  const [mode, setMode] = useState<Mode>('pomodoro')
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.pomodoro)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  function selectMode(m: Mode) {
    setMode(m)
    setSecondsLeft(DURATIONS[m])
    setRunning(false)
  }

  function reset() {
    setSecondsLeft(DURATIONS[mode])
    setRunning(false)
  }

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const secs = String(secondsLeft % 60).padStart(2, '0')

  return (
    <div
      className="rounded-card border border-line-border p-5 text-center"
      style={{
        background:
          'radial-gradient(ellipse 100% 100% at 30% 0%, var(--hero-glow-strong), transparent 60%), var(--hero-surface)',
      }}
    >
      <div className="mb-3 inline-flex rounded-lg border border-white/15 bg-white/5 p-0.5">
        {(['pomodoro', 'short', 'long'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => selectMode(m)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              mode === m ? 'bg-white text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>
      <div className="tabular text-5xl font-bold text-white">
        {mins}:{secs}
      </div>
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black"
        >
          {running ? <Pause size={14} /> : <Play size={14} />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:text-white"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>
    </div>
  )
}

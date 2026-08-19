import { useEffect, useState } from 'react'
import { Card } from './ui'
import { useBrainStore } from '../store'

const TICKS = Array.from({ length: 60 }, (_, i) => i)

export function ClockWidget() {
  const clockStyle = useBrainStore((s) => s.clockStyle)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const dateLabel = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  if (clockStyle === 'digital') {
    const timeLabel = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    return (
      <Card className="flex flex-col items-center justify-center gap-1 p-5">
        <div className="tabular text-4xl font-bold text-ink-primary" style={{ color: 'var(--brand-accent)' }}>
          {timeLabel}
        </div>
        <div className="text-xs text-ink-muted">{dateLabel}</div>
      </Card>
    )
  }

  if (clockStyle === 'minimal') {
    const timeLabel = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    return (
      <Card className="flex flex-col items-center justify-center gap-0.5 p-5">
        <div className="tabular text-2xl font-semibold text-ink-primary">{timeLabel}</div>
        <div className="text-xs text-ink-muted">{dateLabel}</div>
      </Card>
    )
  }

  const hours = now.getHours() % 12
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()

  const hourAngle = hours * 30 + minutes * 0.5
  const minuteAngle = minutes * 6 + seconds * 0.1
  const secondAngle = seconds * 6

  const timeLabel = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <Card className="flex flex-col items-center gap-3 p-5">
      <svg viewBox="0 0 100 100" className="h-32 w-32">
        <circle cx="50" cy="50" r="48" fill="var(--surface-plane)" stroke="var(--gridline)" strokeWidth="1" />
        {TICKS.map((t) => {
          const isHour = t % 5 === 0
          const angle = (t / 60) * 360
          const r1 = isHour ? 40 : 43
          const r2 = 46
          const rad = (angle * Math.PI) / 180
          const x1 = 50 + r1 * Math.sin(rad)
          const y1 = 50 - r1 * Math.cos(rad)
          const x2 = 50 + r2 * Math.sin(rad)
          const y2 = 50 - r2 * Math.cos(rad)
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isHour ? 'var(--text-secondary)' : 'var(--baseline)'}
              strokeWidth={isHour ? 1.4 : 0.7}
              strokeLinecap="round"
            />
          )
        })}
        <line
          x1="50"
          y1="50"
          x2={50 + 24 * Math.sin((hourAngle * Math.PI) / 180)}
          y2={50 - 24 * Math.cos((hourAngle * Math.PI) / 180)}
          stroke="var(--text-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="50"
          x2={50 + 34 * Math.sin((minuteAngle * Math.PI) / 180)}
          y2={50 - 34 * Math.cos((minuteAngle * Math.PI) / 180)}
          stroke="var(--text-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="50"
          x2={50 + 38 * Math.sin((secondAngle * Math.PI) / 180)}
          y2={50 - 38 * Math.cos((secondAngle * Math.PI) / 180)}
          stroke="var(--brand-accent)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="2.2" fill="var(--brand-accent)" />
      </svg>
      <div className="text-center">
        <div className="tabular text-lg font-semibold text-ink-primary">{timeLabel}</div>
        <div className="text-xs text-ink-muted">{dateLabel}</div>
      </div>
    </Card>
  )
}

import { useEffect, useState } from 'react'
import { Card } from './ui'
import { useBrainStore } from '../store'
import type { ClockStyle } from '../types'

const TICKS = Array.from({ length: 60 }, (_, i) => i)
const ROMAN: Record<number, string> = { 12: 'XII', 3: 'III', 6: 'VI', 9: 'IX' }

function pointOnCircle(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: 50 + radius * Math.sin(rad), y: 50 - radius * Math.cos(rad) }
}

function ClassicFace() {
  return (
    <>
      {TICKS.map((t) => {
        const isHour = t % 5 === 0
        const angle = (t / 60) * 360
        const p1 = pointOnCircle(angle, isHour ? 40 : 43)
        const p2 = pointOnCircle(angle, 46)
        return (
          <line
            key={t}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={isHour ? 'var(--text-secondary)' : 'var(--baseline)'}
            strokeWidth={isHour ? 1.4 : 0.7}
            strokeLinecap="round"
          />
        )
      })}
    </>
  )
}

function RomanFace() {
  return (
    <>
      {[1, 2, 4, 5, 7, 8, 10, 11].map((h) => {
        const p1 = pointOnCircle(h * 30, 41)
        const p2 = pointOnCircle(h * 30, 46)
        return (
          <line key={h} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--baseline)" strokeWidth="0.8" strokeLinecap="round" />
        )
      })}
      {Object.entries(ROMAN).map(([h, label]) => {
        const p = pointOnCircle(Number(h) * 30, 34)
        return (
          <text
            key={h}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8"
            fontFamily="Georgia, serif"
            fill="var(--text-secondary)"
          >
            {label}
          </text>
        )
      })}
    </>
  )
}

function NumbersFace() {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
        const p = pointOnCircle(h * 30, 36)
        return (
          <text
            key={h}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="7.5"
            fontWeight="600"
            fill="var(--text-secondary)"
          >
            {h}
          </text>
        )
      })}
    </>
  )
}

function ModernFace() {
  return (
    <>
      {[0, 90, 180, 270].map((angle) => {
        const p = pointOnCircle(angle, 43)
        return <circle key={angle} cx={p.x} cy={p.y} r="1.6" fill="var(--brand-accent)" />
      })}
    </>
  )
}

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
    const timeLabel = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    return (
      <Card className="flex flex-col items-center justify-center gap-1 p-5">
        <div className="tabular text-4xl font-bold" style={{ color: 'var(--brand-accent)' }}>
          {timeLabel}
        </div>
        <div className="text-xs text-ink-muted">{dateLabel}</div>
      </Card>
    )
  }

  if (clockStyle === 'minimal') {
    const timeLabel = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
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

  const isModern = clockStyle === 'analog-modern'
  const hourHandLen = isModern ? 22 : 24
  const minuteHandLen = isModern ? 32 : 34
  const hourHandWidth = isModern ? 4 : 3
  const minuteHandWidth = isModern ? 3 : 2
  const handColor = isModern ? 'var(--brand-accent)' : 'var(--text-primary)'
  const hourTip = pointOnCircle(hourAngle, hourHandLen)
  const minuteTip = pointOnCircle(minuteAngle, minuteHandLen)
  const secondTip = pointOnCircle(secondAngle, 38)

  return (
    <Card className="flex flex-col items-center gap-3 p-5">
      <svg viewBox="0 0 100 100" className="h-32 w-32">
        <circle cx="50" cy="50" r="48" fill="var(--surface-plane)" stroke="var(--gridline)" strokeWidth="1" />
        <ClockFace style={clockStyle} />
        <line x1="50" y1="50" x2={hourTip.x} y2={hourTip.y} stroke={handColor} strokeWidth={hourHandWidth} strokeLinecap="round" />
        <line x1="50" y1="50" x2={minuteTip.x} y2={minuteTip.y} stroke={handColor} strokeWidth={minuteHandWidth} strokeLinecap="round" />
        {!isModern && (
          <line x1="50" y1="50" x2={secondTip.x} y2={secondTip.y} stroke="var(--brand-accent)" strokeWidth="1" strokeLinecap="round" />
        )}
        <circle cx="50" cy="50" r={isModern ? 3.2 : 2.2} fill="var(--brand-accent)" />
      </svg>
      <div className="text-center">
        <div className="tabular text-lg font-semibold text-ink-primary">{timeLabel}</div>
        <div className="text-xs text-ink-muted">{dateLabel}</div>
      </div>
    </Card>
  )
}

function ClockFace({ style }: { style: ClockStyle }) {
  if (style === 'analog-roman') return <RomanFace />
  if (style === 'analog-numbers') return <NumbersFace />
  if (style === 'analog-modern') return <ModernFace />
  return <ClassicFace />
}

import { useEffect, useRef, useState } from 'react'
import './CountdownBar.css'

interface Props {
  seconds: number
  onExpire: () => void
  paused?: boolean
}

export default function CountdownBar({ seconds, onExpire, paused }: Props) {
  const [remaining, setRemaining] = useState(seconds)
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    expiredRef.current = false
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 0.1)
        if (next === 0 && !expiredRef.current) {
          expiredRef.current = true
          setTimeout(() => onExpireRef.current(), 0)
        }
        return next
      })
    }, 100)
    return () => clearInterval(interval)
  }, [paused])

  const pct = (remaining / seconds) * 100
  const colorClass = pct > 50 ? 'bar-green' : pct > 25 ? 'bar-orange' : 'bar-red'

  return (
    <div className="countdown-wrap">
      <div className={`countdown-track`}>
        <div className={`countdown-fill ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`countdown-num ${pct < 25 ? 'num-urgent' : ''}`}>
        {Math.ceil(remaining)}s
      </span>
    </div>
  )
}

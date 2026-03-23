import React, { useState, useEffect, useRef } from 'react'
import './NumberMarquee.css'

/**
 * NumberMarquee — a single large number scrolling horizontally as a banner
 */
export function NumberMarquee({
  number = '3 068 000 000',
  isActive = false,
  color = '#452531',
  duration = 12,
  delay = 0,
}) {
  const [ready, setReady] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isActive && !ready) {
      timerRef.current = setTimeout(() => setReady(true), delay)
    }
    if (!isActive) {
      setReady(false)
      clearTimeout(timerRef.current)
    }
    return () => clearTimeout(timerRef.current)
  }, [isActive, delay, ready])

  const spacer = '\u2003' // em-space
  const text = `${number}${spacer}${number}${spacer}${number}${spacer}`

  return (
    <div className="number-marquee" style={{ color, opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <div
        className="number-marquee__track"
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: ready ? 'running' : 'paused',
        }}
      >
        <span className="number-marquee__text">{text}</span>
        <span className="number-marquee__text">{text}</span>
      </div>
    </div>
  )
}

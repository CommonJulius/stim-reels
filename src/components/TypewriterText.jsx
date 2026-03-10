import React, { useEffect, useState, useMemo } from 'react'
import './TypewriterText.css'

/**
 * Ease-in-out function for stagger distribution.
 * Maps linear progress (0→1) to eased progress (0→1).
 * Words appear slower at start/end, faster in the middle — like an AE range selector with easing.
 */
function easeInOut(t) {
  return t < 0.5
    ? 2 * t * t
    : 1 - (-2 * t + 2) ** 2 / 2
}

/**
 * TypewriterText — Word-by-word typewriter reveal
 *
 * Props:
 * - text: string — The paragraph text
 * - isActive: boolean — Triggers animation
 * - delay: number — Delay before typing starts (ms), default 1000
 * - duration: number — Total typing duration (ms), default 500
 * - className: string
 * - style: object
 * - color: string — default '#050038'
 */
export function TypewriterText({
  text = '',
  isActive = false,
  delay = 1000,
  duration = 800,
  className = '',
  style = {},
  color = '#050038',
}) {
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    if (isActive && !hasTriggered) {
      setHasTriggered(true)
    }
    if (!isActive) {
      setHasTriggered(false)
    }
  }, [isActive])

  // Parse text with *italic* markers into word objects
  const words = useMemo(() => {
    const result = []
    const parts = text.split(/(\*[^*]+\*)/g)
    parts.forEach(part => {
      if (part.startsWith('*') && part.endsWith('*')) {
        part.slice(1, -1).split(/\s+/).filter(Boolean).forEach(w => result.push({ word: w, italic: true }))
      } else {
        part.split(/\s+/).filter(Boolean).forEach(w => result.push({ word: w, italic: false }))
      }
    })
    return result
  }, [text])

  // Pre-calculate eased delays for each word
  const wordDelays = useMemo(() => {
    if (words.length <= 1) return [0]
    return words.map((_, i) => {
      const t = i / (words.length - 1) // 0 → 1 linear
      return Math.round(easeInOut(t) * duration)
    })
  }, [words, duration])

  return (
    <p
      className={`typewriter-text ${hasTriggered ? 'typewriter-text--visible' : ''} ${className}`}
      style={{
        color,
        transitionDelay: hasTriggered ? `${delay}ms` : '0ms',
        ...style,
      }}
    >
      {words.map((item, i) => (
        <React.Fragment key={i}>
          <span
            className={`typewriter-text__word ${hasTriggered ? 'typewriter-text__word--visible' : ''}`}
            style={{
              transitionDelay: hasTriggered
                ? `${delay + wordDelays[i]}ms`
                : '0ms',
              fontStyle: item.italic ? 'italic' : undefined,
            }}
          >
            {item.word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </p>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import './AnimatedText.css'

/**
 * AnimatedText — CSS recreation of the Stim Lottie text reveal
 *
 * Each word slides up with a slight rotation, staggered in sequence.
 * Motion uses the Stim "emphasized" easing: cubic-bezier(0.1, 0.7, 0.6, 1)
 *
 * Props:
 * - text: string — The text to animate (wraps naturally)
 * - isActive: boolean — Triggers the animation when true
 * - delay: number — Initial delay before first word appears (ms), default 450
 * - stagger: number — Delay between each word (ms), default 100
 * - className: string — Additional classes
 * - style: object — Additional inline styles
 * - color: string — Text color, default 'var(--stim-text-dark)'
 * - align: 'left' | 'center' | 'right' — Text alignment, default 'left'
 */
export function AnimatedText({
  text = '',
  isActive = false,
  delay = 450,
  stagger = 100,
  className = '',
  style = {},
  color = '#050038',
  align = 'left',
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

  const words = text.split(/\s+/).filter(Boolean)

  return (
    <div
      className={`animated-text ${className}`}
      style={{
        textAlign: align,
        ...style,
      }}
    >
      <p className="animated-text__line">
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span className="animated-text__word-wrap">
              <span
                className={`animated-text__word ${hasTriggered ? 'animated-text__word--visible' : ''}`}
                style={{
                  color,
                  transitionDelay: hasTriggered ? `${delay + i * stagger}ms` : '0ms',
                }}
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </React.Fragment>
        ))}
      </p>
    </div>
  )
}

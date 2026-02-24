import React, { useState, useEffect, useRef } from 'react'
import { AnimatedText } from './AnimatedText'
import { TypewriterText } from './TypewriterText'
import './StatsReel.css'

/**
 * StatsReel — Sequential scrolling stats animation
 *
 * Replicates the Lottie "Outro 04_Stats" pattern:
 * intro text → stat blocks scroll up one by one.
 * Uses AnimatedText for headings/numbers and TypewriterText for labels.
 */
export function StatsReel({
  isActive = false,
  intro = '',
  stats = [],
  phaseDuration = 3000,
  backgroundColor = '#DEDBFB',
  textColor = '#050038',
  accentColor,
}) {
  const valueColor = accentColor || textColor
  const [currentPhase, setCurrentPhase] = useState(-1)
  const timeoutsRef = useRef([])

  // Total pages = 1 (intro) + stats.length
  const totalPages = 1 + stats.length

  useEffect(() => {
    // Clear any running timeouts
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    if (!isActive) {
      setCurrentPhase(-1)
      return
    }

    // Start phase 0 (intro) immediately
    setCurrentPhase(0)

    // Schedule subsequent phases
    for (let i = 1; i < totalPages; i++) {
      const id = setTimeout(() => {
        setCurrentPhase(i)
      }, i * phaseDuration)
      timeoutsRef.current.push(id)
    }

    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [isActive, totalPages, phaseDuration])

  // translateY percentage for the track
  const trackOffset = currentPhase > 0 ? currentPhase * (100 / totalPages) : 0

  return (
    <div className="stats-reel" style={{ backgroundColor }}>
      <div
        className="stats-reel__track"
        style={{
          height: `${totalPages * 100}%`,
          transform: `translateY(-${trackOffset}%)`,
        }}
      >
        {/* Intro page */}
        <div className="stats-reel__page" style={{ height: `${100 / totalPages}%` }}>
          <div className="stats-reel__intro">
            <AnimatedText
              text={intro}
              isActive={currentPhase === 0}
              color={textColor}
              delay={300}
              stagger={80}
            />
          </div>
        </div>

        {/* Stat pages */}
        {stats.map((stat, i) => (
          <div
            key={i}
            className="stats-reel__page"
            style={{ height: `${100 / totalPages}%` }}
          >
            <div className="stats-reel__stat">
              <div className="stats-reel__value">
                <AnimatedText
                  text={stat.value}
                  isActive={currentPhase === i + 1}
                  color={valueColor}
                  delay={200}
                  stagger={80}
                  style={{ fontStyle: 'italic' }}
                />
              </div>
              <div className="stats-reel__label">
                <TypewriterText
                  text={stat.label}
                  isActive={currentPhase === i + 1}
                  color={textColor}
                  delay={600}
                  duration={500}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

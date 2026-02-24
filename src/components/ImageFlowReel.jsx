import React, { useState, useEffect, useMemo, useRef } from 'react'
import { TypewriterText } from './TypewriterText'
import { CircleDoodle } from './CircleDoodle'
import './ImageFlowReel.css'

/**
 * ImageFlowReel — Animated image reel with 3 phases:
 * 1. Images flow upward in staggered columns (editorial collage)
 * 2. Text appears once images pass the top
 * 3. Images re-enter at the bottom as a slowly rotating carousel
 */
export function ImageFlowReel({
  images = [],
  isActive = false,
  backgroundColor = '#050038',
  textColor = '#ffffff',
  bodyColor,
  heading = '',
  body = '',
}) {
  const [phase, setPhase] = useState('idle')
  const [hasTriggered, setHasTriggered] = useState(false)
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(id => clearTimeout(id))
    timersRef.current = []
  }

  useEffect(() => {
    if (!isActive) {
      setPhase('idle')
      setHasTriggered(false)
      clearTimers()
    }
  }, [isActive])

  useEffect(() => {
    if (isActive && !hasTriggered) {
      setHasTriggered(true)
      setPhase('flow-up')

      const textStart = 3400
      const t1 = setTimeout(() => setPhase('text'), textStart)
      timersRef.current.push(t1)

      const t2 = setTimeout(() => setPhase('carousel'), textStart + 900)
      timersRef.current.push(t2)
    }
  }, [isActive, hasTriggered])

  // Split into two columns
  const columns = useMemo(() => {
    const col1 = []
    const col2 = []
    images.forEach((img, i) => {
      if (i % 2 === 0) col1.push({ src: img, index: i })
      else col2.push({ src: img, index: i })
    })
    return [col1, col2]
  }, [images])

  // Carousel: fanned stack of images in a bowl/arc shape
  // Only show a subset — like physical photos spread on a table
  const carouselImages = useMemo(() => {
    if (images.length === 0) return []
    // Use up to 7 images for the fan
    const subset = images.slice(0, Math.min(images.length, 7))
    const count = subset.length
    const totalSpread = 70 // cqi — how wide the fan spreads
    const startX = (100 - totalSpread) / 2 // center the fan

    return subset.map((src, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1) // 0 → 1
      // X: spread evenly across the fan width
      const cx = startX + t * totalSpread
      // Bowl arc: center dips DOWN, edges sit higher
      // Use negative cosine so center is lowest
      const arcDepth = 8 // cqi — how deep the bowl dips
      const cy = -(Math.cos((t - 0.5) * Math.PI) * arcDepth) // negative = lower
      // Fan rotation: edges tilt outward
      const rotation = (t - 0.5) * 12
      return { src, index: i, cx, cy, rotation }
    })
  }, [images])

  const isFlowing = phase === 'flow-up'
  const showText = phase === 'text' || phase === 'carousel'

  return (
    <div
      className={`image-flow-reel image-flow-reel--${phase}`}
      style={{ backgroundColor }}
    >
      {/* Circle doodle line art — centered top, starts with text */}
      <CircleDoodle isActive={showText} />

      {/* Phase 1: Staggered flowing columns — each image moves independently */}
      <div className="image-flow-columns">
        {columns.map((col, colIndex) => (
          <div
            className="image-flow-column"
            key={colIndex}
          >
            {col.map(({ src, index }, itemIndex) => {
              // Per-image stagger: column offset + item position within column
              const baseDelay = colIndex * 120
              const itemDelay = baseDelay + itemIndex * 120
              return (
                <div
                  className={`image-flow-item ${isFlowing ? 'image-flow-item--active' : ''}`}
                  key={index}
                  style={{
                    '--item-delay': `${itemDelay}ms`,
                    '--item-duration': `${4500 + itemIndex * 150}ms`,
                  }}
                >
                  <img src={src} alt="" draggable={false} />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Phase 2: Text */}
      <div className={`image-flow-text ${showText ? 'image-flow-text--visible' : ''}`}>
        <h2 className="image-flow-heading" style={{ color: textColor }}>
          {heading.split(/\s+/).filter(Boolean).map((word, i, arr) => (
            <React.Fragment key={i}>
              <span className="image-flow-heading__wrap">
                <span
                  className={`image-flow-heading__word ${showText ? 'image-flow-heading__word--visible' : ''}`}
                  style={{
                    color: textColor,
                    transitionDelay: showText ? `${i * 100}ms` : '0ms',
                  }}
                >
                  {word}
                </span>
              </span>
              {i < arr.length - 1 ? ' ' : null}
            </React.Fragment>
          ))}
        </h2>
        <TypewriterText
          text={body}
          isActive={showText}
          color={bodyColor || textColor}
          delay={400}
          className="image-flow-body-typewriter"
        />
      </div>

      {/* Phase 3: Fanned carousel with bowl arc */}
      <div className={`image-flow-carousel ${phase === 'carousel' ? 'image-flow-carousel--visible' : ''}`}>
        <div className="image-flow-carousel-track">
          {carouselImages.map(({ src, index, cx, cy, rotation }, i) => (
            <div
              className="image-flow-carousel-item"
              key={index}
              style={{
                '--cx': `${cx}cqi`,
                '--cy': `${cy}cqi`,
                '--rot': `${rotation}deg`,
                '--enter-delay': `${i * 80}ms`,
                zIndex: i,
              }}
            >
              <img src={src} alt="" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

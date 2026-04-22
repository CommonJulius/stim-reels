import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { TypewriterText } from './TypewriterText'
import { CircleDoodle } from './CircleDoodle'
import './ImageFlowReel.css'

/**
 * ImageFlowReel — Animated image reel with 3 phases:
 * 1. Lottie animation of images flowing (replaces coded columns)
 * 2. Text appears once Lottie nears completion
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
  skipFlowPhase = false,
  carouselLottieSrc = '/image-carousel-bg.json',
}) {
  const [phase, setPhase] = useState('idle')
  const [hasTriggered, setHasTriggered] = useState(false)
  const timersRef = useRef([])
  const lottieRef = useRef(null)
  const lottieLoadedRef = useRef(false)
  const carouselLottieRef = useRef(null)
  const carouselLoadedRef = useRef(false)
  const isActiveRef = useRef(isActive)

  isActiveRef.current = isActive

  const clearTimers = () => {
    timersRef.current.forEach(id => clearTimeout(id))
    timersRef.current = []
  }

  useEffect(() => {
    if (!isActive) {
      setPhase('idle')
      setHasTriggered(false)
      clearTimers()
      if (lottieRef.current) lottieRef.current.stop()
      if (carouselLottieRef.current) carouselLottieRef.current.stop()
    }
  }, [isActive])

  useEffect(() => {
    if (isActive && !hasTriggered) {
      setHasTriggered(true)

      if (skipFlowPhase) {
        // Skip straight to text, then carousel shortly after
        setPhase('text')
        const t1 = setTimeout(() => setPhase('carousel'), 900)
        timersRef.current.push(t1)
      } else {
        setPhase('flow-up')

        // Start the Lottie
        if (lottieRef.current && lottieLoadedRef.current) {
          lottieRef.current.play()
        }

        // Lottie sped up to ~4.5s — start text near the end, carousel shortly after
        const textStart = 3800
        const t1 = setTimeout(() => setPhase('text'), textStart)
        timersRef.current.push(t1)

        const t2 = setTimeout(() => setPhase('carousel'), textStart + 900)
        timersRef.current.push(t2)
      }
    }
  }, [isActive, hasTriggered, skipFlowPhase])

  const handleLottieEvent = useCallback((event) => {
    if (event === 'load') {
      lottieLoadedRef.current = true
      if (isActiveRef.current && lottieRef.current) {
        lottieRef.current.play()
      }
    }
  }, [])

  const handleCarouselLottieEvent = useCallback((event) => {
    if (event === 'load') {
      carouselLoadedRef.current = true
    }
  }, [])

  // Start carousel Lottie when carousel phase begins
  useEffect(() => {
    if (phase === 'carousel' && carouselLottieRef.current && carouselLoadedRef.current) {
      carouselLottieRef.current.play()
    }
  }, [phase])

  const showText = phase === 'text' || phase === 'carousel'

  return (
    <div
      className={`image-flow-reel image-flow-reel--${phase}`}
      style={{ backgroundColor }}
    >
      {/* Circle doodle line art — centered top, starts with text */}
      <CircleDoodle isActive={showText} />

      {/* Phase 1: Lottie image flow animation */}
      <div className="image-flow-lottie">
        <Player
          ref={lottieRef}
          src="/image-flow-bg.json"
          loop={false}
          autoplay={false}
          keepLastFrame={true}
          speed={1.33}
          background="transparent"
          renderer="svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          onEvent={handleLottieEvent}
        />
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

      {/* Phase 3: Carousel Lottie (DotLottie / Thor renderer) */}
      <div className={`image-flow-carousel ${phase === 'carousel' ? 'image-flow-carousel--visible' : ''}`}>
        {phase === 'carousel' && (
          <DotLottieReact
            src={carouselLottieSrc}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
    </div>
  )
}

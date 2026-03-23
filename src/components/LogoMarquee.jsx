import React, { useState, useEffect } from 'react'
import './LogoMarquee.css'

const defaultLogos = [
  { src: '/images/Skap.png', alt: 'SKAP', width: '22cqi' },
  { src: '/images/Musikförläggarna.png', alt: 'Musikförläggarna', width: '23cqi' },
  { src: '/images/FST.png', alt: 'FST', width: '35cqi' },
  { src: '/images/Svensk Musik.png', alt: 'Svensk Musik', width: '44cqi' },
]

/**
 * LogoMarquee — infinite horizontal scrolling logo banner
 */
export function LogoMarquee({
  logos = defaultLogos,
  isActive = false,
  duration = 30,
  delay = 0,
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setReady(false)
      return
    }
    if (delay <= 0) {
      setReady(true)
      return
    }
    const t = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(t)
  }, [isActive, delay])

  const logoSet = logos.map((logo, i) => (
    <img
      key={i}
      className="logo-marquee__logo"
      src={logo.src}
      alt={logo.alt}
      style={logo.width ? { width: logo.width, height: 'auto' } : undefined}
    />
  ))

  return (
    <div
      className="logo-marquee"
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }}
    >
      <div
        className="logo-marquee__track"
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: ready && isActive ? 'running' : 'paused',
        }}
      >
        {logoSet}
        {logoSet}
        {logoSet}
      </div>
    </div>
  )
}

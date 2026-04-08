import { useState, useEffect } from 'react'
import './ImageReveal.css'

/**
 * ImageReveal — animates an image in using scale + clip-path (inset → full).
 * Mimics the dotlottie image reveal effect from the Musikfrämjande collection.
 */
export function ImageReveal({ src, alt = '', isActive, delay = 0, credit, variant = 'top' }) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setAnimate(true), delay)
      return () => clearTimeout(timer)
    } else {
      setAnimate(false)
    }
  }, [isActive, delay])

  return (
    <div className={`image-reveal ${variant === 'bottom' ? 'image-reveal--bottom' : ''}`}>
      <div className={`image-reveal__wrapper ${animate ? 'image-reveal__wrapper--active' : ''}`}>
        <img
          src={src}
          alt={alt}
          className={`image-reveal__img ${animate ? 'image-reveal__img--active' : ''}`}
        />
      </div>
      {credit && (
        <span className={`image-reveal__credit ${animate ? 'image-reveal__credit--active' : ''}`}>
          {credit}
        </span>
      )}
    </div>
  )
}

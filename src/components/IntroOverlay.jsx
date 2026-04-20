import { useState, useEffect, useRef } from 'react'
import './IntroOverlay.css'

export function IntroOverlay({ isActive, delay = 2500 }) {
  const [showOverlay, setShowOverlay] = useState(false)
  const dismissed = useRef(false)
  const hintInterval = useRef(null)
  const hintTimeout = useRef(null)
  const rafId = useRef(null)
  const cancelled = useRef(false)

  // Show overlay after delay
  useEffect(() => {
    if (dismissed.current) return

    if (isActive) {
      const timer = setTimeout(() => setShowOverlay(true), delay)
      return () => clearTimeout(timer)
    } else if (showOverlay) {
      dismissed.current = true
      setShowOverlay(false)
    }
  }, [isActive, showOverlay, delay])

  // Scroll hint bounce animation — custom easing with bounce
  useEffect(() => {
    if (!showOverlay) {
      clearInterval(hintInterval.current)
      clearTimeout(hintTimeout.current)
      return
    }

    const container = document.querySelector('.reels-container')
    if (!container) return

    cancelled.current = false

    const disableScrollBehavior = () => {
      container.style.scrollSnapType = 'none'
      container.style.scrollBehavior = 'auto'
    }

    const restoreScrollBehavior = () => {
      container.style.scrollSnapType = ''
      container.style.scrollBehavior = ''
    }

    // Gentle bounce ease — slight overshoot then settle
    const bounceEase = (t) => {
      if (t <= 0) return 0
      if (t >= 1) return 1
      // Soft overshoot (~15%) with one gentle bounce
      const c1 = 1.7
      const c3 = c1 + 1
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
    }

    const animateScroll = (from, to, duration, onDone) => {
      const start = performance.now()
      const step = (now) => {
        if (cancelled.current || dismissed.current) {
          container.scrollTop = 0
          restoreScrollBehavior()
          return
        }
        const elapsed = Math.min((now - start) / duration, 1)
        const eased = bounceEase(elapsed)
        container.scrollTop = from + (to - from) * eased
        if (elapsed < 1) {
          rafId.current = requestAnimationFrame(step)
        } else if (onDone) {
          onDone()
        }
      }
      rafId.current = requestAnimationFrame(step)
    }

    const doHint = () => {
      if (cancelled.current || dismissed.current) return
      disableScrollBehavior()

      // Scroll down 55px with weight, then bounce back
      animateScroll(0, 55, 600, () => {
        animateScroll(55, 0, 800, () => {
          restoreScrollBehavior()
        })
      })
    }

    // Kill hint immediately on any user interaction
    const killHint = () => {
      cancelled.current = true
      dismissed.current = true
      clearTimeout(hintTimeout.current)
      clearInterval(hintInterval.current)
      if (rafId.current) cancelAnimationFrame(rafId.current)
      restoreScrollBehavior()
      setShowOverlay(false)
    }

    container.addEventListener('touchstart', killHint, { once: true })
    container.addEventListener('wheel', killHint, { once: true })

    // First bounce after short delay
    hintTimeout.current = setTimeout(doHint, 800)
    // Then loop every 6s
    hintInterval.current = setInterval(doHint, 6000)

    return () => {
      cancelled.current = true
      clearTimeout(hintTimeout.current)
      clearInterval(hintInterval.current)
      if (rafId.current) cancelAnimationFrame(rafId.current)
      container.scrollTop = 0
      restoreScrollBehavior()
      container.removeEventListener('touchstart', killHint)
      container.removeEventListener('wheel', killHint)
    }
  }, [showOverlay])

  if (dismissed.current && !showOverlay) return null

  return (
    <div className={`intro-overlay ${showOverlay ? 'intro-overlay--visible' : ''}`}>
      <div className="intro-overlay__content">
        <div className="intro-overlay__icons">
          {/* Upward arrow */}
          <svg className="intro-overlay__arrow" viewBox="0 0 8 65" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.03553 0.146447C3.84027 -0.0488155 3.52369 -0.0488155 3.32843 0.146447L0.146447 3.32843C-0.0488155 3.52369 -0.0488155 3.84027 0.146447 4.03553C0.341709 4.2308 0.658291 4.2308 0.853554 4.03553L3.68198 1.20711L6.51041 4.03553C6.70567 4.2308 7.02225 4.2308 7.21751 4.03553C7.41278 3.84027 7.41278 3.52369 7.21751 3.32843L4.03553 0.146447ZM3.68198 0.5H3.18198V64.5H3.68198H4.18198V0.5H3.68198Z" fill="white"/>
          </svg>
          {/* Hand pointer (flipped to swipe-up orientation) */}
          <svg className="intro-overlay__hand" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.1751 34.4005L29.8213 38.785C31.2953 39.392 33.0309 38.6781 33.4852 37.0933C34.1922 34.6271 33.1227 34.143 28.3259 29.0822L34.0722 23.0196L43.2879 13.3535C44.2981 12.2938 44.2236 10.5465 43.1272 9.5868C42.1678 8.74703 40.7601 8.81604 39.8786 9.74605L31.5 18L22.5578 10.6324C21.4032 9.73521 19.8122 9.85227 18.8115 10.9081L7.87282 22.4762M19.1751 34.4005L7.87282 22.4762M19.1751 34.4005L16.134 37.6089C15.0143 38.7902 13.1866 38.7773 12.0516 37.5798L4.85933 29.9917C3.72443 28.7943 3.71206 26.866 4.83175 25.6846L7.87282 22.4762" stroke="white" strokeWidth="1.5" strokeMiterlimit="16" strokeLinecap="square" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="intro-overlay__text">Svep uppåt för mer</p>
      </div>
    </div>
  )
}

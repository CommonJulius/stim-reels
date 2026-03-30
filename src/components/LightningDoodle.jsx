import React, { useState, useEffect, useRef } from 'react'

const LIGHTNING_PATH = "M128.5 0.773438C109.337 34.9123 69.9926 104.221 46.9126 147.618C23.8327 191.015 17.2235 207.327 12.1228 221.43C7.02201 235.533 3.62992 246.933 1.64149 254.631C-0.346946 262.328 -0.828926 265.977 49.4944 226.692C99.8178 187.407 198.961 108.077 261.724 54.5964C324.486 1.11581 345.802 -21.0207 315.11 29.0877C284.417 79.196 203.069 199.22 153.767 275.526C104.464 351.832 91.733 377.691 84.978 392.146C78.2229 406.601 77.8301 408.868 131.585 380.157C185.34 351.446 293.254 291.688 353.139 259.342C413.023 226.996 421.608 223.872 377.589 291.838C333.57 359.804 236.687 498.956 188.445 569.644C140.203 640.333 143.537 638.342 189.704 604.226C235.871 570.11 324.77 503.931 383.024 463.315C441.278 422.7 466.193 409.654 480.254 402.689C494.315 395.724 496.768 395.234 495.639 398.896C494.51 402.559 489.725 410.389 441.575 485.812C393.425 561.234 400.011 550.804 352 626.273"

let instanceCount = 0

const DEFAULTS = {
  baseFrequency: 0.1,
  scale: 3,
  numOctaves: 5,
  seed: 42,
  strokeWidth: 3,
}

/**
 * LightningDoodle — Animated lightning/zigzag line art with organic rough edges
 *
 * Same approach as ScribbleDoodle: feTurbulence displacement filter,
 * stepped trim path at 48fps, cel jitter on seed/scale.
 */
export function LightningDoodle({
  isActive = false,
  color = '#CCC5F7',
  duration = 2.5,
  style = {},
}) {
  const idsRef = useRef(null)
  if (!idsRef.current) {
    const n = ++instanceCount
    idsRef.current = { filter: `ld-filter-${n}` }
  }
  const filterId = idsRef.current.filter
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)
  const [dashOffset, setDashOffset] = useState(null)

  const [t, setT] = useState(DEFAULTS)

  // Cel-animation jitter — every 500ms
  useEffect(() => {
    if (!isActive) return
    const interval = 500
    let lastTime = 0
    let rafId

    const tick = (time) => {
      rafId = requestAnimationFrame(tick)
      if (time - lastTime < interval) return
      lastTime = time
      setT(prev => ({
        ...prev,
        seed: prev.seed + 1,
        scale: DEFAULTS.scale + (Math.random() - 0.5) * 0.8,
      }))
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive])

  // Measure path length on mount
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength()
      setPathLength(length)
    }
  }, [])

  // Stepped trim-path animation at 48fps
  useEffect(() => {
    if (!isActive || pathLength <= 0) {
      setDashOffset(pathLength || 9999)
      return
    }

    const DRAW_FPS = 48
    const interval = 1000 / DRAW_FPS
    const totalFrames = Math.round(duration * DRAW_FPS)
    let frame = 0
    let lastTime = 0
    let rafId

    const tick = (time) => {
      if (frame >= totalFrames) {
        setDashOffset(0)
        return
      }
      rafId = requestAnimationFrame(tick)
      if (lastTime && time - lastTime < interval) return
      lastTime = time
      frame++
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3)
      setDashOffset(pathLength * (1 - progress))
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, pathLength, duration])

  const dashStyle = {
    strokeDasharray: pathLength || 9999,
    strokeDashoffset: dashOffset ?? (pathLength || 9999),
  }

  return (
    <div style={style}>
      <svg
        viewBox="0 0 497 629"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="linearRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={t.baseFrequency}
              numOctaves={t.numOctaves}
              seed={t.seed}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={t.scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`}>
          <path
            ref={pathRef}
            d={LIGHTNING_PATH}
            fill="none"
            stroke={color}
            strokeWidth={t.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={dashStyle}
          />
        </g>
      </svg>
    </div>
  )
}

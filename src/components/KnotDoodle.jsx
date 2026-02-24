import React, { useState, useEffect, useRef } from 'react'

// Knot doodle path extracted from Vectors/Knot doodle.svg
const KNOT_PATH = "M390.804 29.3418C387.99 42.4866 382.363 60.448 369.643 71.4853C356.922 82.5227 337.278 86.0917 318.28 87.5903C300.617 88.9836 281.523 88.4091 266.6 84.6237C251.677 80.8384 240.127 73.9683 232.756 58.6608C225.384 43.3534 222.541 19.8169 210.712 9.15054C198.883 -1.51583 178.154 1.40115 155.683 7.23915C133.212 13.0772 109.627 21.7478 92.0313 30.7169C74.4356 39.6861 63.5436 48.6909 66.9352 53.6812C70.3268 58.6715 88.3321 59.3743 121.958 58.255C155.585 57.1356 204.287 54.1727 233.979 52.0702C263.671 49.9676 272.879 48.815 274.875 53.6826C276.871 58.5501 271.377 69.4725 263.564 81.1761C255.752 92.8796 245.787 105.033 239.285 111.582C232.783 118.13 230.045 118.705 228.036 110.2C226.027 101.695 224.829 84.0926 227.468 69.3245C230.107 54.5565 236.618 43.1565 241.07 36.3503C245.523 29.5442 247.719 27.6773 250.069 28.39C252.42 29.1026 254.859 32.4513 253.088 44.0933C251.317 55.7353 245.261 75.5693 226.529 93.7022C222.058 98.0303 214.011 108.313 180.117 117.03C146.222 125.748 73.1656 122.226 43.6029 122.006C14.0403 121.786 13.0386 121.286 0.117188 120.53"

let instanceCount = 0

const DEFAULTS = {
  baseFrequency: 0.1,
  scale: 3,
  numOctaves: 5,
  seed: 42,
  strokeWidth: 3,
}

/**
 * KnotDoodle — Animated knot line art with organic rough edges
 *
 * Same approach as CircleDoodle: feTurbulence displacement filter,
 * stepped trim path at 48fps, cel jitter on seed/scale.
 */
export function KnotDoodle({
  isActive = false,
  strokeColor = '#A9A0E1',
  duration = 2,
  style = {},
}) {
  const idsRef = useRef(null)
  if (!idsRef.current) {
    const n = ++instanceCount
    idsRef.current = { filter: `kd-filter-${n}` }
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
        viewBox="0 0 393 125"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
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
            d={KNOT_PATH}
            fill="none"
            stroke={strokeColor}
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

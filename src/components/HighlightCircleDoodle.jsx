import React, { useState, useEffect, useRef } from 'react'

const HIGHLIGHT_PATH = "M59.7988 66.0195C124.29 78.1457 188.652 80.7438 251.956 64.631C263.291 61.7442 274.466 58.1806 284.045 52.8021C292.106 48.2728 297.771 43.4979 295.589 36.2091C294.327 32.004 290.123 28.6613 285.594 26.0114C280.089 22.777 273.9 20.23 267.543 17.9711C216.73 -0.064659 159.087 -1.43612 102.859 3.38825C78.044 5.52474 51.6451 8.19541 28.094 14.8859C17.7885 17.8115 7.82507 23.7888 6.47253 31.9196C5.10341 40.0733 12.0338 48.0968 20.9422 52.871C59.1903 73.3214 92.6201 74.7454 132.638 77.3853C154.586 78.8334 176.75 79.2267 198.748 77.6057C220.824 75.9743 242.024 71.7367 263.019 66.4029C265.955 65.6566 268.879 64.8403 271.699 63.883C277.022 62.0797 282.103 59.703 286.201 56.5673C290.298 53.4315 294.435 48.9708 294.539 44.5886C294.61 41.7525 292.831 39.0744 290.726 36.7286C285.395 30.7992 277.728 26.2297 269.59 22.4555C247.339 12.1191 221.148 7.14171 194.916 5.41953C168.699 3.69759 142.243 5.11158 115.965 6.7492C79.3521 9.00964 40.8879 12.2189 10.6799 28.018C7.90205 29.4644 5.16477 31.0626 3.41949 33.2223C-5.47121 44.2158 12.1854 54.6107 23.431 58.7691C57.0439 71.2192 82.2988 74.5195 101.299 73.0195"

let instanceCount = 0

const DEFAULTS = {
  baseFrequency: 0.1,
  scale: 3,
  numOctaves: 5,
  seed: 42,
  strokeWidth: 2,
}

/**
 * HighlightCircleDoodle — Animated elliptical highlight circle with organic rough edges
 */
export function HighlightCircleDoodle({
  isActive = false,
  color = '#CCC5F7',
  duration = 2,
  delay = 0,
  style = {},
}) {
  const [delayDone, setDelayDone] = useState(delay === 0)

  useEffect(() => {
    if (!isActive || delay === 0) {
      if (!isActive) setDelayDone(false)
      return
    }
    const timer = setTimeout(() => setDelayDone(true), delay)
    return () => clearTimeout(timer)
  }, [isActive, delay])
  const idsRef = useRef(null)
  if (!idsRef.current) {
    const n = ++instanceCount
    idsRef.current = { filter: `hc-filter-${n}` }
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
    if (!delayDone || pathLength <= 0) {
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
  }, [delayDone, pathLength, duration])

  const dashStyle = {
    strokeDasharray: pathLength || 9999,
    strokeDashoffset: dashOffset ?? (pathLength || 9999),
  }

  return (
    <div style={style}>
      <svg
        viewBox="0 0 298 80"
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
            d={HIGHLIGHT_PATH}
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

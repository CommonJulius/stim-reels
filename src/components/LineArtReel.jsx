import React, { useState, useEffect, useRef } from 'react'
import './LineArtReel.css'

// Centerline path extracted from Figma
const STROKE_PATH = "M108.938 458.505C108.938 450.779 108.778 459.127 108.698 373.113C108.617 287.1 108.537 114.752 104.918 43.5198C101.299 -27.7123 94.1423 7.39385 88.7266 54.0823C83.3109 100.771 79.8529 157.978 78.9975 196.051C78.1421 234.125 79.994 251.332 82.2647 249.566C84.5354 247.8 87.1687 226.54 86.0828 198.938C84.9968 171.335 80.1119 138.034 70.9353 115.676C61.7588 93.3188 48.4386 82.9141 36.5462 76.9726C24.6538 71.0312 14.5927 69.8683 8.15365 69.3578C1.71462 68.8473 -0.797473 69.0246 13.3636 72.9211C27.5246 76.8177 58.4349 84.4282 109.051 92.4234C159.668 100.419 229.054 108.568 261.994 114.338C294.935 120.108 289.329 123.251 264.915 131.815C240.501 140.379 197.45 154.269 153.368 164.01C109.285 173.751 65.4761 178.921 39.2228 179.64C12.9695 180.359 5.59961 176.468 30.0963 164.643C54.5929 152.817 111.18 133.174 144.862 122.339C178.544 111.504 187.606 110.072 180.321 141.897C173.036 173.722 149.129 238.849 135.354 245.612C121.58 252.376 118.662 198.802 112.385 158.101C106.107 117.399 96.5582 91.1929 87.8219 76.2196C79.0856 61.2464 71.4516 58.3002 66.1761 58.2013C60.9005 58.1024 58.2148 60.9401 56.9253 63.3152C55.6358 65.6904 55.8239 67.517 81.588 70.1689C107.352 72.8208 158.687 76.2427 181.056 77.716C203.425 79.1894 195.274 78.6107 186.876 78.0144"

/**
 * LineArtReel — Organic brush stroke with animated draw-on
 *
 * Uses a single stroke path with feTurbulence displacement filter
 * for organic/rough edges. Stepped trim-path animation at 48fps.
 * Cel-animation jitter cycles seed/scale every 500ms.
 */
let instanceCount = 0

// Default tuning values
const DEFAULTS = {
  baseFrequency: 0.1,
  scale: 3,
  numOctaves: 5,
  seed: 78,
  baseStrokeWidth: 5,
}

export function LineArtReel({
  isActive = false,
  backgroundColor = '#DEDBFB',
  brushColor = '#050038',
  duration = 3,
  debug = false, // set to true to show tuning GUI
}) {
  const idsRef = useRef(null)
  if (!idsRef.current) {
    const n = ++instanceCount
    idsRef.current = { filter: `lar-filter-${n}` }
  }
  const filterId = idsRef.current.filter
  const clipPathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)
  const [dashOffset, setDashOffset] = useState(null)

  // Filter tuning state (for cel jitter)
  const [t, setT] = useState(DEFAULTS)

  // Cel-animation jitter — every 12th frame at 24fps = 500ms
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
    if (clipPathRef.current) {
      const length = clipPathRef.current.getTotalLength()
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
      // Ease-out: fast start, slow finish
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3)
      setDashOffset(pathLength * (1 - progress))
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, pathLength, duration])

  // Shared dash style — no CSS transition, driven by JS
  const dashStyle = {
    strokeDasharray: pathLength || 9999,
    strokeDashoffset: dashOffset ?? (pathLength || 9999),
  }

  // Replay helper
  const replay = () => {
    setDashOffset(pathLength || 9999)
    setTimeout(() => {
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
    }, 50)
  }

  return (
    <div
      className="line-art-reel"
      style={{ backgroundColor }}
    >
      <svg
        className="line-art-svg"
        viewBox="-10 -10 308 479"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Displacement filter for organic rough edges */}
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

        {/* Filtered stroke */}
        <g filter={`url(#${filterId})`}>
          <path
            ref={clipPathRef}
            d={STROKE_PATH}
            fill="none"
            stroke={brushColor}
            strokeWidth={t.baseStrokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={dashStyle}
          />
        </g>
      </svg>

      {/* ── DEBUG: Replay button ── */}
      {debug && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 100,
        }}>
          <button onClick={replay} style={{
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: 4,
            padding: '6px 12px',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}>▶ Replay</button>
        </div>
      )}
    </div>
  )
}

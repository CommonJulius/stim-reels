import React, { useState, useEffect, useRef } from 'react'

// Circle doodle path extracted from Figma
const CIRCLE_PATH = "M251.225 60.5645C249.338 60.3488 223.338 50.0645 213.741 50.0645C199.725 50.0645 184.128 50.854 159.503 53.4358C134.878 56.0177 111.852 61.2551 96.0521 68.8629C80.252 76.4706 72.3756 86.29 64.4717 98.2766C56.5677 110.263 48.875 124.119 42.1957 139.744C35.5165 155.368 30.0838 172.341 27.0502 187.692C21.4709 215.925 27.1808 236.847 36.8258 250.333C46.9784 264.528 64.3634 271.316 83.1402 275.318C93.5887 277.546 106.495 276.72 120.906 274.109C135.317 271.497 150.993 266.243 167.24 258.209C183.488 250.176 199.832 239.523 213.741 228.532C227.649 217.541 238.627 206.535 247.531 195.559C256.435 184.583 262.933 173.971 267.44 161.846C271.948 149.722 274.268 136.407 275.722 122.352C277.176 108.297 277.694 93.9052 276.744 82.1877C275.079 61.6505 263.792 43.9275 248.156 27.0667C232.392 10.0673 210.228 4.85862 190.778 3.15514C180.671 2.26988 169.926 5.04189 149.843 14.873C129.761 24.704 100.627 42.4559 80.3867 55.6618C60.146 68.8677 49.6809 76.9897 41.4729 84.8905C26.5898 99.2167 19.4931 113.957 14.4553 129.416C11.4286 138.703 8.74651 151.319 6.61879 168.052C4.49107 184.785 3.33108 205.356 3.02544 218.708C2.59374 237.567 7.65202 250.534 18.521 264.564C31.7744 281.672 54.4726 285.579 71.3259 289.489C80.3645 291.585 90.6636 292.631 102.071 292.494C113.478 292.357 125.75 290.679 139.127 286.076C152.503 281.474 166.61 273.997 180.493 265.426C194.375 256.854 207.605 247.414 218.806 238.438C230.007 229.463 238.779 221.238 246.469 212.605C261.351 195.898 269.876 179.15 274.723 164.89C279.554 150.677 276.258 130.917 268.707 107.687C264.828 95.7543 256.901 84.9985 249.563 75.4881C235.737 57.5694 221.517 47.5984 206.109 40.8284C196.362 36.5457 181.819 32.7051 169.46 30.2763C147.39 25.9391 131.745 28.1617 120.524 32.0718C106.318 37.0225 90.0207 54.2329 69.8458 74.2068C59.7717 84.1805 51.3742 95.1377 44.4539 104.732C31.9575 122.059 24.362 140.006 18.6526 156.865C13.8606 171.015 13.8565 193.038 16.3281 219.017C18.1204 237.855 31.9037 248.615 43.0159 258.467C55.8487 269.845 73.0243 275.597 97.837 278.228C114.39 279.983 139.315 277.978 159.271 275.556C179.228 273.134 193.544 269.177 207.327 263.92C221.11 258.663 233.926 252.227 244.729 244.894C265.078 231.08 276.619 213.186 283.483 196.01C290.727 177.88 289.242 155.225 286.891 132.984C280.36 112.717 272.138 97.4229 265.678 88.4083C262.999 84.8457 261.537 83.3377 259.627 81.784"

let instanceCount = 0

const DEFAULTS = {
  baseFrequency: 0.1,
  scale: 3,
  numOctaves: 5,
  seed: 42,
  strokeWidth: 3,
}

/**
 * CircleDoodle — Animated circle line art with organic rough edges
 *
 * Same approach as LineArtReel: feTurbulence displacement filter,
 * stepped trim path at 48fps, cel jitter on seed/scale.
 */
export function CircleDoodle({
  isActive = false,
  strokeColor = '#CCC5F7',
  duration = 2,
}) {
  const idsRef = useRef(null)
  if (!idsRef.current) {
    const n = ++instanceCount
    idsRef.current = { filter: `cd-filter-${n}` }
  }
  const filterId = idsRef.current.filter
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)
  const [dashOffset, setDashOffset] = useState(null)

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
    <div className="circle-doodle">
      <svg
        viewBox="-10 -10 312 316"
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
            d={CIRCLE_PATH}
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

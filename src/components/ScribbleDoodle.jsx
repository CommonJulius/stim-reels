import React, { useState, useEffect, useRef } from 'react'

const SCRIBBLE_PATH = "M62.0947 248.182C60.5 250.5 50.8729 265.528 29.7612 302.066C8.97365 338.044 2.0703 365.295 4.33046 375.642C5.42382 380.647 15.6107 380.525 30.8301 372.073C46.0496 363.62 68.3453 345.656 92.7652 316.442C117.185 287.227 143.054 247.307 160.831 215.108C178.609 182.91 187.512 159.644 192.531 141.311C197.55 122.978 198.415 110.283 195.853 102.423C193.292 94.5634 187.279 91.9238 177.496 94.0955C167.714 96.2673 154.345 103.33 132.622 127.667C110.898 152.004 81.2261 193.4 58.3159 231.306C35.4057 269.213 20.1567 302.377 11.1146 326.219C2.07245 350.062 -0.300691 363.579 4.25779 368.973C8.81628 374.368 20.3783 371.231 54.9851 330.412C89.5918 289.593 146.893 211.189 179.821 161.184C212.749 111.179 219.567 91.9499 222.249 79.9334C224.93 67.9168 223.269 63.6956 218.789 65.2535C214.31 66.8114 207.063 74.2764 191.202 101.047C175.341 127.818 151.085 173.669 134.197 210.519C117.31 247.37 108.526 273.83 102.928 296.087C97.3312 318.344 95.1865 335.594 95.4189 346.964C95.6512 358.333 98.3256 363.299 105.566 363.691C112.807 364.084 124.532 359.754 142.133 342.198C159.734 324.642 182.856 293.991 212.878 245.395C242.901 196.8 279.124 131.189 298.556 95.1034C317.987 59.018 319.53 54.4467 311.081 62.4647C302.632 70.4828 284.145 91.2287 264.041 121.476C243.937 151.723 222.776 190.842 207.683 222.922C192.59 255.002 184.206 278.857 178.755 299.425C173.304 319.993 171.04 336.551 169.95 346.61C168.86 356.668 169.013 359.725 175.892 356.777C182.771 353.828 196.371 344.782 219.535 318.377C242.699 291.972 275.015 248.484 302.328 206.804C329.642 165.124 350.974 126.569 367.075 94.4191C383.176 62.2687 393.398 37.6905 399.095 22.4179C404.792 7.14526 405.654 1.92311 400.281 2.00085C394.907 2.07859 383.273 7.61447 363.039 28.4676C342.805 49.3208 314.324 85.3235 288.45 127.269C262.576 169.214 240.171 216.011 225.297 252.274C210.422 288.537 203.757 312.849 199.856 330.654C195.955 348.46 195.021 359.024 197.795 366.095C200.57 373.167 207.081 376.426 230.833 361.299C254.584 346.172 295.376 312.56 331.615 275.679C367.854 238.797 398.303 199.665 422.174 165.439C446.045 131.213 462.415 103.08 472.774 83.7102C483.133 64.3401 486.983 54.5855 488.329 48.1473C489.676 41.7091 488.401 38.8828 475.552 49.8832C462.704 60.8836 438.321 85.7963 415.381 117.336C392.442 148.875 371.686 186.285 356.189 220.43C340.692 254.576 331.082 284.322 325.661 304.46C320.239 324.599 319.297 334.229 326.228 332.447C333.159 330.665 347.993 317.18 367.505 291.473C387.018 265.766 410.76 228.246 434.426 183.306C458.093 138.366 480.965 87.1433 493.065 59.6743C505.164 32.2054 505.798 30.0429 497.216 43.8823C488.634 57.7216 470.817 87.6284 455.281 117.747C439.745 147.866 427.03 177.29 417.716 203.848C400.659 252.486 397.052 281.845 398.582 289.715C400.239 292.435 403.685 292.57 412.191 287.564C420.697 282.558 434.16 272.407 448.03 261.948"

let instanceCount = 0

const DEFAULTS = {
  baseFrequency: 0.1,
  scale: 3,
  numOctaves: 5,
  seed: 42,
  strokeWidth: 3,
}

/**
 * ScribbleDoodle — Animated scribble line art with organic rough edges
 *
 * Same approach as CircleDoodle/KnotDoodle: feTurbulence displacement filter,
 * stepped trim path at 48fps, cel jitter on seed/scale.
 */
export function ScribbleDoodle({
  isActive = false,
  color = '#CCC5F7',
  duration = 2.5,
  style = {},
}) {
  const idsRef = useRef(null)
  if (!idsRef.current) {
    const n = ++instanceCount
    idsRef.current = { filter: `sd-filter-${n}` }
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
        viewBox="0 0 505 381"
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
            d={SCRIBBLE_PATH}
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

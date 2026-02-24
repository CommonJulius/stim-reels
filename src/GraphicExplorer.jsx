import { useState, useMemo } from 'react'
import './GraphicExplorer.css'

/**
 * GraphicExplorer v3 — Focused on gradient blur/smear aesthetic
 *
 * Key qualities from inspo:
 * - Soft Gaussian blur on geometric primitives
 * - Grain/noise texture overlay
 * - Simple shapes: circles, columns, arcs, mountains
 * - Light bleeding through dark, or dark bleeding into light
 * - Analog, atmospheric, almost photographic quality
 * - Monochrome or very limited palette
 */

const COLOR_COMBOS = [
  { name: 'Mono Dark', bg: '#0a0a0a', fg: '#ffffff', mid: '#666666' },
  { name: 'Mono Light', bg: '#f0ede8', fg: '#0a0a0a', mid: '#888888' },
  { name: 'Stim Purple', bg: '#0f0a1a', fg: '#C4B8E8', mid: '#6B4C9A' },
  { name: 'Deep Navy', bg: '#080e1e', fg: '#8eb8f0', mid: '#2E5090' },
  { name: 'Forest', bg: '#0a1510', fg: '#a0d4b0', mid: '#2d6b4a' },
  { name: 'Warm Ember', bg: '#1a0f08', fg: '#f0b860', mid: '#8B5E3C' },
]

// Unique ID counter for SVG defs
let _uid = 0
function uid() { return `gfx-${++_uid}` }

// --- Direction 1: Concentric Ring Blur (Sonnet 064 style) ---
function ConcentricBlur({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.bg} />

        {/* Concentric arcs radiating from bottom-center */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => {
          const r = 80 + i * 55
          const opacity = 0.6 - i * 0.055
          return (
            <ellipse
              key={i}
              cx="195"
              cy="750"
              rx={r}
              ry={r * 0.45}
              fill="none"
              stroke={colors.fg}
              strokeWidth={28 - i * 2}
              opacity={Math.max(opacity, 0.08)}
              filter={`url(#${ids.blur})`}
              className="ring-blur"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          )
        })}

        {/* Bright center glow */}
        <ellipse cx="195" cy="680" rx="60" ry="25" fill={colors.fg} opacity="0.7" filter={`url(#${ids.blur})`} className="center-glow" />

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay position="top" />
    </div>
  )
}

// --- Direction 2: Gradient Columns (Sonnet 045 / vertical bars with blur bleed) ---
function GradientColumns({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])
  const columns = useMemo(() => {
    const cols = []
    const numCols = 14
    for (let i = 0; i < numCols; i++) {
      const x = (i / numCols) * 390
      const w = 390 / numCols
      // Varying height — taller in center
      const pos = i / numCols
      const envelope = Math.sin(pos * Math.PI) * 0.6 + 0.4
      const height = 500 * envelope
      const y = 422 - height * 0.6 // Offset up from center
      cols.push({ x, w, y, height, opacity: 0.5 + envelope * 0.3 })
    }
    return cols
  }, [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="6 20" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.fg} />

        {/* Dark columns bleeding downward */}
        {columns.map((col, i) => (
          <rect
            key={i}
            x={col.x}
            y={col.y}
            width={col.w}
            height={col.height}
            fill={colors.bg}
            opacity={col.opacity}
            filter={`url(#${ids.blur})`}
            className="grad-col"
            style={{ animationDelay: `${i * 0.06}s` }}
          />
        ))}

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.06" />
      </svg>
      <TextOverlay position="bottom" invertColor={colors.bg} />
    </div>
  )
}

// --- Direction 3: Mountain Silhouettes (Downtown Communication style) ---
function MountainSilhouettes({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])
  const mountains = useMemo(() => {
    const result = []
    const layers = 4
    for (let l = 0; l < layers; l++) {
      const baseY = 250 + l * 150
      let d = `M -20 ${baseY + 80}`
      // Generate mountain-like profile
      for (let x = -20; x <= 410; x += 5) {
        const y = baseY -
          Math.sin((x + l * 60) * 0.02) * 60 -
          Math.sin((x + l * 30) * 0.05) * 30 -
          Math.max(0, Math.sin((x + l * 40) * 0.015) * 80) +
          l * 10
        d += ` L ${x} ${y}`
      }
      d += ` L 410 844 L -20 844 Z`
      result.push({ d, opacity: 0.7 + l * 0.08 })
    }
    return result
  }, [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.fg} />

        {mountains.map((m, i) => (
          <path
            key={i}
            d={m.d}
            fill={colors.bg}
            opacity={m.opacity}
            filter={`url(#${ids.blur})`}
            className="mountain-layer"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay position="top" invertColor={colors.bg} />
    </div>
  )
}

// --- Direction 4: Diagonal Light Streaks (grainy diagonal bands) ---
function DiagonalStreaks({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.bg} />

        {/* Diagonal light bands */}
        {[0, 1, 2, 3].map(i => {
          const offset = i * 110 + 30
          return (
            <g key={i} className="streak" style={{ animationDelay: `${i * 0.15}s` }}>
              <line
                x1={-50 + offset}
                y1={-50}
                x2={-200 + offset}
                y2={900}
                stroke={colors.fg}
                strokeWidth={60 + i * 15}
                strokeLinecap="round"
                opacity={0.35 - i * 0.06}
                filter={`url(#${ids.blur})`}
              />
            </g>
          )
        })}

        {/* Subtle secondary streaks */}
        {[0, 1].map(i => (
          <line
            key={`s${i}`}
            x1={250 + i * 80}
            y1={-50}
            x2={100 + i * 80}
            y2={900}
            stroke={colors.fg}
            strokeWidth={25}
            opacity={0.12}
            filter={`url(#${ids.blur})`}
          />
        ))}

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.07" />
      </svg>
      <TextOverlay />
    </div>
  )
}

// --- Direction 5: Sphere Eclipse (Sonnet 059/001 — large circle with blur glow) ---
function SphereEclipse({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), blurLg: uid(), grain: uid() }), [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id={ids.blurLg}>
            <feGaussianBlur stdDeviation="30" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.bg} />

        {/* Background glow */}
        <circle cx="195" cy="380" r="200" fill={colors.fg} opacity="0.08" filter={`url(#${ids.blurLg})`} />

        {/* Main sphere */}
        <circle cx="195" cy="380" r="140" fill={colors.fg} opacity="0.85" filter={`url(#${ids.blur})`} className="sphere-main" />

        {/* Bright crescent edge */}
        <clipPath id={`${ids.blur}-clip`}>
          <circle cx="195" cy="380" r="140" />
        </clipPath>
        <circle cx="230" cy="380" r="140" fill={colors.bg} opacity="0.9" clipPath={`url(#${ids.blur}-clip)`} filter={`url(#${ids.blur})`} />

        {/* Horizon line glow */}
        <line x1="40" y1="520" x2="350" y2="520" stroke={colors.fg} strokeWidth="1.5" opacity="0.2" filter={`url(#${ids.blur})`} />

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay position="bottom" />
    </div>
  )
}

// --- Direction 6: Slit Bleed (vertical slits with organic form bleeding through) ---
function SlitBleed({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])
  const slits = useMemo(() => {
    const result = []
    const numSlits = 18
    for (let i = 0; i < numSlits; i++) {
      const x = 20 + (i / numSlits) * 350
      result.push(x)
    }
    return result
  }, [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="3 12" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          {/* Slit mask — only show through vertical slits */}
          <mask id={`${ids.blur}-mask`}>
            <rect width="390" height="844" fill="black" />
            {slits.map((x, i) => (
              <rect key={i} x={x} y="0" width="12" height="844" fill="white" />
            ))}
          </mask>
        </defs>
        <rect width="390" height="844" fill={colors.fg} />

        {/* Background visible through slits */}
        <rect width="390" height="844" fill={colors.bg} mask={`url(#${ids.blur}-mask)`} />

        {/* Organic blob bleeding through the slits */}
        <g mask={`url(#${ids.blur}-mask)`}>
          {/* Central blob shape */}
          <ellipse cx="200" cy="350" rx="160" ry="120" fill={colors.bg} filter={`url(#${ids.blur})`} className="bleed-blob blob-1" />
          <ellipse cx="170" cy="480" rx="140" ry="100" fill={colors.bg} filter={`url(#${ids.blur})`} className="bleed-blob blob-2" />
          {/* Drip shapes extending down */}
          {slits.slice(4, 14).map((x, i) => {
            const dripH = 150 + Math.sin(i * 1.2) * 100
            return (
              <rect
                key={i}
                x={x}
                y={350 + Math.sin(i * 0.8) * 30}
                width="12"
                height={dripH}
                fill={colors.bg}
                filter={`url(#${ids.blur})`}
                className="bleed-drip"
                style={{ animationDelay: `${i * 0.08}s` }}
              />
            )
          })}
        </g>

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay invertColor={colors.bg} />
    </div>
  )
}

// --- Direction 7: Staircase Gradient (Sonnet 007/045 — stepped blocks with blur) ---
function StaircaseGradient({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])
  const steps = useMemo(() => {
    const result = []
    const numSteps = 8
    for (let i = 0; i < numSteps; i++) {
      const x = (i / numSteps) * 300 + 30
      const w = 300 / numSteps
      const h = 200 + i * 50
      const y = 500 - h
      result.push({ x, y, w: w + 5, h, opacity: 0.15 + (i / numSteps) * 0.55 })
    }
    return result
  }, [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="4 14" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.bg} />

        {/* Stepped columns with gradient blur */}
        {steps.map((s, i) => (
          <rect
            key={i}
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h + 400}
            fill={colors.fg}
            opacity={s.opacity}
            filter={`url(#${ids.blur})`}
            className="stair-step"
            style={{ animationDelay: `${i * 0.08}s` }}
          />
        ))}

        {/* Subtle glow at the top of tallest step */}
        <ellipse cx="310" cy="100" rx="80" ry="50" fill={colors.fg} opacity="0.15" filter={`url(#${ids.blur})`} />

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.06" />
      </svg>
      <TextOverlay position="top" />
    </div>
  )
}

// --- Direction 8: Horizon Glow (Sonnet 153 — semicircle rising with horizontal blur) ---
function HorizonGlow({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), blurH: uid(), grain: uid() }), [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <filter id={ids.blurH}>
            <feGaussianBlur stdDeviation="30 4" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.bg} />

        {/* Horizon line glow layers */}
        {[0, 1, 2, 3].map(i => (
          <line
            key={i}
            x1="-20"
            y1={430 + i * 3}
            x2="410"
            y2={430 + i * 3}
            stroke={colors.fg}
            strokeWidth={40 - i * 8}
            opacity={0.12 + i * 0.04}
            filter={`url(#${ids.blurH})`}
            className="horizon-line"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}

        {/* Rising semicircle */}
        <circle cx="195" cy="435" r="120" fill={colors.fg} opacity="0.8" filter={`url(#${ids.blur})`} className="sun-circle" />
        {/* Cut off bottom half */}
        <rect x="-10" y="435" width="410" height="420" fill={colors.bg} opacity="0.95" />

        {/* Reflection streaks below */}
        {[0, 1, 2].map(i => (
          <line
            key={`r${i}`}
            x1={140 + i * 10}
            y1={450 + i * 20}
            x2={250 - i * 10}
            y2={450 + i * 20}
            stroke={colors.fg}
            strokeWidth={8 - i * 2}
            opacity={0.2 - i * 0.05}
            filter={`url(#${ids.blurH})`}
          />
        ))}

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay position="bottom" />
    </div>
  )
}

// --- Direction 9: Dot Matrix Blur (Sonnet 012 — grid of blurred dots) ---
function DotMatrixBlur({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])
  const dots = useMemo(() => {
    const result = []
    const cols = 5
    const rows = 6
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = 80 + c * 60
        const cy = 180 + r * 80
        // Varying size — larger toward bottom-right
        const radius = 16 + (r + c) * 2.5
        const opacity = 0.3 + (r / rows) * 0.5
        result.push({ cx, cy, r: radius, opacity })
      }
    }
    return result
  }, [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.fg} />

        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            fill={colors.bg}
            opacity={dot.opacity}
            filter={`url(#${ids.blur})`}
            className="matrix-dot"
            style={{ animationDelay: `${i * 0.04}s` }}
          />
        ))}

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay position="bottom" invertColor={colors.bg} />
    </div>
  )
}

// --- Direction 10: Ripple Grid (Sonnet 097 — repeating small patterns with blur) ---
function RippleGrid({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.bg} />

        {/* Grid of small concentric ripples */}
        {[0, 1, 2, 3].map(row =>
          [0, 1, 2, 3].map(col => {
            const cx = 60 + col * 90
            const cy = 180 + row * 130
            return (
              <g key={`${row}-${col}`} className="ripple-cell" style={{ animationDelay: `${(row * 4 + col) * 0.06}s` }}>
                {[0, 1, 2, 3, 4].map(ring => (
                  <circle
                    key={ring}
                    cx={cx}
                    cy={cy}
                    r={8 + ring * 10}
                    fill="none"
                    stroke={colors.fg}
                    strokeWidth={6 - ring}
                    opacity={0.4 - ring * 0.07}
                    filter={`url(#${ids.blur})`}
                  />
                ))}
              </g>
            )
          })
        )}

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay position="bottom" />
    </div>
  )
}

// --- Direction 11: Swirl Blur (Sonnet 094 — overlapping arcs creating spiral feel) ---
function SwirlBlur({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), grain: uid() }), [])
  const arcs = useMemo(() => {
    const result = []
    const numArcs = 6
    for (let i = 0; i < numArcs; i++) {
      const r = 80 + i * 40
      const startAngle = i * 30 - 60
      const endAngle = startAngle + 180 + i * 20
      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180
      const cx = 195
      const cy = 380

      const x1 = cx + Math.cos(startRad) * r
      const y1 = cy + Math.sin(startRad) * r
      const x2 = cx + Math.cos(endRad) * r
      const y2 = cy + Math.sin(endRad) * r
      const largeArc = endAngle - startAngle > 180 ? 1 : 0

      result.push({
        d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
        strokeWidth: 35 - i * 3,
        opacity: 0.5 - i * 0.06,
      })
    }
    return result
  }, [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.bg} />

        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.d}
            fill="none"
            stroke={colors.fg}
            strokeWidth={arc.strokeWidth}
            strokeLinecap="round"
            opacity={arc.opacity}
            filter={`url(#${ids.blur})`}
            className="swirl-arc"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay />
    </div>
  )
}

// --- Direction 12: Waveform Mountain (Rick Alverson poster — jagged peaks with glow edge) ---
function WaveformMountain({ colors }) {
  const ids = useMemo(() => ({ blur: uid(), blurEdge: uid(), grain: uid() }), [])
  const peaks = useMemo(() => {
    const result = []
    const numLayers = 3
    for (let l = 0; l < numLayers; l++) {
      const baseY = 350 + l * 80
      let d = `M -20 844`
      for (let x = -20; x <= 410; x += 3) {
        const sharp = Math.sin(x * 0.04 + l * 2) * 60
        const broad = Math.sin(x * 0.012 + l * 0.8) * 100
        const jagged = Math.sin(x * 0.1 + l * 5) * 15
        const y = baseY - Math.max(0, sharp + broad) - jagged * (sharp > 0 ? 1 : 0.2)
        d += ` L ${x} ${y}`
      }
      d += ` L 410 844 Z`
      result.push({ d })
    }
    return result
  }, [])

  return (
    <div className="graphic-frame">
      <svg viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id={ids.blur}>
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id={ids.blurEdge}>
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <filter id={ids.grain}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="390" height="844" fill={colors.fg} />

        {/* Glow edge behind each mountain */}
        {peaks.map((p, i) => (
          <path
            key={`glow-${i}`}
            d={p.d}
            fill={colors.bg}
            opacity="0.4"
            filter={`url(#${ids.blurEdge})`}
            className="mountain-glow"
          />
        ))}

        {/* Sharp mountain fill */}
        {peaks.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={colors.bg}
            opacity={0.85 + i * 0.05}
            filter={`url(#${ids.blur})`}
            className="mountain-sharp"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}

        {/* Grain */}
        <rect width="390" height="844" filter={`url(#${ids.grain})`} opacity="0.05" />
      </svg>
      <TextOverlay position="top" invertColor={colors.bg} />
    </div>
  )
}

// --- Shared Text Overlay ---
function TextOverlay({ position = 'default', invertColor = null }) {
  const posClass = position === 'top' ? 'top-area' : position === 'bottom' ? 'bottom' : ''
  return (
    <div className={`text-overlay ${posClass}`} style={invertColor ? { color: invertColor } : {}}>
      <h1>Årets musik i<br />publik miljö</h1>
      <p>Vad hördes mest på krogar, i frisersalonger och på gym runt om i landet?</p>
    </div>
  )
}

const DIRECTIONS = [
  { id: 1, name: 'Concentric Ring Blur', Component: ConcentricBlur },
  { id: 2, name: 'Gradient Columns', Component: GradientColumns },
  { id: 3, name: 'Mountain Silhouettes', Component: MountainSilhouettes },
  { id: 4, name: 'Diagonal Streaks', Component: DiagonalStreaks },
  { id: 5, name: 'Sphere Eclipse', Component: SphereEclipse },
  { id: 6, name: 'Slit Bleed', Component: SlitBleed },
  { id: 7, name: 'Staircase Gradient', Component: StaircaseGradient },
  { id: 8, name: 'Horizon Glow', Component: HorizonGlow },
  { id: 9, name: 'Dot Matrix Blur', Component: DotMatrixBlur },
  { id: 10, name: 'Ripple Grid', Component: RippleGrid },
  { id: 11, name: 'Swirl Blur', Component: SwirlBlur },
  { id: 12, name: 'Waveform Mountain', Component: WaveformMountain },
]

export default function GraphicExplorer() {
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedDirection, setSelectedDirection] = useState(null)
  const colors = COLOR_COMBOS[selectedColor]

  return (
    <div className="graphic-explorer">
      <div className="explorer-controls">
        <div className="controls-top">
          <h2 className="explorer-title">Graphic Directions</h2>
          {selectedDirection !== null && (
            <button className="back-btn" onClick={() => setSelectedDirection(null)}>← All</button>
          )}
        </div>
        <div className="color-selector">
          {COLOR_COMBOS.map((c, i) => (
            <button
              key={i}
              className={`color-chip ${i === selectedColor ? 'active' : ''}`}
              onClick={() => setSelectedColor(i)}
              title={c.name}
            >
              <span style={{ background: c.bg }} />
              <span style={{ background: c.fg }} />
            </button>
          ))}
          <span className="color-name">{colors.name}</span>
        </div>
      </div>

      {selectedDirection === null ? (
        <div className="directions-grid">
          {DIRECTIONS.map((dir) => (
            <div key={dir.id} className="direction-card" onClick={() => setSelectedDirection(dir.id)}>
              <div className="direction-preview">
                <dir.Component colors={colors} />
              </div>
              <div className="direction-meta">
                <span className="direction-id">{dir.id}</span>
                <span className="direction-name">{dir.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="direction-detail">
          {(() => {
            const dir = DIRECTIONS.find(d => d.id === selectedDirection)
            return (
              <>
                <div className="detail-header">
                  <h3>{dir.name}</h3>
                </div>
                <div className="detail-variants">
                  {COLOR_COMBOS.map((c, i) => (
                    <div key={i} className="variant-frame" onClick={() => setSelectedColor(i)}>
                      <dir.Component colors={c} />
                      <span className="variant-label">{c.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}

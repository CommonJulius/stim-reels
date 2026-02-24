import React, { useState, useEffect, useRef } from 'react'
import './TextPathBanner.css'

// Path reversed so text flows bottom→top visually
const TEXT_PATH_D = "M391.5 666.468C310.461 538.372 189.489 563.108 128.848 520.741C63.8406 475.324 76.5257 363.387 120.613 315.204C169.145 262.164 293.679 303.168 293.679 377.251C293.679 498.342 94.0577 534.369 16.6826 337.721C-39.2081 195.676 59.8402 37.4956 158.735 0.467773"

let instanceCount = 0

/**
 * TextPathBanner — Text following a curved SVG path, scrolling as a looping banner
 *
 * Uses SVG <textPath> with animated startOffset for smooth linear scrolling.
 * Text is repeated to fill the path, measured precisely for seamless looping.
 */
export function TextPathBanner({
  path = TEXT_PATH_D,
  items = [],
  separator = '  ',
  speed = 30,
  fontSize = 18,
  color = '#050038',
  fontFamily = "'GeneralSans-Medium', 'General Sans', sans-serif",
  isActive = false,
  backgroundColor = '#DEDBFB',
  viewBox = '0 0 392 667',
}) {
  const idsRef = useRef(null)
  if (!idsRef.current) {
    const n = ++instanceCount
    idsRef.current = { path: `tpb-path-${n}` }
  }
  const pathId = idsRef.current.path

  const pathRef = useRef(null)
  const measureRef = useRef(null)
  const offsetRef = useRef(0)
  const [offset, setOffset] = useState(0)
  const [pathLength, setPathLength] = useState(0)
  const [copyLength, setCopyLength] = useState(0)

  // Build one copy of the text string
  const oneTextCopy = items.join(separator) + separator
  const repeatedText = oneTextCopy + oneTextCopy + oneTextCopy + oneTextCopy + oneTextCopy

  // Measure path length on mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [path])

  // Measure one text copy length on the path
  useEffect(() => {
    if (measureRef.current && pathLength > 0) {
      setCopyLength(measureRef.current.getComputedTextLength())
    }
  }, [pathLength, items, separator, fontSize])

  // Animation loop — decrement offset for scrolling along the path
  useEffect(() => {
    if (!isActive || copyLength <= 0) return

    let rafId
    let lastTime = 0
    offsetRef.current = 0

    const tick = (time) => {
      rafId = requestAnimationFrame(tick)
      if (!lastTime) {
        lastTime = time
        return
      }
      const dt = (time - lastTime) / 1000
      lastTime = time

      offsetRef.current -= speed * dt

      // Wrap at one copy length for seamless loop
      if (offsetRef.current <= -copyLength) {
        offsetRef.current += copyLength
      }

      setOffset(offsetRef.current)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isActive, copyLength, speed])

  return (
    <div className="text-path-banner" style={{ backgroundColor }}>
      <svg
        className="text-path-banner-svg"
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <path id={pathId} d={path} fill="none" ref={pathRef} />
        </defs>

        {/* Hidden single-copy text for measuring one repeat length */}
        <text style={{ visibility: 'hidden' }}>
          <textPath href={`#${pathId}`} ref={measureRef}>
            {oneTextCopy}
          </textPath>
        </text>

        {/* Visible scrolling text */}
        <text
          fill={color}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight={500}
        >
          <textPath
            href={`#${pathId}`}
            startOffset={offset}
          >
            {repeatedText}
          </textPath>
        </text>
      </svg>
    </div>
  )
}

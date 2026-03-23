import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useIntersectionObserver } from '../hooks/useIntersectionObserver'
import './ReelItem.css'

/**
 * ReelItem - Individual reel supporting video, Lottie, or custom content
 *
 * Props:
 * - type: 'video' | 'lottie' | 'dotlottie' | 'custom'
 * - src: video URL, Lottie JSON URL, or dotLottie URL
 * - poster: optional poster image for video
 * - overlay: optional overlay content (render function or JSX)
 * - loop: whether to loop (default: true)
 * - muted: for videos (default: true for autoplay)
 * - backgroundColor: background color for the reel
 * - graphicsColor: optional hex color to recolor Lottie graphics
 */

/**
 * Convert hex color string to normalized RGB (0–1) values.
 */
function hexToRgbNorm(hex) {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16) / 255
  const g = parseInt(h.substring(2, 4), 16) / 255
  const b = parseInt(h.substring(4, 6), 16) / 255
  return { r, g, b }
}

/**
 * Recolor a Lottie JSON object by replacing fill/stroke colors.
 * Replaces the dark navy (#040037 ≈ [0.016, 0, 0.216]) with targetHex.
 */
function recolorLottie(jsonData, targetHex) {
  if (!targetHex) return jsonData
  const { r, g, b } = hexToRgbNorm(targetHex)
  const str = JSON.stringify(jsonData)
  // Match the navy color #040037 = [0.0196, 0, 0.2196]
  const recolored = str.replace(
    /0\.0196,\s*0,\s*0\.2196/g,
    `${r}, ${g}, ${b}`
  )
  return JSON.parse(recolored)
}

export function ReelItem({
  type = 'video', // 'video' | 'lottie' | 'dotlottie' | 'custom'
  src,
  poster,
  overlay,
  loop = true,
  muted = true,
  backgroundColor = '#000',
  graphicsColor, // optional: recolor Lottie graphics to this hex color
  isActive,
  index,
  children,
}) {
  const videoRef = useRef(null)
  const lottieRef = useRef(null)
  const dotLottieRef = useRef(null)
  const { ref: containerRef, isVisible } = useIntersectionObserver({
    threshold: 0.6,
  })

  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [lottieLoaded, setLottieLoaded] = useState(false)
  const [dotLottieLoaded, setDotLottieLoaded] = useState(false)
  const [lottieData, setLottieData] = useState(null) // recolored JSON data
  const [restartKey, setRestartKey] = useState(0)
  const isVisibleRef = useRef(isVisible)

  // Fetch and recolor Lottie JSON when graphicsColor is set
  useEffect(() => {
    if (type !== 'lottie' || !graphicsColor || !src) return

    fetch(src)
      .then(res => res.json())
      .then(data => {
        const recolored = recolorLottie(data, graphicsColor)
        setLottieData(recolored)
      })
      .catch(err => console.error('Failed to fetch/recolor Lottie:', err))
  }, [type, src, graphicsColor])

  // dotLottie ref callback
  const dotLottieRefCallback = useCallback((dotLottie) => {
    dotLottieRef.current = dotLottie
    if (dotLottie) {
      dotLottie.addEventListener('load', () => {
        setDotLottieLoaded(true)
        if (isVisibleRef.current) {
          dotLottie.play()
          setIsPlaying(true)
        }
      })
    }
  }, [])

  // Keep ref in sync with state
  useEffect(() => {
    isVisibleRef.current = isVisible
  }, [isVisible])

  // Auto-play/pause based on visibility
  useEffect(() => {
    if (type === 'video' && videoRef.current) {
      if (isVisible) {
        videoRef.current.play().catch(() => {
          // Autoplay was prevented, keep muted
          videoRef.current.muted = true
          videoRef.current.play()
        })
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
        setIsPlaying(false)
      }
    }

    // Handle Lottie JSON - only if already loaded
    if (type === 'lottie' && lottieRef.current && lottieLoaded) {
      if (isVisible) {
        lottieRef.current.play()
        setIsPlaying(true)
      } else {
        lottieRef.current.pause()
        lottieRef.current.setSeeker(0)
        setIsPlaying(false)
      }
    }

    // Handle dotLottie
    if (type === 'dotlottie' && dotLottieRef.current && dotLottieLoaded) {
      if (isVisible) {
        dotLottieRef.current.play()
        setIsPlaying(true)
      } else {
        dotLottieRef.current.stop()
        setIsPlaying(false)
      }
    }
  }, [isVisible, type, lottieLoaded, dotLottieLoaded])

  const toggleMute = () => {
    if (type === 'video' && videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const togglePlay = () => {
    if (type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }

    if (type === 'lottie' && lottieRef.current) {
      if (isPlaying) {
        lottieRef.current.pause()
      } else {
        lottieRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }

    if (type === 'dotlottie' && dotLottieRef.current) {
      if (isPlaying) {
        dotLottieRef.current.pause()
      } else {
        dotLottieRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleRestart = (e) => {
    e.stopPropagation()
    // Reset background Lottie/video
    if (type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
    if (type === 'lottie' && lottieRef.current) {
      lottieRef.current.stop()
      lottieRef.current.play()
    }
    if (type === 'dotlottie' && dotLottieRef.current) {
      dotLottieRef.current.stop()
      dotLottieRef.current.play()
    }
    // Bump key to remount overlay (resets all overlay animations)
    setRestartKey(k => k + 1)
  }

  // For lottie type: use recolored data if available, otherwise src URL
  const lottieSrc = (graphicsColor && lottieData) ? lottieData : src

  return (
    <div
      ref={containerRef}
      className="reel-item"
      onClick={togglePlay}
    >
      {/* Inner content wrapper with aspect ratio */}
      <div className="reel-content" style={{ backgroundColor }}>
        {type === 'video' && (
          <>
            <video
              ref={videoRef}
              className="reel-media reel-video"
              src={src}
              poster={poster}
              loop={loop}
              muted={isMuted}
              playsInline
              preload="auto"
            />
            <button
              className="mute-button"
              onClick={(e) => {
                e.stopPropagation()
                toggleMute()
              }}
            >
              {isMuted ? (
                <MutedIcon />
              ) : (
                <UnmutedIcon />
              )}
            </button>
          </>
        )}

        {/* Lottie animation — renders to SVG (transparent bg by default) */}
        {type === 'lottie' && (
          <Player
            ref={lottieRef}
            src={lottieSrc}
            className="reel-media reel-lottie"
            loop={loop}
            autoplay={false}
            keepLastFrame={!loop}
            background="transparent"
            onEvent={(event) => {
              if (event === 'load') {
                setLottieLoaded(true)
                if (isVisibleRef.current && lottieRef.current) {
                  lottieRef.current.play()
                  setIsPlaying(true)
                }
              }
            }}
          />
        )}

        {/* dotLottie animation (.lottie format) */}
        {type === 'dotlottie' && (
          <DotLottieReact
            src={src}
            className="reel-media reel-lottie"
            loop={loop}
            autoplay={false}
            dotLottieRefCallback={dotLottieRefCallback}
          />
        )}

        {/* Custom content (for infographics, etc.) - children get isActive prop */}
        {type === 'custom' && children && (
          <div className="reel-custom-content">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { isActive: isVisible })
              }
              return child
            })}
          </div>
        )}

        {/* Play/Pause indicator - only for video/lottie types */}
        {!isPlaying && type !== 'custom' && type !== 'dotlottie' && (
          <div className="play-indicator">
            <PlayIcon />
          </div>
        )}

        {/* Overlay content (title, animated text, etc.) */}
        {overlay && (
          <div className="reel-overlay" key={restartKey}>
            {typeof overlay === 'function'
              ? overlay({ isActive: isVisible })
              : React.Children.map(overlay.props ? [overlay] : [], child =>
                  React.isValidElement(child)
                    ? React.cloneElement(child, { isActive: isVisible })
                    : child
                ) || overlay}
          </div>
        )}

        {/* Restart button */}
        <button
          className="reel-restart-btn"
          onClick={handleRestart}
          aria-label="Restart reel"
        >
          <RestartIcon />
        </button>

        {/* Custom children content */}
        {children}
      </div>
    </div>
  )
}

// Icon components
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="64" height="64">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}

function UnmutedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}

function RestartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  )
}

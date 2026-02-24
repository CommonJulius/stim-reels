import React, { useRef, useState, useCallback } from 'react'
import './ReelsContainer.css'

/**
 * ReelsContainer - Instagram/TikTok style vertical scroll container
 *
 * Features:
 * - Full-screen snap scrolling
 * - Tracks active reel index
 * - Provides context for child reels
 */
export function ReelsContainer({ children, onReelChange }) {
  const containerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const reelHeight = container.clientHeight
    const newIndex = Math.round(scrollTop / reelHeight)

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex)
      onReelChange?.(newIndex)
    }
  }, [activeIndex, onReelChange])

  // Clone children and pass isActive prop based on index
  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isActive: index === activeIndex,
        index,
      })
    }
    return child
  })

  return (
    <div
      ref={containerRef}
      className="reels-container"
      onScroll={handleScroll}
    >
      {childrenWithProps}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook to observe when an element enters/exits the viewport
 * Used for auto-playing videos and Lottie animations when visible
 */
export function useIntersectionObserver(options = {}) {
  // Start with true to handle first reel on page load
  const [isVisible, setIsVisible] = useState(true)
  const [entry, setEntry] = useState(null)
  const ref = useRef(null)

  const defaultOptions = {
    threshold: 0.5, // Trigger when 50% of element is visible
    rootMargin: '0px',
    ...options,
  }

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        setEntry(entry)
      },
      defaultOptions
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [defaultOptions.threshold, defaultOptions.rootMargin])

  return { ref, isVisible, entry }
}

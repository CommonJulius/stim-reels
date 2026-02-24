import { useState } from 'react'
import { ReelsContainer, ReelItem } from './components'
import { StimInfographicCard, generateCardData, CURRENT_DATA } from './components/infographic'
import './App.css'

/**
 * Stim Infographic Demo
 *
 * Mobile-first, swipeable infographic cards for Stim's annual report.
 * Each card presents a single data point with animations.
 *
 * Features:
 * - Vertical snap scrolling (Instagram/TikTok style)
 * - Animated numbers that count up when visible
 * - SVG decorations and visualizations
 * - Bilingual support (Swedish/English)
 * - Easy data updates via stimData.js
 */

function StimInfographicDemo() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [language, setLanguage] = useState('sv') // 'sv' or 'en'

  const cards = generateCardData(CURRENT_DATA)

  const handleReelChange = (index) => {
    setCurrentIndex(index)
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'sv' ? 'en' : 'sv'))
  }

  return (
    <div className="app stim-infographic-app">
      {/* Language toggle */}
      <button
        className="language-toggle"
        onClick={toggleLanguage}
        aria-label={`Switch to ${language === 'sv' ? 'English' : 'Swedish'}`}
      >
        {language === 'sv' ? 'EN' : 'SV'}
      </button>

      <ReelsContainer onReelChange={handleReelChange}>
        {cards.map((card, index) => (
          <ReelItem
            key={card.id}
            type="custom"
            backgroundColor="transparent"
          >
            <StimInfographicCard
              type={card.type}
              data={card.data}
              lang={language}
              isActive={index === currentIndex}
            />
          </ReelItem>
        ))}
      </ReelsContainer>

      {/* Progress indicators */}
      <div className="reel-indicators stim-indicators">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`indicator ${i === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Scroll hint on first card */}
      {currentIndex === 0 && (
        <div className="scroll-hint">
          <svg viewBox="0 0 24 24" className="scroll-icon">
            <path
              d="M12 5v14M5 12l7 7 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{language === 'sv' ? 'Svep för att se mer' : 'Swipe to see more'}</span>
        </div>
      )}
    </div>
  )
}

export default StimInfographicDemo

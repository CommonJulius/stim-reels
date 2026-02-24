import React, { useEffect, useRef, useState } from 'react'
import './StimInfographicCard.css'

/**
 * StimInfographicCard - Animated infographic card for Stim annual report
 *
 * Props:
 * - type: 'hero' | 'revenue' | 'payout' | 'streaming' | 'growth' | 'global' | 'cta'
 * - data: object with card-specific data
 * - isActive: whether card is currently visible (for animations)
 * - lang: 'sv' | 'en' (default: 'sv')
 */
export function StimInfographicCard({
  type = 'hero',
  data = {},
  isActive = false,
  lang = 'sv',
  backgroundColor
}) {
  const cardRef = useRef(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isActive && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isActive, hasAnimated])

  const shouldAnimate = isActive || hasAnimated

  const renderCard = () => {
    switch (type) {
      case 'hero':
        return <HeroCard data={data} animate={shouldAnimate} lang={lang} />
      case 'revenue':
        return <RevenueCard data={data} animate={shouldAnimate} lang={lang} />
      case 'payout':
        return <PayoutCard data={data} animate={shouldAnimate} lang={lang} />
      case 'streaming':
        return <StreamingCard data={data} animate={shouldAnimate} lang={lang} />
      case 'growth':
        return <GrowthCard data={data} animate={shouldAnimate} lang={lang} />
      case 'global':
        return <GlobalCard data={data} animate={shouldAnimate} lang={lang} />
      case 'cta':
        return <CtaCard data={data} animate={shouldAnimate} lang={lang} />
      default:
        return <HeroCard data={data} animate={shouldAnimate} lang={lang} />
    }
  }

  return (
    <div
      ref={cardRef}
      className={`stim-infographic-card ${type} ${shouldAnimate ? 'animate' : ''}`}
      style={{ backgroundColor: backgroundColor || 'var(--stim-bg-dark)' }}
    >
      {renderCard()}
    </div>
  )
}

// Animated counter hook
function useCountUp(end, duration = 2000, shouldAnimate = false) {
  const [count, setCount] = useState(0)
  const countRef = useRef(null)

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(0)
      return
    }

    let startTime = null
    const startValue = 0

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut)

      setCount(currentValue)

      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate)
      }
    }

    countRef.current = requestAnimationFrame(animate)

    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current)
      }
    }
  }, [end, duration, shouldAnimate])

  return count
}

// Format number with spaces (Swedish style)
function formatNumber(num, lang = 'sv') {
  if (lang === 'sv') {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }
  return num.toLocaleString('en-US')
}

// Hero Card - Total Membership
function HeroCard({ data, animate, lang }) {
  const count = useCountUp(data.members || 105000, 2500, animate)

  const text = {
    sv: {
      members: 'MEDLEMMAR',
      subtitle: 'musikskapare och förlag',
      fact: 'Näst flest medlemmar per capita i världen'
    },
    en: {
      members: 'MEMBERS',
      subtitle: 'music creators and publishers',
      fact: 'Second highest membership per capita globally'
    }
  }

  return (
    <div className="card-content hero-content">
      <div className="stim-logo">
        <svg viewBox="0 0 120 40" className="logo-svg">
          <text x="10" y="30" className="logo-text">STIM</text>
        </svg>
      </div>

      <div className={`big-number ${animate ? 'fade-in' : ''}`}>
        {formatNumber(count, lang)}+
      </div>

      <div className={`label ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].members}
      </div>

      <div className={`subtitle ${animate ? 'fade-in delay-2' : ''}`}>
        {text[lang].subtitle}
      </div>

      {/* Soundwave decoration */}
      <div className="soundwave-decoration">
        <svg viewBox="0 0 200 60" className="soundwave-svg">
          {[...Array(20)].map((_, i) => (
            <rect
              key={i}
              x={i * 10 + 2}
              y={30 - (Math.sin(i * 0.5) * 20 + 10)}
              width="6"
              height={(Math.sin(i * 0.5) * 20 + 10) * 2}
              rx="3"
              className={`wave-bar ${animate ? 'wave-animate' : ''}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </svg>
      </div>

      <div className={`fact-badge ${animate ? 'slide-up' : ''}`}>
        {text[lang].fact}
      </div>
    </div>
  )
}

// Revenue Card
function RevenueCard({ data, animate, lang }) {
  const revenueCount = useCountUp(data.revenue || 3.1, 2000, animate)
  const increaseCount = useCountUp(data.increase || 400, 1500, animate)

  const text = {
    sv: {
      revenue: 'INTÄKTER',
      billion: 'miljarder kr',
      increase: 'ökning',
      million: 'mkr',
      compared: 'jämfört med föregående år',
      year: '2023'
    },
    en: {
      revenue: 'REVENUE',
      billion: 'billion SEK',
      increase: 'increase',
      million: 'MSEK',
      compared: 'compared to previous year',
      year: '2023'
    }
  }

  return (
    <div className="card-content revenue-content">
      <div className={`year-badge ${animate ? 'fade-in' : ''}`}>
        {text[lang].year}
      </div>

      <div className={`big-number ${animate ? 'scale-in' : ''}`}>
        {revenueCount.toFixed(1)}
      </div>

      <div className={`unit ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].billion}
      </div>

      <div className={`label ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].revenue}
      </div>

      {/* Trend arrow */}
      <div className={`trend-indicator positive ${animate ? 'slide-up' : ''}`}>
        <svg viewBox="0 0 24 24" className="trend-arrow">
          <path d="M7 14l5-5 5 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="trend-value">+{increaseCount} {text[lang].million}</span>
      </div>

      <div className={`subtitle ${animate ? 'fade-in delay-2' : ''}`}>
        {text[lang].compared}
      </div>

      {/* Background chart decoration */}
      <div className="chart-decoration">
        <svg viewBox="0 0 200 100" className="chart-svg">
          <path
            d="M0,80 Q40,70 80,50 T160,30 T200,20"
            fill="none"
            stroke="var(--stim-green)"
            strokeWidth="3"
            className={`chart-line ${animate ? 'draw-line' : ''}`}
          />
          <circle cx="200" cy="20" r="6" fill="var(--stim-green)" className={animate ? 'pulse' : ''} />
        </svg>
      </div>
    </div>
  )
}

// Payout Card
function PayoutCard({ data, animate, lang }) {
  const payoutCount = useCountUp(data.payout || 2.6, 2000, animate)

  const text = {
    sv: {
      payout: 'UTBETALAT',
      billion: 'miljarder kr',
      to: 'till kompositörer, textförfattare & musikförlag',
      year: '2023'
    },
    en: {
      payout: 'PAID OUT',
      billion: 'billion SEK',
      to: 'to composers, songwriters & publishers',
      year: '2023'
    }
  }

  return (
    <div className="card-content payout-content">
      <div className={`year-badge ${animate ? 'fade-in' : ''}`}>
        {text[lang].year}
      </div>

      {/* Money flow illustration */}
      <div className={`money-flow ${animate ? 'animate-flow' : ''}`}>
        <svg viewBox="0 0 100 100" className="money-svg">
          <circle cx="50" cy="30" r="20" className="note-circle" />
          <text x="50" y="35" className="note-symbol">♪</text>
          <path d="M50,55 L50,70 M40,65 L50,70 L60,65" className="arrow-down" />
          <circle cx="50" cy="85" r="12" className="person-head" />
          <path d="M35,100 Q50,90 65,100" className="person-body" />
        </svg>
      </div>

      <div className={`big-number green ${animate ? 'scale-in' : ''}`}>
        {payoutCount.toFixed(1)}
      </div>

      <div className={`unit ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].billion}
      </div>

      <div className={`label ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].payout}
      </div>

      <div className={`subtitle ${animate ? 'fade-in delay-2' : ''}`}>
        {text[lang].to}
      </div>
    </div>
  )
}

// Streaming Card
function StreamingCard({ data, animate, lang }) {
  const streamingCount = useCountUp(data.streaming || 1.09, 2000, animate)
  const growthCount = useCountUp(data.growth || 27, 1500, animate)

  const text = {
    sv: {
      streaming: 'FRÅN STREAMING',
      billion: 'miljarder kr',
      growth: 'tillväxt på ett år',
      subtitle: 'från globala streamingtjänster'
    },
    en: {
      streaming: 'FROM STREAMING',
      billion: 'billion SEK',
      growth: 'year-over-year growth',
      subtitle: 'from global streaming services'
    }
  }

  return (
    <div className="card-content streaming-content">
      {/* Streaming wave animation */}
      <div className={`streaming-waves ${animate ? 'animate-waves' : ''}`}>
        <svg viewBox="0 0 200 80" className="waves-svg">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M0,${40 + i * 10} Q50,${30 + i * 10} 100,${40 + i * 10} T200,${40 + i * 10}`}
              fill="none"
              stroke="var(--stim-purple-light)"
              strokeWidth="2"
              opacity={1 - i * 0.3}
              className={`wave-path wave-${i}`}
            />
          ))}
        </svg>
      </div>

      <div className={`big-number ${animate ? 'scale-in' : ''}`}>
        {streamingCount.toFixed(2)}
      </div>

      <div className={`unit ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].billion}
      </div>

      <div className={`label ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].streaming}
      </div>

      <div className={`growth-badge ${animate ? 'pop-in' : ''}`}>
        +{growthCount}%
      </div>

      <div className={`subtitle ${animate ? 'fade-in delay-2' : ''}`}>
        {text[lang].growth}
      </div>
    </div>
  )
}

// Growth Comparison Card
function GrowthCard({ data, animate, lang }) {
  const payoutGrowth = useCountUp(data.payoutGrowth || 62, 2000, animate)
  const memberGrowth = useCountUp(data.memberGrowth || 16, 1500, animate)

  const text = {
    sv: {
      title: 'TILLVÄXT 2018 → 2023',
      payouts: 'Utbetalningar',
      members: 'Medlemmar',
      billion: 'mdr'
    },
    en: {
      title: 'GROWTH 2018 → 2023',
      payouts: 'Payouts',
      members: 'Members',
      billion: 'bn'
    }
  }

  return (
    <div className="card-content growth-content">
      <div className={`section-title ${animate ? 'fade-in' : ''}`}>
        {text[lang].title}
      </div>

      {/* Payout bar */}
      <div className={`growth-bar-container ${animate ? 'fade-in delay-1' : ''}`}>
        <div className="bar-label">{text[lang].payouts}</div>
        <div className="bar-wrapper">
          <div
            className={`bar-fill purple ${animate ? 'grow-bar' : ''}`}
            style={{ '--target-width': `${Math.min(payoutGrowth + 20, 100)}%` }}
          />
          <span className="bar-value">+{payoutGrowth}%</span>
        </div>
        <div className="bar-detail">1.6 → 2.6 {text[lang].billion}</div>
      </div>

      {/* Members bar */}
      <div className={`growth-bar-container ${animate ? 'fade-in delay-2' : ''}`}>
        <div className="bar-label">{text[lang].members}</div>
        <div className="bar-wrapper">
          <div
            className={`bar-fill green ${animate ? 'grow-bar' : ''}`}
            style={{ '--target-width': `${Math.min(memberGrowth + 20, 50)}%` }}
          />
          <span className="bar-value">+{memberGrowth}%</span>
        </div>
        <div className="bar-detail">90 000 → 105 000</div>
      </div>
    </div>
  )
}

// Global Position Card
function GlobalCard({ data, animate, lang }) {
  const text = {
    sv: {
      title: '1 av 4',
      subtitle: 'nettoexportörer av musik',
      description: 'Sverige är ett av endast fyra länder som exporterar mer musik än vi importerar'
    },
    en: {
      title: '1 of 4',
      subtitle: 'net music exporters',
      description: 'Sweden is one of only four countries that exports more music than it imports'
    }
  }

  const countries = [
    { code: 'US', name: 'USA', flag: '🇺🇸' },
    { code: 'GB', name: 'UK', flag: '🇬🇧' },
    { code: 'KR', name: 'Korea', flag: '🇰🇷' },
    { code: 'SE', name: 'Sverige', flag: '🇸🇪', highlight: true }
  ]

  return (
    <div className="card-content global-content">
      <div className={`big-number ${animate ? 'scale-in' : ''}`}>
        {text[lang].title}
      </div>

      <div className={`label ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].subtitle}
      </div>

      {/* Country flags */}
      <div className={`country-grid ${animate ? 'stagger-in' : ''}`}>
        {countries.map((country, i) => (
          <div
            key={country.code}
            className={`country-item ${country.highlight ? 'highlight' : ''}`}
            style={{ animationDelay: `${0.3 + i * 0.1}s` }}
          >
            <span className="flag">{country.flag}</span>
            <span className="country-name">{country.name}</span>
          </div>
        ))}
      </div>

      <div className={`subtitle ${animate ? 'fade-in delay-3' : ''}`}>
        {text[lang].description}
      </div>
    </div>
  )
}

// CTA Card
function CtaCard({ data, animate, lang }) {
  const text = {
    sv: {
      title: 'Vill du veta mer?',
      subtitle: 'Läs hela årsredovisningen',
      link: 'stim.se/arsredovisning'
    },
    en: {
      title: 'Want to learn more?',
      subtitle: 'Read the full annual report',
      link: 'stim.se/annual-report'
    }
  }

  return (
    <div className="card-content cta-content">
      <div className="stim-logo large">
        <svg viewBox="0 0 120 40" className={`logo-svg ${animate ? 'fade-in' : ''}`}>
          <text x="10" y="30" className="logo-text">STIM</text>
        </svg>
      </div>

      <div className={`cta-title ${animate ? 'fade-in delay-1' : ''}`}>
        {text[lang].title}
      </div>

      <div className={`cta-subtitle ${animate ? 'fade-in delay-2' : ''}`}>
        {text[lang].subtitle}
      </div>

      <a
        href={`https://www.${text[lang].link}`}
        className={`cta-button ${animate ? 'pop-in' : ''}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {text[lang].link}
        <svg viewBox="0 0 24 24" className="arrow-icon">
          <path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </a>

      <div className={`footer-text ${animate ? 'fade-in delay-3' : ''}`}>
        For the love of music
      </div>
    </div>
  )
}

export default StimInfographicCard

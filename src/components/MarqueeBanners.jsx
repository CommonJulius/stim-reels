import React from 'react'
import './MarqueeBanners.css'

const banners = [
  'Jazzahead • Katarina Cup • You+MUSIC • Din Musikbusiness • Make Music Matter • Classical Next • ',
  'Fryshuset Musik • Jämlikhetslistan • Vem Kan Bli Producent • Subkult Festival • Live at Heart • ',
  'Denniz Pop Awards • Svensk Musik • FST • Skap • Musikförläggarna • Nordic Music Journeys • ',
  'Swedish Sounds • Sthlm Sessions • Stim popup studio The Node • Stim popup studio Ljudgården • ',
  'Stim popup studio Sensus Göteborg • Stim popup studio Sensus Sundsvall • Konstmusiksystrar • Rhuba Camp • ',
  'Livemusiklyftet • Radiovågen • Projektstöd: Musikdrömmen • Projektstöd: Förlagskraft • Stimstipendiet • ',
]

/**
 * MarqueeBanners — 6 horizontal text banners with infinite scroll,
 * alternating direction (odd = RTL, even = LTR)
 */
export function MarqueeBanners({
  isActive = false,
  color = '#050038',
}) {
  return (
    <div className="marquee-banners">
      {banners.map((text, i) => {
        // All move RTL, varied speeds for organic feel
        const durations = [40, 48, 44, 52, 46, 50]
        const duration = durations[i]
        return (
          <div
            className="marquee-banner marquee-banner--rtl"
            key={i}
            style={{ color }}
          >
            <div
              className="marquee-banner__track"
              style={{
                animationDuration: `${duration}s`,
                animationPlayState: isActive ? 'running' : 'paused',
              }}
            >
              <span className="marquee-banner__text">{text}</span>
              <span className="marquee-banner__text">{text}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

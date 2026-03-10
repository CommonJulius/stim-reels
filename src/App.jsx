import { useState, useEffect, useRef, useCallback } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { ReelsContainer, ReelItem, AnimatedText, TypewriterText, ImageFlowReel, LineArtReel, TextPathBanner, KnotDoodle, IntroOverlay, MarqueeBanners } from './components'
import './App.css'

/**
 * Color schemes for reels
 * bg: background color (used in Lottie bg + fallback)
 * text: heading text color
 * body: body/paragraph text color
 * graphics: color for Lottie decorative graphics
 */
const COLOR_SCHEMES = {
  'purple-mix-1': {
    bg: '#DEDBFB',
    text: '#050038',
    body: '#050038',
    graphics: '#050038',
  },
  'purple-mix-1-inverted': {
    bg: '#050038',
    text: '#DEDBFB',
    body: '#DEDBFB',
    graphics: '#DEDBFB',
  },
  'purple-bright': {
    bg: '#DEDBFB',
    text: '#1D0834',
    body: '#1D0834',
    graphics: '#CCC5F7',
  },
}

/**
 * LottieLayer — plays a Lottie JSON via Player, controlled by isActive
 */
function LottieLayer({ src, isActive, loop = false, speed = 1, style }) {
  const ref = useRef(null)
  const loadedRef = useRef(false)
  const isActiveRef = useRef(isActive)

  isActiveRef.current = isActive

  useEffect(() => {
    if (!ref.current || !loadedRef.current) return
    if (isActive) {
      ref.current.play()
    } else {
      ref.current.stop()
    }
  }, [isActive])

  return (
    <Player
      ref={ref}
      src={src}
      loop={loop}
      autoplay={false}
      keepLastFrame={!loop}
      speed={speed}
      background="transparent"
      renderer="svg"
      style={style || { position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      onEvent={(event) => {
        if (event === 'load') {
          loadedRef.current = true
          if (isActiveRef.current && ref.current) ref.current.play()
        }
      }}
    />
  )
}

/**
 * DotLottieLayer — plays a .lottie file via DotLottieReact, controlled by isActive
 */
function DotLottieLayer({ src, isActive, loop = false, style }) {
  const dotLottieRef = useRef(null)
  const isActiveRef = useRef(isActive)

  isActiveRef.current = isActive

  const dotLottieRefCallback = useCallback((dotLottie) => {
    dotLottieRef.current = dotLottie
    if (dotLottie) {
      dotLottie.addEventListener('load', () => {
        if (isActiveRef.current) {
          dotLottie.play()
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!dotLottieRef.current) return
    if (isActive) {
      dotLottieRef.current.play()
    } else {
      dotLottieRef.current.stop()
    }
  }, [isActive])

  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={false}
      dotLottieRefCallback={dotLottieRefCallback}
      style={style || { position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleReelChange = (index) => {
    setCurrentIndex(index)
  }

  const scheme1 = COLOR_SCHEMES['purple-bright']
  const scheme2 = COLOR_SCHEMES['purple-mix-1-inverted']

  return (
    <div className="app">
      <ReelsContainer onReelChange={handleReelChange}>
        {/* Reel 0: Intro — Lottie bg + swipe hint overlay */}
        <ReelItem
          type="lottie"
          src="/intro-bg.json"
          backgroundColor="#DEDBFB"
          loop={false}
          overlay={({ isActive }) => (
            <IntroOverlay isActive={isActive} />
          )}
        />

        {/* Reel 1: Purple Bright — Lottie bg + text overlay */}
        <ReelItem
          type="lottie"
          src="/fishbones-bg.json"
          backgroundColor={scheme1.bg}
          graphicsColor={scheme1.graphics}
          loop={false}
          overlay={({ isActive }) => (
            <TypewriterText
              text="För *100 år* sedan tog Stims medlemmar beslutet att värna *musikalisk mångfald* och *upphovsrätt.*"
              isActive={isActive}
              color={scheme1.text}
              className="typewriter-text--lg"
              delay={500}
            />
          )}
        />

        {/* Reel 2: Image flow — dark navy */}
        <ReelItem
          type="custom"
          backgroundColor={scheme2.bg}
          overlay={({ isActive }) => (
            <ImageFlowReel
              isActive={isActive}
              backgroundColor={scheme2.bg}
              textColor={scheme2.text}
              bodyColor={scheme2.body}
              heading=""
              body="Idag genomför vi ett stort antal initiativ för att *stärka svenskt musikskapande.*"
              images={[
                '/images/Stipendiater_Stim_Stipendiefesten_2025_PaoDuell_32.webp',
                '/images/Mingel_Stipendiefesten_2025_PaoDuell_112.webp',
                '/images/Stim_Music_for_Strings_&_Silk_PaoDuell_2025_46.webp',
                '/images/Stipendiater_Stim_Stipendiefesten_2025_PaoDuell_103.webp',
                '/images/POPKOLLO_PRESS_7.webp',
                '/images/Stim_Samla_Världens_Musik_2025_PaoDuell_38.webp',
                '/images/Mingel_Stipendiefesten_2025_PaoDuell_101.webp',
                '/images/8. KUNGÄLV FORTS.webp',
                '/images/Stim_Music_for_Strings_&_Silk_PaoDuell_2025_50.webp',
                '/images/Stim_Samla_Världens_Musik_2025_PaoDuell_21 1.webp',
                '/images/_DSC2384.webp',
              ]}
            />
          )}
        >
          <div />
        </ReelItem>

        {/* Reel 3: Sound circles bg + Stats overlay */}
        <ReelItem
          type="dotlottie"
          src="https://lottie.host/247d2af7-05bd-4659-90c0-1f85872dd94d/1bFMn4vwqg.lottie"
          backgroundColor="#a9a0e1"
          loop={true}
          overlay={({ isActive }) => (
            <LottieLayer
              src="/stats-overlay.json"
              isActive={isActive}
              loop={true}
              speed={0.8}
            />
          )}
        />

        {/* Reel 4: Marquee banners + heading */}
        <ReelItem
          type="custom"
          backgroundColor="#DEDBFB"
          overlay={({ isActive }) => (
            <>
              <MarqueeBanners
                isActive={isActive}
                color="#050038"
              />
              <AnimatedText
                text="Och en mängd andra initiativ"
                isActive={isActive}
                color="#050038"
                className="animated-text--h1"
                style={{ position: 'relative', zIndex: 1, marginBottom: 'auto', paddingTop: '56.53cqi' }}
              />
            </>
          )}
        >
          <div />
        </ReelItem>

        {/* Reel 5: Lottie bg + paragraph */}
        <ReelItem
          type="dotlottie"
          src="https://lottie.host/eedcc4b2-d7b6-4f2c-9d7e-66371daeb20b/rNKDRvNcpJ.lottie"
          backgroundColor="#DEDBFB"
          loop={false}
          overlay={({ isActive }) => (
            <>
              <TypewriterText
                text="Stims musikfrämjande arbete har gett generationer av kompositörer, låtskrivare och text-författare bättre förutsättningar att skapa och nå ut med sin musik"
                isActive={isActive}
                color="#050038"
                style={{ marginTop: 'auto', paddingBottom: '36.27cqi' }}
              />
              <KnotDoodle
                isActive={isActive}
                duration={2}
                style={{
                  position: 'absolute',
                  bottom: '2.13cqi',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  pointerEvents: 'none',
                }}
              />
            </>
          )}
        />
      </ReelsContainer>

      {/* Reel indicator dots */}
      <div className="reel-indicators">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`indicator ${i === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default App

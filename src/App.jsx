import { useState, useEffect, useRef, useCallback } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { ReelsContainer, ReelItem, AnimatedText, TypewriterText, ImageFlowReel, LineArtReel, TextPathBanner, KnotDoodle, IntroOverlay, MarqueeBanners, NumberMarquee, ScribbleDoodle, LogoMarquee, LightningDoodle, HighlightCircleDoodle } from './components'
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
function LottieLayer({ src, isActive, loop = false, speed = 1, style, onComplete }) {
  const ref = useRef(null)
  const loadedRef = useRef(false)
  const isActiveRef = useRef(isActive)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

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
        if (event === 'complete' && onCompleteRef.current) {
          onCompleteRef.current()
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
      dotLottie.addEventListener('ready', () => {
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
      autoplay={isActive}
      dotLottieRefCallback={dotLottieRefCallback}
      style={style || { position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}

/**
 * StatsReelContent — stacks two dotLottie animations (bg circles + stats overlay)
 * as direct children, avoiding the overlay canvas rendering issue.
 */
function StatsReelContent({ isActive }) {
  const bgRef = useRef(null)
  const statsRef = useRef(null)
  const isActiveRef = useRef(isActive)
  isActiveRef.current = isActive

  const bgCallback = useCallback((dotLottie) => {
    bgRef.current = dotLottie
    if (dotLottie) {
      dotLottie.addEventListener('load', () => {
        if (isActiveRef.current) dotLottie.play()
      })
    }
  }, [])

  const statsCallback = useCallback((dotLottie) => {
    statsRef.current = dotLottie
    if (dotLottie) {
      dotLottie.addEventListener('load', () => {
        if (isActiveRef.current) dotLottie.play()
      })
    }
  }, [])

  useEffect(() => {
    ;[bgRef, statsRef].forEach(ref => {
      if (!ref.current) return
      if (isActive) ref.current.play()
      else ref.current.stop()
    })
  }, [isActive])

  return (
    <>
      <DotLottieReact
        src="https://lottie.host/247d2af7-05bd-4659-90c0-1f85872dd94d/1bFMn4vwqg.lottie"
        loop
        autoplay={false}
        dotLottieRefCallback={bgCallback}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <DotLottieReact
        src="https://lottie.host/c0c87c47-1896-4809-bd6d-eab1ac747189/sFz5239OqN.lottie"
        loop
        autoplay={false}
        dotLottieRefCallback={statsCallback}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}
      />
    </>
  )
}

const COLLECTIONS = {
  musikframjande: { label: 'Musikfrämjande', reelCount: 7 },
  kortom2025: { label: 'Kort om 2025', reelCount: 6 },

}

function CollectionSwitcher({ active, onChange }) {
  return (
    <div className="collection-switcher">
      {Object.entries(COLLECTIONS).map(([key, { label }]) => (
        <button
          key={key}
          className={`collection-btn ${active === key ? 'active' : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function MusikframjandeReels({ onReelChange }) {
  const scheme1 = COLOR_SCHEMES['purple-bright']
  const scheme2 = COLOR_SCHEMES['purple-mix-1-inverted']

  return (
    <ReelsContainer onReelChange={onReelChange}>
      {/* Reel 0: Intro — Lottie bg + swipe hint overlay */}
      <ReelItem
        type="lottie"
        src="/intro-bg-new.json"
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
            src="https://lottie.host/9caa2bd1-f3db-48cd-b234-9638ef6db8cd/PVURpzsbjU.json"
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
      {/* Reel 6: Logo marquee + scribble */}
      <ReelItem
        type="custom"
        backgroundColor="#E8E6FB"
        overlay={({ isActive }) => (
          <>
            <ScribbleDoodle
              isActive={isActive}
              color="#CCC5F7"
              duration={2.5}
              style={{
                position: 'absolute',
                top: '-95cqi',
                left: '-10cqi',
                width: '160%',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 'auto', paddingTop: '52.8cqi' }}>
              <AnimatedText
                text="Tillsammans för musiken"
                isActive={isActive}
                color="#050038"
                className="animated-text--h1"
                delay={900}
              />
              <TypewriterText
                text="Våra föreningar arbetar också för en större musikalisk mångfald. Tillsammans skapar vi ett rikare musikliv."
                isActive={isActive}
                color="#050038"
                delay={1200}
              />
            </div>
            <LogoMarquee
              isActive={isActive}
              duration={25}
              delay={1500}
            />
          </>
        )}
      >
        <div />
      </ReelItem>
    </ReelsContainer>
  )
}

function KortOm2025Intro({ isActive }) {
  const [phase, setPhase] = useState(0) // 0: intro lottie, 1: second lottie + text

  useEffect(() => {
    if (!isActive) {
      setPhase(0)
      return
    }
    const timer = setTimeout(() => setPhase(1), 2000)
    return () => clearTimeout(timer)
  }, [isActive])

  return (
    <>
      {/* First Lottie — plays once */}
      <LottieLayer
        src="https://lottie.host/c00fcfe8-5a7e-433d-911f-77dc2e62144f/JY38TJRCUZ.json"
        isActive={isActive}
        loop={false}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: phase === 0 ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* Second Lottie — loops after first completes */}
      <LottieLayer
        src="https://lottie.host/b3ee3823-759d-4b5d-a86d-73e96c3b3cc7/296ZB6Rt1m.json"
        isActive={phase === 1}
        loop={true}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          opacity: phase === 1 ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* Title + paragraph — appears after intro */}
      <div style={{
        position: 'absolute',
        top: '56.53cqi',
        left: 0,
        right: 0,
        zIndex: 2,
        padding: '0 8.53cqi',
        opacity: phase === 1 ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        <AnimatedText
          text="Kort om 2025"
          isActive={phase === 1}
          color="#281402"
          className="animated-text--h1"
          delay={200}
        />
        <TypewriterText
          text="Här är ett axplock av vad vi åstadkom under året som gått."
          isActive={phase === 1}
          color="#281402"
          delay={500}
        />
      </div>
    </>
  )
}

function KortOm2025Reels({ onReelChange }) {
  return (
    <ReelsContainer onReelChange={onReelChange}>
      {/* Reel 0: Intro — sequenced Lotties + text */}
      <ReelItem
        type="custom"
        backgroundColor="#DEDBFB"
        overlay={({ isActive }) => (
          <KortOm2025Intro isActive={isActive} />
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 1: "Under 2025 samlade vi in" + number marquee */}
      <ReelItem
        type="custom"
        backgroundColor="#E8E6FB"
        overlay={({ isActive }) => (
          <>
            <ScribbleDoodle
              isActive={isActive}
              color="#CCC5F7"
              duration={2.5}
              style={{
                position: 'absolute',
                top: '-95cqi',
                left: '-10cqi',
                width: '160%',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 'auto', paddingTop: '52.8cqi' }}>
              <AnimatedText
                text="Under 2025 samlade vi in"
                isActive={isActive}
                color="#452531"
                className="animated-text--h1"
                delay={900}
              />
              <TypewriterText
                text="Tre miljarder sextioåtta miljoner kronor, Från överallt där musiken används"
                isActive={isActive}
                color="#452531"
                delay={1200}
              />
            </div>
            <NumberMarquee
              number="3 068 000 000"
              isActive={isActive}
              color="#452531"
              duration={50}
              delay={1500}
            />
          </>
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 1: Lightning doodle bg + Lottie JSON overlay */}
      <ReelItem
        type="custom"
        backgroundColor="#E8E6FB"
        overlay={({ isActive }) => (
          <>
            <LightningDoodle
              isActive={isActive}
              color="#CCC5F7"
              duration={2.5}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
              <LottieLayer
                src="https://lottie.host/13439045-95ae-4009-ad94-f73d13a52fa8/dT0S0zN0NC.json"
                isActive={isActive}
                loop={false}
              />
            </div>
          </>
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 2: 54% utlandet — orange bars + highlight circle */}
      <ReelItem
        type="custom"
        backgroundColor="#DEDAFA"
        overlay={({ isActive }) => (
          <>
            {/* Title with highlight circle doodle */}
            <div style={{
              position: 'absolute',
              top: '17.07cqi',
              left: 0,
              right: 0,
              zIndex: 3,
              textAlign: 'center',
            }}>
              <AnimatedText
                text="54% av pengarna vi samlar in kommer från utlandet"
                isActive={isActive}
                color="#452531"
                align="center"
                className="animated-text--body"
                delay={300}
                style={{ padding: '0 6.4cqi' }}
              />
            </div>
            {/* Highlight circle doodle */}
            <div style={{
              position: 'absolute',
              top: '13.33cqi',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '86.67cqi',
              zIndex: 2,
              pointerEvents: 'none',
            }}>
              <HighlightCircleDoodle
                isActive={isActive}
                color="#CCC5F7"
                duration={2}
                delay={1500}
              />
            </div>

            {/* Orange bars Lottie */}
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
            }}>
              <LottieLayer
                src="https://lottie.host/0fbf5fdd-12b8-4200-aa7d-d6607d3600d6/732pNL823F.json"
                isActive={isActive}
                loop={false}
              />
            </div>

            {/* Legend at bottom */}
            <div style={{
              position: 'absolute',
              bottom: '8cqi',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: '8cqi',
              zIndex: 2,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2.13cqi' }}>
                <div style={{ width: '3.2cqi', height: '3.2cqi', borderRadius: '50%', backgroundColor: '#F0B87E' }} />
                <span style={{ fontFamily: 'GeneralSans-Medium, sans-serif', fontSize: '4.27cqi', color: '#452531' }}>Sverige</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2.13cqi' }}>
                <div style={{ width: '3.2cqi', height: '3.2cqi', borderRadius: '50%', backgroundColor: '#E08A2E' }} />
                <span style={{ fontFamily: 'GeneralSans-Medium, sans-serif', fontSize: '4.27cqi', color: '#452531' }}>Utland</span>
              </div>
            </div>
          </>
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 3: Placeholder — utbetalningar */}
      <ReelItem
        type="custom"
        backgroundColor="#E8E6FB"
        overlay={({ isActive }) => (
          <TypewriterText
            text="Vi betalade ut xxx miljarder till låtskrivare, textförfattare, kompositörer och musikförlag (relation till nordiska länder)"
            isActive={isActive}
            color="#452531"
            style={{ marginTop: 'auto', marginBottom: 'auto', padding: '0 6.4cqi' }}
          />
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 4: Music is Life gif + text */}
      <ReelItem
        type="custom"
        backgroundColor="#DEDBFB"
        overlay={({ isActive }) => (
          <>
            {/* GIF centered in upper half */}
            <div style={{
              position: 'absolute',
              top: '13cqi',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '70cqi',
              zIndex: 1,
            }}>
              <img
                src="/images/stim_giphy_music_is_life.gif"
                alt="Music is Life"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>

            {/* Title + paragraph towards bottom */}
            <div style={{
              position: 'absolute',
              bottom: '32cqi',
              left: 0,
              right: 0,
              zIndex: 2,
              padding: '0 8.53cqi',
            }}>
              <AnimatedText
                text="Stim gör ingen vinst"
                isActive={isActive}
                color="#050038"
                className="animated-text--h2"
                delay={500}
              />
              <TypewriterText
                text="Vi tar bara ut kostnaden för att samla in och fördela pengarna till musikskaparna. 2025 var kostnaden 9,5%."
                isActive={isActive}
                color="#050038"
                delay={800}
              />
            </div>
          </>
        )}
      >
        <div />
      </ReelItem>
    </ReelsContainer>
  )
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeCollection, setActiveCollection] = useState('musikframjande')

  const handleReelChange = (index) => {
    setCurrentIndex(index)
  }

  const handleCollectionChange = (key) => {
    if (key === activeCollection) return
    setActiveCollection(key)
    setCurrentIndex(0)
  }

  const reelCount = COLLECTIONS[activeCollection].reelCount

  return (
    <div className="app">
      <CollectionSwitcher active={activeCollection} onChange={handleCollectionChange} />

      {activeCollection === 'musikframjande' && (
        <MusikframjandeReels onReelChange={handleReelChange} />
      )}
      {activeCollection === 'kortom2025' && (
        <KortOm2025Reels onReelChange={handleReelChange} />
      )}

      {/* Reel indicator dots */}
      <div className="reel-indicators">
        {[...Array(reelCount)].map((_, i) => (
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

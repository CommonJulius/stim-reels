import { useState, useEffect, useRef, useCallback } from 'react'
import { Player } from '@lottiefiles/react-lottie-player'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { ReelsContainer, ReelItem, AnimatedText, TypewriterText, ImageFlowReel, LineArtReel, TextPathBanner, KnotDoodle, IntroOverlay, MarqueeBanners, NumberMarquee, ScribbleDoodle, LogoMarquee, LightningDoodle, HighlightCircleDoodle, ImageReveal } from './components'
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
      // stop() resets to frame 0 and pauses, then play() starts fresh.
      // More reliable than setSeeker when keepLastFrame has left the player
      // in an "ended" state after a previous play.
      ref.current.stop()
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
      autoplay={isActive}
      keepLastFrame={!loop}
      speed={speed}
      background="transparent"
      renderer="svg"
      style={style || { position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      onEvent={(event) => {
        if (event === 'load') {
          loadedRef.current = true
          if (isActiveRef.current && ref.current) {
            // stop() hard-resets and clears any "ended" state, then play() starts fresh
            ref.current.stop()
            ref.current.play()
          }
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
 * DelayedLottie — shows and plays a full-screen Lottie after a delay, covering content beneath
 */
/**
 * PlainLottie — plays a Lottie JSON via lottie-web directly. Reliable across
 * mount/unmount cycles (collection switches, etc.) unlike the Player wrapper.
 */
function PlainLottie({ src, isActive, loop = false, style }) {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const isActiveRef = useRef(isActive)

  isActiveRef.current = isActive

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    import('lottie-web').then((lottie) => {
      if (cancelled || !containerRef.current) return
      const instance = lottie.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop,
        autoplay: false,
        path: src,
      })
      instanceRef.current = instance

      instance.addEventListener('DOMLoaded', () => {
        if (isActiveRef.current) {
          instance.goToAndPlay(0, true)
        }
      })
    })

    return () => {
      cancelled = true
      if (instanceRef.current) {
        instanceRef.current.destroy()
        instanceRef.current = null
      }
    }
  }, [src, loop])

  useEffect(() => {
    if (!instanceRef.current) return
    if (isActive) {
      instanceRef.current.goToAndPlay(0, true)
    } else {
      instanceRef.current.stop()
    }
  }, [isActive])

  return (
    <div
      ref={containerRef}
      style={style || { position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  )
}

function DelayedLottie({ src, isActive, delay = 1000, onShow, dotLottie = false }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setShow(true)
        onShow?.()
      }, delay)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [isActive, delay])

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      zIndex: 2,
      opacity: show ? 1 : 0,
      transition: 'opacity 300ms ease',
      pointerEvents: 'none',
    }}>
      {dotLottie ? (
        show && (
          <DotLottieLayer
            src={src}
            isActive={true}
            loop={false}
          />
        )
      ) : (
        <LottieLayer
          src={src}
          isActive={show}
          loop={false}
        />
      )}
    </div>
  )
}

/**
 * PartialLoopLottie — plays a Lottie JSON via lottie-web, then loops from loopFrom frame
 */
function PartialLoopLottie({ src, isActive, loopFrom, style }) {
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const isActiveRef = useRef(isActive)
  const readyRef = useRef(false)

  isActiveRef.current = isActive

  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false

    import('lottie-web').then((lottie) => {
      if (cancelled || !containerRef.current) return
      const instance = lottie.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: src,
      })
      instanceRef.current = instance

      instance.addEventListener('DOMLoaded', () => {
        readyRef.current = true
        if (isActiveRef.current) {
          instance.goToAndPlay(0, true)
        }
      })

      instance.addEventListener('complete', () => {
        if (isActiveRef.current) {
          instance.loop = true
          instance.playSegments([loopFrom, instance.totalFrames], true)
        }
      })
    })

    return () => {
      cancelled = true
      if (instanceRef.current) {
        instanceRef.current.destroy()
        instanceRef.current = null
      }
      readyRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!instanceRef.current || !readyRef.current) return
    if (isActive) {
      instanceRef.current.loop = false
      instanceRef.current.goToAndPlay(0, true)
    } else {
      instanceRef.current.stop()
      instanceRef.current.loop = false
    }
  }, [isActive])

  return (
    <div
      ref={containerRef}
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
  kortom2025: { label: 'Kort om 2025', reelCount: 9 },
  musikintakter: { label: 'Musikintäkter i Sverige', reelCount: 9 },
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
  const LOOP_START_FRAME = 387 // 6.45s at 60fps
  const containerRef = useRef(null)
  const instanceRef = useRef(null)
  const isActiveRef = useRef(isActive)
  const [showText, setShowText] = useState(false)

  isActiveRef.current = isActive

  // Load and control lottie-web directly (bypassing Player wrapper issues)
  useEffect(() => {
    if (!containerRef.current) return
    let instance = null

    import('lottie-web').then((lottie) => {
      if (!containerRef.current) return
      instance = lottie.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'https://lottie.host/2aa6d980-4669-432d-978f-9c386473a6cb/SmpU7wgSEh.json',
      })
      instanceRef.current = instance

      instance.addEventListener('DOMLoaded', () => {
        if (isActiveRef.current) {
          instance.goToAndPlay(0, true)
        }
      })

      instance.addEventListener('complete', () => {
        if (isActiveRef.current) {
          setShowText(true)
          instance.loop = true
          instance.playSegments([LOOP_START_FRAME, instance.totalFrames], true)
        }
      })
    })

    return () => {
      if (instance) instance.destroy()
      instanceRef.current = null
    }
  }, [])

  // Handle isActive changes (restart, collection switch)
  useEffect(() => {
    if (!instanceRef.current) return
    if (isActive) {
      setShowText(false)
      instanceRef.current.loop = false
      instanceRef.current.goToAndPlay(0, true)
    } else {
      setShowText(false)
      instanceRef.current.stop()
      instanceRef.current.loop = false
    }
  }, [isActive])

  return (
    <>
      {/* Title + paragraph — behind the lottie */}
      <div style={{
        position: 'absolute',
        top: '56.53cqi',
        left: 0,
        right: 0,
        zIndex: 1,
        padding: '0 8.53cqi',
      }}>
        <AnimatedText
          text="Kort om 2025"
          isActive={isActive}
          color="#281402"
          className="animated-text--h1"
          delay={1500}
        />
        <TypewriterText
          text="Här är ett axplock av vad vi åstadkom under året som gått."
          isActive={isActive}
          color="#281402"
          delay={1800}
        />
      </div>

      {/* Lottie container — in front */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }}
      />
    </>
  )
}

function TitleToLottieReel({ isActive, title, lottieSrc, lottieDelay = 1800, dotLottie = false }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!isActive) setFadeOut(false)
  }, [isActive])

  return (
    <>
      <ScribbleDoodle
        isActive={isActive}
        color="#CCC5F7"
        duration={2.5}
        style={{
          position: 'absolute',
          top: '-100cqi',
          left: '-10cqi',
          width: '160%',
          pointerEvents: 'none',
        }}
      />
      {/* Left-aligned title — fades out when Lottie appears */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        zIndex: 1,
        padding: '0 8.53cqi',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 500ms ease',
      }}>
        <AnimatedText
          text={title}
          isActive={isActive}
          color="#452531"
          className="animated-text--h1"
          delay={300}
        />
      </div>

      {/* Lottie — covers screen after delay */}
      <DelayedLottie
        src={lottieSrc}
        isActive={isActive}
        delay={lottieDelay}
        onShow={() => setFadeOut(true)}
        dotLottie={dotLottie}
      />
    </>
  )
}

function TitleToDoodleReel({ isActive }) {
  const [doodleActive, setDoodleActive] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (isActive) {
      const t1 = setTimeout(() => setDoodleActive(true), 2500)
      return () => clearTimeout(t1)
    } else {
      setDoodleActive(false)
      setFadeOut(false)
    }
  }, [isActive])

  return (
    <>
      {/* Scribble doodle — plays after title has finished animating in */}
      <ScribbleDoodle
        isActive={doodleActive}
        color="#CCC5F7"
        duration={2.5}
        style={{
          position: 'absolute',
          top: '-100cqi',
          left: '-10cqi',
          width: '160%',
          pointerEvents: 'none',
        }}
      />

      {/* Left-aligned title — fades out when Lottie appears */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        zIndex: 1,
        padding: '0 8.53cqi',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 500ms ease',
      }}>
        <AnimatedText
          text="2025 präglades också av utveckling och framsteg"
          isActive={isActive}
          color="#452531"
          className="animated-text--h2"
          delay={300}
        />
      </div>

      {/* Lottie — covers screen after longer delay */}
      <DelayedLottie
        src="https://lottie.host/837a8f27-1c52-468c-af0e-b665e78a9195/Cp4pcbIOBm.lottie"
        isActive={isActive}
        delay={2500}
        onShow={() => setFadeOut(true)}
        dotLottie
      />
    </>
  )
}

function KortOm2025Reels({ onReelChange }) {
  return (
    <ReelsContainer onReelChange={onReelChange}>
      {/* Reel 0: Intro — Lottie + text */}
      <ReelItem
        type="custom"
        backgroundColor="#DEDBFB"
        overlay={({ isActive }) => (
          <>
            {/* Lottie — behind */}
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
              <PlainLottie
                src="https://lottie.host/54110a02-1368-4bc6-a2b5-cfea8e9ae8a9/G1xxi1EsPt.json"
                isActive={isActive}
                loop={false}
              />
            </div>

            {/* Title + paragraph — in front */}
            <div style={{
              position: 'absolute',
              top: '60.8cqi',
              left: 0,
              right: 0,
              zIndex: 2,
              padding: '0 8.53cqi',
            }}>
              <AnimatedText
                text="Kort om 2025"
                isActive={isActive}
                color="#281402"
                className="animated-text--h1"
                delay={2333}
              />
              <TypewriterText
                text="Här är ett axplock av vad vi åstadkom under året som gått."
                isActive={isActive}
                color="#281402"
                delay={2633}
              />
            </div>
          </>
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
                src="https://lottie.host/1b5ce296-8a27-4840-b7dd-9a6a2975535f/Sgfbb3S7UH.json"
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
                text="Över hälften av pengarna kommer från utlandet"
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
              <PartialLoopLottie
                src="https://lottie.host/08d59f2a-8b93-4e23-bab3-409eacb2687d/3Wtivc4wCF.json"
                isActive={isActive}
                loopFrom={98}
              />
            </div>

          </>
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 4: Title fades out + full-screen Lottie map */}
      <ReelItem
        type="custom"
        backgroundColor="#E8E6FB"
        overlay={({ isActive }) => (
          <TitleToLottieReel
            isActive={isActive}
            title="Mest pengar kom från dessa länder."
            lottieSrc="https://lottie.host/79b869fd-8165-4a6b-ac82-5d3bcd826dc9/D7FHvVmsNE.json"
          />
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 3: Image flow — utbetalningar (skip image rain, use new carousel) */}
      <ReelItem
        type="custom"
        backgroundColor="#E8E6FB"
        overlay={({ isActive }) => (
          <ImageFlowReel
            isActive={isActive}
            backgroundColor="#E8E6FB"
            textColor="#452531"
            bodyColor="#452531"
            heading=""
            body="Vi betalade ut 2,7 miljarder till låtskrivare, textförfattare, kompositörer och musikförlag. Det är 1,2 miljarder mer än för tio år sedan"
            images={[]}
            skipFlowPhase
            carouselLottieSrc="https://lottie.host/b9b2dd2c-592f-46e5-bcc6-7b6f6f06d84f/tgBWnF2iGu.json"
          />
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 6: Title + delayed lightning doodle */}
      <ReelItem
        type="custom"
        backgroundColor="#E8E6FB"
        overlay={({ isActive }) => (
          <TitleToDoodleReel isActive={isActive} />
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
                text="Stim är inte vinstdrivande"
                isActive={isActive}
                color="#050038"
                className="animated-text--h2"
                delay={500}
              />
              <TypewriterText
                text="Vi tar bara ut kostnaden för att samla in och fördela pengarna till musikskaparna. 2025 var kostnaden 10,6%."
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

      {/* Reel: Outro — Music is Life gif + text */}
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
                src="/images/stim_giphy_microfon.gif"
                alt="Microphone"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>

            {/* Text towards bottom */}
            <div style={{
              position: 'absolute',
              bottom: '32cqi',
              left: 0,
              right: 0,
              zIndex: 2,
              padding: '0 8.53cqi',
            }}>
              <TypewriterText
                text="Allt för att värdet av musik ska fortsätta nå tillbaka till dem som skapar den."
                isActive={isActive}
                color="#050038"
                className="typewriter-text--md"
                delay={500}
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

function MusikintakterReels({ onReelChange }) {
  return (
    <ReelsContainer onReelChange={onReelChange}>
      {/* Reel 0: Intro — Lottie bg + text */}
      <ReelItem
        type="lottie"
        src="https://lottie.host/13abf702-0c20-42dc-9ffc-fac67e4ac2c1/d8ba3rYVFZ.json"
        backgroundColor="#EAEFFF"
        loop={false}
        overlay={({ isActive }) => (
          <div style={{
            position: 'absolute',
            top: '60.8cqi',
            left: 0,
            right: 0,
            zIndex: 2,
            padding: '0 8.53cqi',
          }}>
            <AnimatedText
              text="Musikintäkter i Sverige"
              isActive={isActive}
              color="#050038"
              className="animated-text--h1"
              delay={800}
            />
            <TypewriterText
              text="Så gick det för musiken i Sverige 2025."
              isActive={isActive}
              color="#050038"
              delay={1100}
            />
          </div>
        )}
      />

      {/* Reel 1: Image reveal + paragraph */}
      <ReelItem
        type="custom"
        backgroundColor="#EAEFFF"
        overlay={({ isActive }) => (
          <>
            <ImageReveal
              src="/images/Instrument-83.webp"
              alt="Musik i Sverige"
              isActive={isActive}
              credit="Foto: Melina Hägglund"
            />
            <TypewriterText
              text="Musik är överallt i Sverige. På konserter. I butiker. I mobilen."
              isActive={isActive}
              color="#050038"
              className="typewriter-text--md"
              style={{ position: 'absolute', top: '91.47cqi', left: 0, right: 0, padding: '0 8.53cqi' }}
            />
            <KnotDoodle
              isActive={isActive}
              strokeColor="#CBD7F7"
              duration={2}
              style={{
                position: 'absolute',
                bottom: '-2.67cqi',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 2: Image carousel + text (skipping image flow phase) */}
      <ReelItem
        type="custom"
        backgroundColor="#EAEFFF"
        overlay={({ isActive }) => (
          <ImageFlowReel
            isActive={isActive}
            backgroundColor="#EAEFFF"
            textColor="#050038"
            bodyColor="#050038"
            heading=""
            body="Där musik används – där samlar vi in pengar genom våra licenser."
            images={[]}
            skipFlowPhase
            carouselLottieSrc="https://lottie.host/b9a7022f-d44e-49ab-bd2b-e93349566336/bVqCBJDQP1.json"
          />
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 3: Scribble + title + number marquee */}
      <ReelItem
        type="custom"
        backgroundColor="#EAEFFF"
        overlay={({ isActive }) => (
          <>
            <ScribbleDoodle
              isActive={isActive}
              color="#CBD7F7"
              duration={2.5}
              style={{
                position: 'absolute',
                top: '-95cqi',
                left: '-10cqi',
                width: '160%',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 'auto', paddingTop: '62.13cqi' }}>
              <AnimatedText
                text="2025 samlade vi för första gången in över en miljard kronor för musik i Sverige."
                isActive={isActive}
                color="#050038"
                className="animated-text--h3"
                delay={900}
              />
            </div>
            <NumberMarquee
              number="1 miljard"
              isActive={isActive}
              color="#050038"
              duration={50}
              delay={1500}
            />
          </>
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 4: Title + highlight circle + Lottie chart */}
      <ReelItem
        type="custom"
        backgroundColor="#EAEFFF"
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
                text="Placeholder title"
                isActive={isActive}
                color="#050038"
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
                color="#CBD7F7"
                duration={2}
                delay={1500}
              />
            </div>

            {/* Chart Lottie */}
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
            }}>
              <LottieLayer
                src="https://lottie.host/a0ef590c-20bc-4388-bef2-52fbf19f84f2/7dTr4H7yhm.json"
                isActive={isActive}
                loop={false}
              />
            </div>
          </>
        )}
      >
        <div />
      </ReelItem>
      {/* Reel 5: Title + highlight circle + Lottie chart 2 */}
      <ReelItem
        type="custom"
        backgroundColor="#EAEFFF"
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
                text="Placeholder title"
                isActive={isActive}
                color="#050038"
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
                color="#CBD7F7"
                duration={2}
                delay={1500}
              />
            </div>

            {/* Chart Lottie */}
            <div style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
            }}>
              <LottieLayer
                src="https://lottie.host/acd9284b-47f0-42ae-a433-8caf4d1db52a/QMQvpT6KqO.json"
                isActive={isActive}
                loop={false}
              />
            </div>
          </>
        )}
      >
        <div />
      </ReelItem>

      {/* Reel 6: Image reveal bottom + text above */}
      <ReelItem
        type="custom"
        backgroundColor="#EAEFFF"
        overlay={({ isActive }) => (
          <>
            <KnotDoodle
              isActive={isActive}
              strokeColor="#CBD7F7"
              duration={2}
              style={{
                position: 'absolute',
                top: '-2.67cqi',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                pointerEvents: 'none',
              }}
            />
            <TypewriterText
              text="Online ökade kraftigt med 75%. Drivet av nya stora avtal."
              isActive={isActive}
              color="#050038"
              className="typewriter-text--md"
              style={{ position: 'absolute', bottom: '95.64cqi', left: 0, right: 0, padding: '0 8.53cqi' }}
            />
            <ImageReveal
              src="/images/STIM_latskrivarcamp_2025_085.webp"
              alt="Online musik"
              isActive={isActive}
              credit="Foto: Stim"
              variant="bottom"
            />
          </>
        )}
      >
        <div />
      </ReelItem>
      {/* Reel 7: Image reveal + paragraph */}
      <ReelItem
        type="custom"
        backgroundColor="#EAEFFF"
        overlay={({ isActive }) => (
          <>
            <ImageReveal
              src="/images/STIM_100_PaoDuell_150.webp"
              alt="Livemusik"
              isActive={isActive}
              credit="Foto: Pao Duell"
            />
            <TypewriterText
              text="Livemusiken gjorde ett rekordår. Fler konserter. Större konserter +32%"
              isActive={isActive}
              color="#050038"
              className="typewriter-text--md"
              style={{ position: 'absolute', top: '91.47cqi', left: 0, right: 0, padding: '0 8.53cqi' }}
            />
            <KnotDoodle
              isActive={isActive}
              strokeColor="#CBD7F7"
              duration={2}
              style={{
                position: 'absolute',
                bottom: '-2.67cqi',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                pointerEvents: 'none',
              }}
            />
          </>
        )}
      >
        <div />
      </ReelItem>
      {/* Reel 8: Outro — gif + text */}
      <ReelItem
        type="custom"
        backgroundColor="#EAEFFF"
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
                src="/images/stim_giphy_licensierad_musik.gif"
                alt="Licensierad musik"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>

            {/* Text towards bottom */}
            <div style={{
              position: 'absolute',
              bottom: '32cqi',
              left: 0,
              right: 0,
              zIndex: 2,
              padding: '0 8.53cqi',
            }}>
              <TypewriterText
                text="Allt det här betyder mer pengar tillbaka till musikskapare och förlag"
                isActive={isActive}
                color="#050038"
                className="typewriter-text--md"
                delay={500}
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
      {activeCollection === 'musikintakter' && (
        <MusikintakterReels onReelChange={handleReelChange} />
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

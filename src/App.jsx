import { useEffect, useRef, useState } from 'react'
import pandaGraduate from './assets/img/panda-graduate.png'
import pandaWalk from './assets/img/panda-walk.png'
import pandaWalkAlt from './assets/img/panda-walk-alt.png'
import pandaPeek from './assets/img/panda-peek.png'
import pandaCelebrate from './assets/img/panda-celebrate.png'
import pandaLetter from './assets/img/panda-letter.png'
import pandaBouquet from './assets/img/panda-bouquet.png'
import ipbLogo from './assets/img/ipb-logo-transparent.png'
import graduationSong from './assets/song/Congratulations - Past Malone ft. Quavo [Edit Audio].mp3'
import './index.css'

const Icon = ({ name, size = 20 }) => {
  const paths = {
    music: <><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></>,
    volume: <><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18 6a8.5 8.5 0 0 1 0 12"/></>,
    mute: <><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m16 9 5 5m0-5-5 5"/></>,
    camera: <><path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z"/><circle cx="12" cy="13" r="4"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 21h14"/></>,
    arrow: <><path d="M12 5v14m6-6-6 6-6-6"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5a5.5 5.5 0 0 0 1.1-8.9Z"/>,
    refresh: <><path d="M20 6v5h-5"/><path d="M19 11a8 8 0 1 0-2.3 6"/></>,
  }
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const Reveal = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null)
  useEffect(() => {
    const element = ref.current
    const observer = new IntersectionObserver(([entry]) => {
      element.classList.toggle('is-visible', entry.isIntersecting)
    }, { threshold: 0.12, rootMargin: '-7% 0px -7% 0px' })
    if (element) observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={{ '--delay': `${delay}ms` }}>{children}</div>
}

const celebrationRain = [
  ['cap', ''], ['star', '✦'], ['heart', '♡'], ['confetti', ''],
  ['spark', '★'], ['heart', '♥'], ['cap', ''], ['confetti', ''],
  ['star', '✧'], ['heart', '♡'], ['spark', '✦'], ['confetti', ''],
  ['cap', ''], ['star', '★'], ['heart', '♥'], ['confetti', ''],
  ['spark', '✦'], ['heart', '♡'],
]

const CelebrationRain = () => (
  <div className="celebration-rain" aria-hidden="true">
    {celebrationRain.map(([type, symbol], index) => <i className={`rain-item rain-item--${type}`} key={`${type}-${index}`} style={{ '--i': index, '--x': `${(index * 47) % 100}%`, '--scale': 0.7 + (index % 5) * 0.12 }}>{symbol}</i>)}
  </div>
)

function App() {
  const [opened, setOpened] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [shots, setShots] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [flash, setFlash] = useState(false)
  const audioRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => () => streamRef.current?.getTracks().forEach(track => track.stop()), [])

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return undefined
    const video = videoRef.current
    video.srcObject = streamRef.current
    const markReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) setCameraReady(true)
    }
    video.addEventListener('loadedmetadata', markReady)
    video.addEventListener('canplay', markReady)
    video.play().then(markReady).catch(() => {})
    markReady()
    return () => {
      video.removeEventListener('loadedmetadata', markReady)
      video.removeEventListener('canplay', markReady)
    }
  }, [cameraOpen])

  const openGift = async () => {
    setOpened(true)
    document.body.classList.add('opened')
    try {
      await audioRef.current.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  const toggleMusic = async () => {
    if (playing) audioRef.current.pause()
    else await audioRef.current.play()
    setPlaying(!playing)
  }

  const startCamera = async () => {
    setCameraError('')
    setCameraReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false,
      })
      const videoTrack = stream.getVideoTracks()[0]
      try {
        const capabilities = videoTrack.getCapabilities?.()
        if (capabilities?.zoom) {
          const normalZoom = Math.min(capabilities.zoom.max, Math.max(capabilities.zoom.min, 1))
          await videoTrack.applyConstraints({ advanced: [{ zoom: normalZoom }] })
        }
      } catch {
        // Some mobile browsers expose zoom but do not allow changing it.
      }
      streamRef.current = stream
      setCameraOpen(true)
    } catch {
      setCameraError('Camera access was not available. Please allow camera permission and try again.')
    }
  }

  const takePhoto = () => {
    if (!cameraReady || !videoRef.current || shots.length >= 3 || countdown !== null) return
    let number = 3
    setCountdown(number)
    const timer = setInterval(() => {
      number -= 1
      if (number > 0) setCountdown(number)
      else {
        clearInterval(timer)
        setCountdown(null)
        captureFrame()
      }
    }, 750)
  }

  const captureFrame = () => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraReady(false)
      setCameraError('The camera is still preparing. Please wait a moment and try again.')
      return
    }
    const canvas = document.createElement('canvas')
    const targetRatio = 4 / 3
    let sourceWidth = video.videoWidth
    let sourceHeight = sourceWidth / targetRatio
    if (sourceHeight > video.videoHeight) {
      sourceHeight = video.videoHeight
      sourceWidth = sourceHeight * targetRatio
    }
    canvas.width = 720
    canvas.height = 540
    const context = canvas.getContext('2d')
    context.translate(canvas.width, 0)
    context.scale(-1, 1)
    context.drawImage(video, (video.videoWidth - sourceWidth) / 2, (video.videoHeight - sourceHeight) / 2, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    setFlash(true)
    setTimeout(() => setFlash(false), 180)
    setShots(previous => [...previous, canvas.toDataURL('image/jpeg', 0.9)])
  }

  const downloadStrip = async () => {
    if (shots.length !== 3) return
    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 1840
    const context = canvas.getContext('2d')
    const frameMaroon = '#5c2134'
    const frameGold = '#aa8b5c'
    drawTrianglePattern(context, 900, 1840)
    context.save()
    context.shadowColor = 'rgba(62, 11, 28, .2)'
    context.shadowBlur = 26
    context.shadowOffsetY = 14
    context.fillStyle = '#fffaf2'
    roundRect(context, 42, 158, 816, 1575, 30)
    context.fill()
    context.restore()
    context.strokeStyle = frameMaroon
    context.lineWidth = 10
    roundRect(context, 42, 158, 816, 1575, 30)
    context.stroke()
    context.strokeStyle = frameGold
    context.lineWidth = 3
    roundRect(context, 51, 167, 798, 1557, 24)
    context.stroke()
    const images = await Promise.all(shots.map(source => loadImage(source)))
    images.forEach((image, index) => {
      const y = 190 + index * 484
      drawCoverImage(context, image, 58, y, 784, 468, 13)
      drawPhotoBlend(context, 58, y, 784, 468, 13)
      context.strokeStyle = frameMaroon
      context.lineWidth = 9
      roundRect(context, 54, y - 4, 792, 476, 17)
      context.stroke()
      context.strokeStyle = 'rgba(255, 250, 242, .9)'
      context.lineWidth = 3
      roundRect(context, 62, y + 4, 776, 460, 10)
      context.stroke()
    })
    const [walkImage, peekImage, celebrateImage, logoImage] = await Promise.all([loadImage(pandaWalk), loadImage(pandaPeek), loadImage(pandaCelebrate), loadImage(ipbLogo)])
    context.fillStyle = frameMaroon
    context.fillRect(48, 124, 804, 18)
    context.fillStyle = '#fffaf2'
    context.fillRect(48, 130, 804, 4)
    context.save()
    context.shadowColor = 'rgba(62, 11, 28, .22)'
    context.shadowBlur = 18
    context.shadowOffsetY = 8
    context.fillStyle = frameMaroon
    roundRect(context, 190, 48, 520, 134, 60)
    context.fill()
    context.restore()
    context.fillStyle = '#fffaf2'
    context.textAlign = 'center'
    setFittedCanvasFont(context, 'Graduation Day', {
      maxWidth: 430,
      maxSize: 60,
      minSize: 46,
      style: 'italic',
      weight: 700,
      family: 'Georgia, serif',
    })
    context.fillText('Graduation Day', 450, 120)
    setFittedCanvasFont(context, 'SV IPB ANGKATAN 60', {
      maxWidth: 340,
      maxSize: 23,
      minSize: 18,
      weight: 700,
      family: 'Arial, sans-serif',
    })
    context.fillText('SV IPB ANGKATAN 60', 450, 157)
    drawImageWithShadow(context, logoImage, 0, 38, 202, 202, 18)
    drawImageWithShadow(context, peekImage, 642, 36, 285, 310, 18)
    drawImageWithShadow(context, walkImage, -18, 1435, 315, 305, 18)
    drawImageWithShadow(context, celebrateImage, 638, 1390, 285, 330, 18)
    context.fillStyle = frameMaroon
    roundRect(context, 240, 1642, 420, 70, 35)
    context.fill()
    context.fillStyle = '#fffaf2'
    context.font = '600 31px Arial, sans-serif'
    context.fillText('IPB University', 450, 1688)
    context.fillStyle = 'rgba(111,24,49,.25)'
    context.font = '42px Georgia, serif'
    context.fillText('♡', 840, 580)
    context.fillText('✦', 60, 1040)
    const link = document.createElement('a')
    link.download = 'amara-graduation-photostrip.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <main>
      <audio ref={audioRef} src={graduationSong} loop preload="auto" />
      <CelebrationRain />

      <div className={`opening ${opened ? 'opening--gone' : ''}`} aria-hidden={opened}>
        <div className="opening__ribbon">GRADUATION · LETTER · 2026</div>
        <div className="opening__card">
          <span className="opening__spark opening__spark--one">✦</span><span className="opening__spark opening__spark--two">♡</span>
          <img className="opening__logo" src={ipbLogo} alt="IPB University"/>
          <div className="opening__ornament">✦</div>
          <p className="eyebrow">A LITTLE CELEBRATION FOR</p>
          <h1><span>For</span> Amara</h1>
          <p className="opening__subtitle">a letter for your brightest chapter yet</p>
          <div className="opening__panda"><img src={pandaPeek} alt="Panda peeking around the graduation letter"/></div>
          <div className="envelope"><span className="envelope__flap"/><span className="envelope__seal"><Icon name="heart" size={18}/></span></div>
          <button className="button button--light" onClick={openGift}>Open your letter <span>→</span></button>
          <p className="sound-note"><Icon name="music" size={14}/> Best enjoyed with sound</p>
        </div>
      </div>

      {opened && <>
        <button className="music-toggle" onClick={toggleMusic} aria-label={playing ? 'Pause background music' : 'Play background music'}>
          <span className={playing ? 'music-toggle__disc is-playing' : 'music-toggle__disc'}>♪</span>
          <span>{playing ? 'Now playing' : 'Play music'}</span>
          <Icon name={playing ? 'volume' : 'mute'} size={17}/>
        </button>

        <section className="hero section-maroon snap-section">
          <div className="hero__sparkle hero__sparkle--one">✦</div><div className="hero__sparkle hero__sparkle--two">✧</div>
          <div className="hero__content">
            <Reveal><p className="eyebrow">A MOMENT WORTH CELEBRATING</p></Reveal>
            <Reveal delay={120}><h2>You did it,<br/><em>Amara!</em></h2></Reveal>
            <Reveal delay={220}><p className="hero__degree">Amara Najwa Sabrina, A.Md<br/><span>IPB University</span></p></Reveal>
            <Reveal className="hero__panda-wrap" delay={300}>
              <span className="doodle doodle--left">yay!</span>
              <img className="hero__panda" src={pandaGraduate} alt="A cheerful panda in IPB-inspired graduation robes holding a diploma"/>
              <span className="doodle doodle--right">proud<br/>of you!</span>
            </Reveal>
            <a className="scroll-cue" href="#letter"><span>SCROLL FOR YOUR SURPRISE</span><Icon name="arrow" size={18}/></a>
          </div>
          <div className="panda-walkway" aria-hidden="true"><div className="panda-walker"><img className="walk-frame walk-frame--a" src={pandaWalk} alt=""/><img className="walk-frame walk-frame--b" src={pandaWalkAlt} alt=""/></div></div>
        </section>

        <section className="letter-section snap-section" id="letter">
          <div className="letter-confetti" aria-hidden="true"><span className="mini-cap"/><span>✦</span><span>♡</span><span>✧</span></div>
          <img className="letter-panda letter-panda--bouquet" src={pandaBouquet} alt="" aria-hidden="true"/>
          <Reveal className="section-heading"><p className="eyebrow eyebrow--maroon">A LETTER, JUST FOR YOU</p><h2>Dear Amara,</h2></Reveal>
          <Reveal className="letter-card" delay={100}>
            <span className="quote-mark">“</span>
            <p>Today is proof of every early morning, every brave decision, and every quiet moment when you chose to keep going.</p>
            <p>You did not simply earn a degree. You grew into someone even stronger, wiser, and more wonderful along the way.</p>
            <p className="letter-card__highlight">May this be the first page of a life that feels every bit as beautiful as you imagined.</p>
            <div className="letter-sign"><span>So incredibly proud of you,</span><strong>Rian</strong></div>
          </Reveal>
          <img className="letter-panda letter-panda--reader" src={pandaLetter} alt="" aria-hidden="true"/>
        </section>

        <section className="chapter section-cream snap-section">
          <Reveal className="section-heading centered"><p className="eyebrow eyebrow--maroon">YOUR NEXT CHAPTER</p><h2>May it be filled with…</h2></Reveal>
          <div className="wishes-grid">
            {[
              ['01', 'Brave beginnings', 'The courage to step into every new room as yourself.'],
              ['02', 'Joyful detours', 'The kind of surprises that become your favorite stories.'],
              ['03', 'Dreams in bloom', 'Work that matters, people who care, and dreams worth chasing.'],
              ['04', 'A soft place to land', 'Peace on the busy days and laughter on all the others.'],
            ].map(([number, title, copy], index) => <Reveal className="wish" delay={index * 80} key={title}><span className="wish__number">{number}</span><div><h3>{title}</h3><p>{copy}</p></div></Reveal>)}
          </div>
          <div className="chapter-panda" aria-hidden="true"><img src={pandaPeek} alt=""/><span>keep going!</span></div>
        </section>

        <section className="quote-section section-maroon snap-section">
          <Reveal><span className="mini-star">✦</span><blockquote>“Go confidently in the direction of your dreams. Live the life you have imagined.”</blockquote><cite>— HENRY DAVID THOREAU</cite></Reveal>
          <img className="quote-panda quote-panda--celebrate" src={pandaCelebrate} alt="" aria-hidden="true"/>
        </section>

        <section className="photobooth-section snap-section" id="photobooth">
          <Reveal className="section-heading centered"><p className="eyebrow eyebrow--maroon">ONE MORE THING…</p><h2>Capture the moment!</h2><p className="section-intro">Three little snaps to remember this very big day.</p></Reveal>
          <Reveal className="booth" delay={100}>
            <div className="booth__top"><span>✦ ♡</span><strong>GRADUATION LETTER</strong><img src={ipbLogo} alt="IPB University"/></div>
            <div className="camera-stage">
              {!cameraOpen ? <div className="camera-placeholder"><Icon name="camera" size={40}/><p>Ready for your graduation glow?</p><button className="button button--maroon" onClick={startCamera}>Start the camera</button>{cameraError && <p className="camera-error" role="alert">{cameraError}</p>}</div> : <><video ref={videoRef} autoPlay playsInline muted/>{!cameraReady && <div className="camera-loading"><span/><p>Preparing your 1.0× camera…</p></div>}<div className={`camera-flash ${flash ? 'is-flashing' : ''}`}/>{countdown && <div className="countdown">{countdown}</div>}<span className="camera-sticker">1.0×<br/>GRAD MODE</span></>}
            </div>
            <div className="shot-dots" aria-label={`${shots.length} of 3 photos taken`}>{[0, 1, 2].map(index => <span className={shots[index] ? 'is-filled' : ''} key={index}>{shots[index] ? '✓' : index + 1}</span>)}</div>
            {cameraOpen && shots.length < 3 && <button className="shutter" onClick={takePhoto} disabled={!cameraReady || countdown !== null} aria-label="Take photo"><span/></button>}
            {shots.length === 3 && <div className="booth__actions"><button className="button button--maroon" onClick={downloadStrip}><Icon name="download" size={18}/> Download photo strip</button><button className="text-button" onClick={() => setShots([])}><Icon name="refresh" size={16}/> Take them again</button></div>}
            <p className="booth__caption">smile · sparkle · celebrate</p>
          </Reveal>
          {shots.length > 0 && <div className="strip-preview"><img className="strip-logo" src={ipbLogo} alt="IPB University"/><span className="strip-title"><strong>Graduation Day</strong><small>SV IPB Angkatan 60</small></span><img className="strip-panda strip-panda--top" src={pandaPeek} alt=""/>{shots.map((shot, index) => <img className="strip-photo" src={shot} alt={`Graduation photobooth shot ${index + 1}`} key={shot}/>)}{Array.from({ length: 3 - shots.length }, (_, index) => <div className="strip-empty" key={index}><span>♡</span></div>)}<img className="strip-panda strip-panda--bottom" src={pandaWalk} alt=""/><img className="strip-panda strip-panda--celebrate" src={pandaCelebrate} alt=""/><div className="strip-footer">IPB University</div></div>}
          <Reveal className="photobooth-note" delay={160}><span>♡</span><p>I’d be so happy if you use it.</p><small>Keep this little memory with you.</small></Reveal>
        </section>

        <footer className="finale section-maroon snap-section">
          <div className="finale__stars">✦　·　✦</div>
          <Reveal><p className="eyebrow">AND ALWAYS REMEMBER</p><h2>The world is<br/><em>waiting for you.</em></h2><p className="finale__copy">Congratulations on your graduation, Amara.<br/>This is only the beginning.</p><div className="signature"><span>with all the proudest cheers,</span><strong>Rian Yuliawan</strong><small>“Engineer Boy”</small></div></Reveal>
          <div className="finale__panda"><img src={pandaCelebrate} alt="A happy panda celebrating graduation"/></div>
          <p className="copyright">MADE WITH LOVE & LOTS OF MAROON · 2026</p>
        </footer>
      </>}
    </main>
  )
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
}

function setFittedCanvasFont(context, text, { maxWidth, maxSize, minSize, style = 'normal', weight = 400, family = 'sans-serif' }) {
  let size = maxSize
  context.font = `${style} ${weight} ${size}px ${family}`
  while (size > minSize && context.measureText(text).width > maxWidth) {
    size -= 1
    context.font = `${style} ${weight} ${size}px ${family}`
  }
}

function drawTrianglePattern(context, width, height) {
  context.fillStyle = '#ead9ca'
  context.fillRect(0, 0, width, height)
  context.fillStyle = 'rgba(111, 24, 49, .07)'
  for (let y = 0; y < height; y += 34) {
    for (let x = -17; x < width; x += 34) {
      const offset = (y / 34) % 2 ? 17 : 0
      context.beginPath()
      context.moveTo(x + offset, y + 22)
      context.lineTo(x + offset + 17, y + 22)
      context.lineTo(x + offset + 8.5, y + 11)
      context.closePath()
      context.fill()
    }
  }
}

function drawCoverImage(context, image, x, y, width, height, radius) {
  const targetRatio = width / height
  const imageRatio = image.width / image.height
  let sourceWidth = image.width
  let sourceHeight = image.height
  let sourceX = 0
  let sourceY = 0
  if (imageRatio > targetRatio) {
    sourceWidth = image.height * targetRatio
    sourceX = (image.width - sourceWidth) / 2
  } else {
    sourceHeight = image.width / targetRatio
    sourceY = (image.height - sourceHeight) / 2
  }
  context.save()
  roundRect(context, x, y, width, height, radius)
  context.clip()
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
  context.restore()
}

function drawPhotoBlend(context, x, y, width, height, radius) {
  context.save()
  roundRect(context, x, y, width, height, radius)
  context.clip()
  const top = context.createLinearGradient(0, y, 0, y + 82)
  top.addColorStop(0, 'rgba(92, 33, 52, .36)')
  top.addColorStop(1, 'rgba(92, 33, 52, 0)')
  context.fillStyle = top
  context.fillRect(x, y, width, 82)
  const bottom = context.createLinearGradient(0, y + height, 0, y + height - 82)
  bottom.addColorStop(0, 'rgba(92, 33, 52, .34)')
  bottom.addColorStop(1, 'rgba(92, 33, 52, 0)')
  context.fillStyle = bottom
  context.fillRect(x, y + height - 82, width, 82)
  const left = context.createLinearGradient(x, 0, x + 58, 0)
  left.addColorStop(0, 'rgba(92, 33, 52, .22)')
  left.addColorStop(1, 'rgba(92, 33, 52, 0)')
  context.fillStyle = left
  context.fillRect(x, y, 58, height)
  const right = context.createLinearGradient(x + width, 0, x + width - 58, 0)
  right.addColorStop(0, 'rgba(92, 33, 52, .22)')
  right.addColorStop(1, 'rgba(92, 33, 52, 0)')
  context.fillStyle = right
  context.fillRect(x + width - 58, y, 58, height)
  context.restore()
}

function drawImageWithShadow(context, image, x, y, width, height, blur) {
  context.save()
  context.shadowColor = 'rgba(62, 11, 28, .28)'
  context.shadowBlur = blur
  context.shadowOffsetY = 9
  context.drawImage(image, x, y, width, height)
  context.restore()
}

function loadImage(source) {
  return new Promise(resolve => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.src = source
  })
}

export default App

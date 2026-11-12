import { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminAccessContext } from '../auth/adminAccessContext'
import { useAuth } from '../auth/useAuth'
import {
  createGooglePhotosDraft,
  createGooglePhotosPickerSession,
  deleteGooglePhotosDraft,
  deleteGooglePhotosPickerSession,
  disconnectGooglePhotos,
  getGooglePhotosAuthorizationUrl,
  getGooglePhotosConnection,
  importGooglePhotosItem,
  listGooglePhotosPickerItems,
  pollGooglePhotosPickerSession,
} from '../services/googlePhotos'
import { deleteUploadedCreation, uploadSourceImage } from '../services/mediaUpload'
import './PhotoWorkflow.css'

const samplePhotos = [
  {
    id: 'warm-room',
    name: 'Warm room',
    alt: 'A warm, contemporary living room',
    src: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=1080',
  },
  {
    id: 'quiet-stairs',
    name: 'Quiet staircase',
    alt: 'A bright staircase with clean lines',
    src: 'https://images.unsplash.com/photo-1601993957728-1e56ab70c5a8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=1080',
  },
  {
    id: 'studio-flowers',
    name: 'Studio flowers',
    alt: 'Flowers arranged in an artist studio',
    src: 'https://images.unsplash.com/photo-1717620380652-1cba237af61a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=1080',
  },
  {
    id: 'reading-hour',
    name: 'Reading hour',
    alt: 'A calm reading corner',
    src: 'https://images.unsplash.com/photo-1661954747645-94bfcae82215?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=1080',
  },
]

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function googleDurationMs(value, fallback) {
  const seconds = Number.parseFloat(String(value || ''))
  return Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : fallback
}

const steps = [
  { number: 1, label: 'Choose a photo' },
  { number: 2, label: 'Describe your idea' },
  { number: 3, label: 'Review & save' },
]

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  if (name === 'upload') {
    return <svg {...common}><path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16" /></svg>
  }
  if (name === 'mic') {
    return <svg {...common}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4m-3 0h6" /></svg>
  }
  if (name === 'arrow') {
    return <svg {...common}><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
  }
  if (name === 'photo') {
    return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></svg>
  }
  if (name === 'spark') {
    return <svg {...common}><path d="m12 2 1.8 7.2L21 12l-7.2 2.8L12 22l-1.8-7.2L3 12l7.2-2.8L12 2Z" /></svg>
  }
  if (name === 'sun') {
    return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
  }
  return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
}

function PhotoWorkflow() {
  const { user, signOut } = useAuth()
  const { isAdmin } = useContext(AdminAccessContext)
  const [oauthResult] = useState(() =>
    new URLSearchParams(window.location.search).get('googlePhotos'),
  )
  const [step, setStep] = useState(1)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [showSamples, setShowSamples] = useState(false)
  const [photoError, setPhotoError] = useState(() => {
    if (oauthResult === 'denied') {
      return 'Google Photos connection was cancelled. You can connect when you are ready.'
    }
    if (oauthResult === 'error') return 'Google Photos could not connect. Please try again.'
    return ''
  })
  const [prompt, setPrompt] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [audioName, setAudioName] = useState('')
  const [audioError, setAudioError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isRequestingMic, setIsRequestingMic] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [isDark, setIsDark] = useState(false)
  const [notice, setNotice] = useState(() =>
    oauthResult === 'connected'
      ? 'Google Photos is connected. Choose a photo to import.'
      : '',
  )
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [googlePhotosConnected, setGooglePhotosConnected] = useState(
    oauthResult === 'connected',
  )
  const [googlePhotosItems, setGooglePhotosItems] = useState([])
  const [isPickingGooglePhotos, setIsPickingGooglePhotos] = useState(false)
  const [isImportingGooglePhoto, setIsImportingGooglePhoto] = useState(false)
  const photoInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const photoUrlRef = useRef('')
  const audioUrlRef = useRef('')
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const recordingSecondsRef = useRef(0)
  const mountedRef = useRef(false)
  const pickerCancelledRef = useRef(false)
  const pickerWindowRef = useRef(null)
  const pickerStateRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    if (oauthResult) {
      window.history.replaceState({}, '', window.location.pathname)
    }
    return () => {
      mountedRef.current = false
      pickerCancelledRef.current = true
      window.clearInterval(timerRef.current)
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    }
  }, [oauthResult])

  async function clearGooglePhotosSelection() {
    const pending = pickerStateRef.current
    pickerCancelledRef.current = true
    pickerWindowRef.current?.close()
    pickerWindowRef.current = null
    pickerStateRef.current = null
    setGooglePhotosItems([])
    setIsPickingGooglePhotos(false)
    if (!pending) return

    let cleanupError
    if (pending.sessionId) {
      try {
        await deleteGooglePhotosPickerSession(pending.sessionId, user)
      } catch (error) {
        cleanupError = error
      }
    }
    if (pending.creationId) {
      try {
        await deleteGooglePhotosDraft(pending.creationId, user)
      } catch (error) {
        cleanupError ||= error
      }
    }
    if (cleanupError) throw cleanupError
  }

  async function cancelGooglePhotosSelection() {
    try {
      await clearGooglePhotosSelection()
      setPhotoError('')
      setNotice('Google Photos selection cancelled.')
    } catch (error) {
      setPhotoError(error.message)
    }
  }

  async function chooseGooglePhotos() {
    if (!user) {
      setPhotoError('Sign in before connecting Google Photos.')
      return
    }
    if (isUploadingPhoto || isPickingGooglePhotos || isImportingGooglePhoto) return

    const pickerWindow = window.open('about:blank', '_blank')
    if (!pickerWindow) {
      setPhotoError('Allow pop-ups to open Google Photos, then try again.')
      return
    }
    pickerWindowRef.current = pickerWindow
    setIsUploadingPhoto(true)
    setPhotoError('')
    setNotice('')
    try {
      const connection = await getGooglePhotosConnection(user)
      setGooglePhotosConnected(connection.connected)
      if (!connection.connected) {
        pickerWindow.close()
        pickerWindowRef.current = null
        const { authorizationUrl } = await getGooglePhotosAuthorizationUrl(user)
        window.location.assign(authorizationUrl)
        return
      }
      if (selectedPhoto?.creationId) {
        await deleteUploadedCreation(selectedPhoto.creationId, user)
      }
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
      photoUrlRef.current = ''
      setSelectedPhoto(null)
      const creation = await createGooglePhotosDraft(user)
      pickerStateRef.current = { creationId: creation.id, sessionId: null }
      const session = await createGooglePhotosPickerSession(creation.id, user)
      pickerStateRef.current = { creationId: creation.id, sessionId: session.sessionId }
      pickerCancelledRef.current = false
      pickerWindow.opener = null
      pickerWindow.location.assign(session.pickerUri)
      setIsPickingGooglePhotos(true)
      setNotice('Choose photos in the Google Photos tab. We will check for your selection here.')
      setIsUploadingPhoto(false)

      const recommendedInterval = googleDurationMs(
        session.pollingConfig?.pollInterval,
        3000,
      )
      const interval = recommendedInterval >= 1000 ? recommendedInterval : 3000
      const timeout = googleDurationMs(session.pollingConfig?.timeoutIn, 300000)
      const deadline = Date.now() + timeout
      while (!pickerCancelledRef.current && Date.now() < deadline) {
        await new Promise((resolve) => window.setTimeout(resolve, interval))
        if (pickerCancelledRef.current) return
        const status = await pollGooglePhotosPickerSession(session.sessionId, user)
        if (pickerCancelledRef.current) return
        if (status.mediaItemsSet) {
          const { mediaItems } = await listGooglePhotosPickerItems(session.sessionId, user)
          if (pickerCancelledRef.current) return
          if (!mediaItems.length) {
            throw new Error('No supported photos were selected. Choose a JPEG, PNG, or WebP photo and retry.')
          }
          pickerWindow.close()
          pickerWindowRef.current = null
          setGooglePhotosItems(mediaItems)
          setIsPickingGooglePhotos(false)
          setNotice('Choose one selected photo to import into your private Pinboard draft.')
          return
        }
      }
      if (!pickerCancelledRef.current) {
        throw new Error('The Google Photos selection timed out. Start a new selection and try again.')
      }
    } catch (error) {
      pickerWindowRef.current?.close()
      pickerWindowRef.current = null
      const pending = pickerStateRef.current
      pickerStateRef.current = null
      setGooglePhotosItems([])
      setIsPickingGooglePhotos(false)
      let cleanupFailed = false
      if (pending?.sessionId) {
        try {
          await deleteGooglePhotosPickerSession(pending.sessionId, user)
        } catch {
          cleanupFailed = true
        }
      }
      if (pending?.creationId) {
        try {
          await deleteGooglePhotosDraft(pending.creationId, user)
        } catch {
          cleanupFailed = true
        }
      }
      setPhotoError(
        cleanupFailed
          ? `${error.message} The temporary selection could not be fully cleaned up; contact support.`
          : error.message,
      )
    } finally {
      if (mountedRef.current) setIsUploadingPhoto(false)
    }
  }

  async function importGooglePhoto(item) {
    const pending = pickerStateRef.current
    if (!pending?.creationId || !pending.sessionId) {
      setPhotoError('Start a new Google Photos selection and choose a photo.')
      return
    }
    setIsImportingGooglePhoto(true)
    setPhotoError('')
    try {
      const { media, downloadUrl } = await importGooglePhotosItem(
        pending.creationId,
        pending.sessionId,
        item.id,
        user,
      )
      setSelectedPhoto({
        id: item.id,
        name: item.filename,
        alt: `Selected Google Photos image: ${item.filename}`,
        src: downloadUrl,
        source: 'google-photos',
        creationId: pending.creationId,
        media,
      })
      pickerStateRef.current = null
      setGooglePhotosItems([])
      setNotice('Your selected photo was validated and imported to private storage.')
    } catch (error) {
      const creationId = pending.creationId
      pickerStateRef.current = null
      setGooglePhotosItems([])
      try {
        await deleteGooglePhotosDraft(creationId, user)
      } catch {
        setPhotoError(`${error.message} The temporary draft could not be cleaned up; contact support.`)
        return
      }
      setPhotoError(error.message)
    } finally {
      setIsImportingGooglePhoto(false)
    }
  }

  async function handleGooglePhotosDisconnect() {
    setIsUploadingPhoto(true)
    setPhotoError('')
    try {
      await disconnectGooglePhotos(user)
      setGooglePhotosConnected(false)
      setNotice('Google Photos has been disconnected.')
    } catch (error) {
      setPhotoError(error.message)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  async function chooseSample(photo) {
    if (pickerStateRef.current) {
      try {
        await clearGooglePhotosSelection()
      } catch (error) {
        setPhotoError(error.message)
        return
      }
    }
    if (selectedPhoto?.creationId) {
      setIsUploadingPhoto(true)
      try {
        await deleteUploadedCreation(selectedPhoto.creationId, user)
      } catch (error) {
        setPhotoError(error.message)
        setIsUploadingPhoto(false)
        return
      }
      setIsUploadingPhoto(false)
    }
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current)
      photoUrlRef.current = ''
    }
    setSelectedPhoto(photo)
    setShowSamples(true)
    setPhotoError('')
    setNotice('')
  }

  async function chooseLocalPhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    setPhotoError('')
    if (!file) return
    const supportedType = SUPPORTED_IMAGE_TYPES.has(file.type)
    const supportedExtension = /\.(jpe?g|png|webp)$/i.test(file.name)
    if (file.type ? !supportedType : !supportedExtension) {
      setPhotoError('Choose a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setPhotoError('That photo is larger than 10 MB. Choose a smaller file.')
      return
    }
    if (pickerStateRef.current) {
      try {
        await clearGooglePhotosSelection()
      } catch (error) {
        setPhotoError(error.message)
        return
      }
    }
    if (selectedPhoto?.creationId) {
      setIsUploadingPhoto(true)
      try {
        await deleteUploadedCreation(selectedPhoto.creationId, user)
      } catch (error) {
        setPhotoError(error.message)
        setIsUploadingPhoto(false)
        return
      }
      setIsUploadingPhoto(false)
    }
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
    const src = URL.createObjectURL(file)
    photoUrlRef.current = src
    setSelectedPhoto({
      id: 'upload-' + file.name,
      name: file.name,
      alt: 'Preview of ' + file.name,
      src,
      file,
      source: 'device',
    })
    setShowSamples(false)
    setNotice('')
  }

  function clearAudio() {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
    audioUrlRef.current = ''
    setAudioUrl('')
    setAudioName('')
  }

  function useAudioFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    setAudioError('')
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      setAudioError('Choose an audio file to add a voice note.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setAudioError('That audio file is larger than 20 MB. Choose a smaller file.')
      return
    }
    if (isRecording && recorderRef.current?.state !== 'inactive') {
      recorderRef.current.stop()
    }
    window.clearInterval(timerRef.current)
    setIsRecording(false)
    clearAudio()
    const url = URL.createObjectURL(file)
    audioUrlRef.current = url
    setAudioUrl(url)
    setAudioName(file.name)
  }

  async function toggleRecording() {
    setAudioError('')
    setNotice('')
    if (isRecording) {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop()
      }
      window.clearInterval(timerRef.current)
      setIsRecording(false)
      return
    }
    if (isRequestingMic) return
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setAudioError('Audio recording is not supported in this browser.')
      return
    }

    try {
      setIsRequestingMic(true)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      clearAudio()
      streamRef.current = stream
      chunksRef.current = []
      const supportedType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
        .find((type) => MediaRecorder.isTypeSupported?.(type))
      const recorder = supportedType
        ? new MediaRecorder(stream, { mimeType: supportedType })
        : new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        setAudioError('The recording could not be saved. Please try again.')
        setIsRecording(false)
        window.clearInterval(timerRef.current)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        if (mountedRef.current && blob.size) {
          const url = URL.createObjectURL(blob)
          if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current)
          audioUrlRef.current = url
          setAudioUrl(url)
          setAudioName('Voice note (' + formatTime(recordingSecondsRef.current) + ')')
        }
        stream.getTracks().forEach((track) => track.stop())
        if (streamRef.current === stream) streamRef.current = null
        if (mountedRef.current) setIsRecording(false)
      }
      recorder.start()
      recordingSecondsRef.current = 0
      setRecordingSeconds(0)
      setIsRecording(true)
      timerRef.current = window.setInterval(() => {
        recordingSecondsRef.current += 1
        setRecordingSeconds(recordingSecondsRef.current)
      }, 1000)
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (mountedRef.current) {
        setIsRecording(false)
        setAudioError('Microphone access was not granted. You can still use the text prompt.')
      }
    } finally {
      if (mountedRef.current) setIsRequestingMic(false)
    }
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainder = String(seconds % 60).padStart(2, '0')
    return String(minutes).padStart(2, '0') + ':' + remainder
  }

  function moveToStep(nextStep) {
    if (nextStep < 1 || nextStep > 3) return
    if (nextStep > 1 && !selectedPhoto) {
      setPhotoError('Choose a photo before continuing.')
      return
    }
    if ((isRecording || isRequestingMic) && nextStep !== 2) {
      setAudioError('Stop the recording before continuing.')
      return
    }
    setNotice('')
    setStep(nextStep)
  }

  async function continueWorkflow() {
    if (step === 1 && selectedPhoto?.source === 'device' && !selectedPhoto.creationId) {
      if (!user) {
        setPhotoError('Sign in before uploading a photo to your account.')
        return
      }

      setIsUploadingPhoto(true)
      setPhotoError('')
      setNotice('')
      try {
        const { creationId, media } = await uploadSourceImage(
          selectedPhoto.file,
          user,
        )
        setSelectedPhoto((current) =>
          current ? { ...current, creationId, media } : current,
        )
        moveToStep(2)
      } catch (error) {
        setPhotoError(error.message)
      } finally {
        setIsUploadingPhoto(false)
      }
      return
    }
    moveToStep(step + 1)
  }

  async function removeSelectedPhoto() {
    if (!selectedPhoto) return
    if (selectedPhoto.creationId) {
      setIsUploadingPhoto(true)
      setPhotoError('')
      try {
        await deleteUploadedCreation(selectedPhoto.creationId, user)
      } catch (error) {
        setPhotoError(error.message)
        setIsUploadingPhoto(false)
        return
      }
      setIsUploadingPhoto(false)
    }
    if (selectedIsLocal && photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current)
      photoUrlRef.current = ''
    }
    setSelectedPhoto(null)
    setPhotoError('')
  }

  async function downloadPhoto() {
    if (!selectedPhoto) return
    setNotice('')
    const anchor = document.createElement('a')
    anchor.download = 'pinboard-studio-' + selectedPhoto.name.replace(/[^a-z0-9._-]+/gi, '-')
    anchor.rel = 'noreferrer'

    try {
      const response = await fetch(selectedPhoto.src)
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      anchor.href = downloadUrl
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
    } catch {
      anchor.href = selectedPhoto.src
      anchor.target = '_blank'
      anchor.click()
      setNotice('The photo opened in a new tab because this source does not allow direct downloads.')
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      setNotice('We could not sign you out. Please try again.')
    }
  }

  const selectedIsLocal = selectedPhoto?.source === 'device'

  return (
    <main className={'workflow-shell' + (isDark ? ' workflow-dark' : '')}>
      <div className="workflow-decoration" aria-hidden="true">
        <span className="workflow-orb workflow-orb-coral" />
        <span className="workflow-orb workflow-orb-blue" />
        <span className="workflow-orb workflow-orb-gold" />
        <span className="workflow-loop" />
      </div>

      <header className="workflow-header">
        <Link className="workflow-brand" to="/" aria-label="Pinboard Studio home">
          <span className="workflow-brand-mark">p</span>
          <span>pinboard <small>studio</small></span>
        </Link>

        <nav className="workflow-nav" aria-label="Main navigation">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          {isAdmin && <Link to="/customers">Customers</Link>}
        </nav>

        <div className="workflow-account">
          <button
            className="workflow-theme-button"
            type="button"
            onClick={() => setIsDark((value) => !value)}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <Icon name="sun" size={17} />
          </button>
          {user ? (
            <>
              <Link className="workflow-account-link" to="/account">
                {user.displayName || 'Account'}
              </Link>
              <button className="workflow-text-button" type="button" onClick={handleSignOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link className="workflow-text-button" to="/login">Sign in</Link>
              <Link className="workflow-join-button" to="/register">Create account</Link>
            </>
          )}
        </div>
      </header>

      <section className="workflow-content">
        <div className="workflow-intro">
          <p className="workflow-eyebrow"><span /> A creative space for your next idea</p>
          <h1>Make room to <em>imagine.</em></h1>
          <p>Choose a photo, share the feeling you want, and review your work in one calm space.</p>
        </div>
        {notice && step !== 3 && <p className="workflow-notice workflow-global-notice" role="status">{notice}</p>}

        <nav className="workflow-progress" aria-label="Editing steps">
          {steps.map((item) => {
            const isCurrent = item.number === step
            const isComplete = item.number < step
            return (
              <button
                className={'workflow-step' + (isCurrent ? ' is-current' : '') + (isComplete ? ' is-complete' : '')}
                key={item.number}
                type="button"
                onClick={() => item.number < step && moveToStep(item.number)}
                disabled={item.number >= step}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span className="workflow-step-number">{isComplete ? '✓' : '0' + item.number}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <section className="workflow-card" aria-live="polite">
          {step === 1 && (
            <div className="workflow-step-content">
              <div className="workflow-section-heading">
                <div>
                  <p className="workflow-kicker">STEP 01 · START WITH A PHOTO</p>
                  <h2>Choose the image you want to shape.</h2>
                  <p className="workflow-muted">Use a photo from your device or explore the sample library.</p>
                </div>
                <span className="workflow-required">PHOTO REQUIRED</span>
              </div>

              <div className="photo-choice-grid">
                <button
                  className="photo-choice"
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto || isPickingGooglePhotos || isImportingGooglePhoto}
                >
                  <span className="photo-choice-icon"><Icon name="upload" size={22} /></span>
                  <strong>Upload from your device</strong>
                  <small>JPG, PNG, or WebP · up to 10 MB</small>
                  <span className="photo-choice-action">Choose a file <Icon name="arrow" size={15} /></span>
                </button>
                <button
                  className="photo-choice google-photos-choice"
                  type="button"
                  onClick={() => void chooseGooglePhotos()}
                  disabled={isUploadingPhoto || isPickingGooglePhotos || isImportingGooglePhoto}
                >
                  <span className="photo-choice-icon google-mark" aria-hidden="true">G</span>
                  <strong>{googlePhotosConnected ? 'Choose from Google Photos' : 'Connect Google Photos'}</strong>
                  <small>{isPickingGooglePhotos ? 'Waiting for your selection…' : 'Choose only the photos you want to import.'}</small>
                  <span className="photo-choice-action">{isPickingGooglePhotos ? 'Picker is open' : 'Open Google Photos Picker'} <Icon name="arrow" size={15} /></span>
                </button>
                <button
                  className={'photo-choice sample-choice' + (showSamples ? ' is-active' : '')}
                  type="button"
                  onClick={() => setShowSamples((value) => !value)}
                  disabled={isUploadingPhoto || isPickingGooglePhotos || isImportingGooglePhoto}
                >
                  <span className="photo-choice-icon"><Icon name="photo" size={22} /></span>
                  <strong>Explore sample photos</strong>
                  <small>Preview demo images without connecting an account.</small>
                  <span className="photo-choice-action">{showSamples ? 'Hide sample library' : 'Preview sample library'} <Icon name="arrow" size={15} /></span>
                </button>
                <input
                  ref={photoInputRef}
                  className="visually-hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={chooseLocalPhoto}
                  aria-label="Choose a photo from your device"
                />
              </div>

              <p className="google-photos-disclosure">
                Google Photos access is optional and limited to the photos you select. Imported copies are validated and stored privately in your Pinboard draft. See the <Link to="/privacy">Privacy Policy</Link>.
              </p>
              {googlePhotosConnected && (
                <button
                  className="workflow-link-button"
                  type="button"
                  onClick={() => void handleGooglePhotosDisconnect()}
                  disabled={isUploadingPhoto || isPickingGooglePhotos || isImportingGooglePhoto}
                >
                  Disconnect Google Photos
                </button>
              )}
              {isPickingGooglePhotos && (
                <div className="google-photos-status" role="status">
                  <span>Waiting for you to finish in the Google Photos tab.</span>
                  <button className="workflow-link-button" type="button" onClick={() => void cancelGooglePhotosSelection()}>
                    Cancel selection
                  </button>
                </div>
              )}
              {googlePhotosItems.length > 0 && (
                <div className="google-photos-items" aria-label="Selected Google Photos images">
                  <div className="sample-library-heading">
                    <div>
                      <strong>Select one photo to import</strong>
                      <span>Only items selected in this Picker session are available.</span>
                    </div>
                    <button className="workflow-link-button" type="button" onClick={() => void cancelGooglePhotosSelection()} disabled={isImportingGooglePhoto}>
                      Cancel
                    </button>
                  </div>
                  {googlePhotosItems.map((item) => (
                    <button
                      className="google-photos-item"
                      key={item.id}
                      type="button"
                      onClick={() => void importGooglePhoto(item)}
                      disabled={isImportingGooglePhoto}
                    >
                      <span><Icon name="photo" size={18} /></span>
                      <span>
                        <strong>{item.filename}</strong>
                        <small>{item.width && item.height ? `${item.width} × ${item.height} · ` : ''}{item.mimeType}</small>
                      </span>
                      <span>{isImportingGooglePhoto ? 'Importing…' : 'Import'}</span>
                    </button>
                  ))}
                </div>
              )}

              {showSamples && (
                <div className="sample-library">
                  <div className="sample-library-heading">
                    <div>
                      <strong>Sample photo library</strong>
                      <span>These demo images do not come from a connected Google account.</span>
                    </div>
                    <span className="sample-badge">PREVIEW</span>
                  </div>
                  <div className="sample-photo-grid">
                    {samplePhotos.map((photo) => (
                      <button
                        className={'sample-photo' + (selectedPhoto?.id === photo.id ? ' is-selected' : '')}
                        type="button"
                        key={photo.id}
                        onClick={() => void chooseSample({ ...photo, source: 'sample' })}
                        disabled={isUploadingPhoto}
                        aria-pressed={selectedPhoto?.id === photo.id}
                      >
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                        <span>{photo.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="photo-preview-row">
                <div className="photo-preview-frame">
                  {selectedPhoto ? (
                    <img src={selectedPhoto.src} alt={selectedPhoto.alt} />
                  ) : (
                    <div className="photo-empty">
                      <span><Icon name="photo" size={28} /></span>
                      <strong>Your photo will appear here</strong>
                      <small>Start with an image you love.</small>
                    </div>
                  )}
                </div>
                <div className="photo-preview-details">
                  <p className="workflow-kicker">YOUR STARTING POINT</p>
                  <h3>{selectedPhoto ? selectedPhoto.name : 'Nothing selected yet'}</h3>
                  <p>{selectedPhoto ? (selectedPhoto.media ? 'Stored privately with your account.' : selectedIsLocal ? 'Selected from this device.' : 'Sample image for exploring the workflow.') : 'Choose a local photo, Google Photos image, or sample.'}</p>
                  {selectedPhoto && (
                    <button className="workflow-link-button" type="button" onClick={() => void removeSelectedPhoto()} disabled={isUploadingPhoto}>
                      {isUploadingPhoto ? 'Working…' : 'Remove photo'}
                    </button>
                  )}
                </div>
              </div>

              {photoError && <p className="workflow-error" role="alert">{photoError}</p>}
            </div>
          )}

          {step === 2 && selectedPhoto && (
            <div className="workflow-step-content">
              <div className="workflow-section-heading">
                <div>
                  <p className="workflow-kicker">STEP 02 · ADD YOUR DIRECTION</p>
                  <h2>What would you like this photo to feel like?</h2>
                  <p className="workflow-muted">Write a short direction or record a voice note to keep with this draft.</p>
                </div>
                <button className="workflow-back-link" type="button" onClick={() => moveToStep(1)}>Change photo</button>
              </div>

              <div className="direction-grid">
                <div className="direction-main">
                  <label className="workflow-label" htmlFor="photo-prompt">Your creative direction <span>OPTIONAL</span></label>
                  <textarea
                    id="photo-prompt"
                    className="workflow-textarea"
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    maxLength={1000}
                    placeholder="For example: soften the afternoon light, keep the colors natural, and give it a quiet editorial feel..."
                    rows={6}
                  />
                  <div className="prompt-footer">
                    <span>Your words stay in this browser draft.</span>
                    <span>{prompt.length} / 1000</span>
                  </div>

                  <div className="audio-panel">
                    <div className="audio-panel-heading">
                      <span className="audio-icon"><Icon name="mic" size={20} /></span>
                      <div>
                        <strong>Add a voice note</strong>
                        <small>Record a note or choose an existing audio file.</small>
                      </div>
                    </div>
                    <div className="audio-controls">
                      <button
                        className={'record-button' + (isRecording ? ' is-recording' : '')}
                        type="button"
                        onClick={toggleRecording}
                        disabled={isRequestingMic}
                      >
                        <span className="record-dot" />
                        {isRequestingMic ? 'Waiting for microphone…' : isRecording ? 'Stop recording' : 'Record voice note'}
                      </button>
                      <span className="recording-time">{formatTime(recordingSeconds)}</span>
                      <button className="workflow-secondary-button" type="button" disabled={isRequestingMic || isRecording} onClick={() => audioInputRef.current?.click()}>
                        Upload audio
                      </button>
                      <input
                        ref={audioInputRef}
                        className="visually-hidden"
                        type="file"
                        accept="audio/*"
                        onChange={useAudioFile}
                        aria-label="Choose an audio file"
                      />
                    </div>
                    {isRecording && <p className="recording-status" role="status">Recording… select “Stop recording” when you are finished.</p>}
                    {audioError && <p className="workflow-error" role="alert">{audioError}</p>}
                    {audioUrl && (
                      <div className="audio-playback">
                        <div className="audio-file-name"><Icon name="check" size={15} /> {audioName || 'Voice note ready'}</div>
                        <audio controls src={audioUrl}>Your browser does not support audio playback.</audio>
                        <button className="workflow-link-button" type="button" onClick={clearAudio}>Remove audio</button>
                      </div>
                    )}
                  </div>
                </div>

                <aside className="direction-preview">
                  <div className="direction-photo"><img src={selectedPhoto.src} alt={selectedPhoto.alt} /></div>
                  <p className="workflow-kicker">PHOTO IN THIS DRAFT</p>
                  <strong>{selectedPhoto.name}</strong>
                  <p>{selectedPhoto.source === 'device' ? 'Local image preview' : selectedPhoto.source === 'google-photos' ? 'Imported from your selected Google Photos items' : 'Sample image preview'}</p>
                  <div className="draft-note"><Icon name="spark" size={16} /> Your photo and voice note are not sent to a processing service by this screen.</div>
                </aside>
              </div>
            </div>
          )}

          {step === 3 && selectedPhoto && (
            <div className="workflow-step-content">
              <div className="workflow-section-heading">
                <div>
                  <p className="workflow-kicker">STEP 03 · REVIEW YOUR DRAFT</p>
                  <h2>A clear place to review what you chose.</h2>
                  <p className="workflow-muted">This preview is local. An image-editing service and Google Photos saving are not connected here.</p>
                </div>
                <button className="workflow-back-link" type="button" onClick={() => moveToStep(2)}>Edit direction</button>
              </div>

              <div className="review-grid">
                <div className="review-photo-card">
                  <div className="review-image original-image"><img src={selectedPhoto.src} alt={'Original: ' + selectedPhoto.alt} /></div>
                  <span className="review-image-label">ORIGINAL</span>
                </div>
                <div className="review-photo-card review-photo-styled">
                  <div className="review-image styled-image"><img src={selectedPhoto.src} alt={'Style preview: ' + selectedPhoto.alt} /></div>
                  <span className="review-image-label">STYLE PREVIEW</span>
                </div>
              </div>

              <div className="review-summary">
                <div>
                  <p className="workflow-kicker">YOUR DIRECTION</p>
                  <p className="review-prompt">{prompt.trim() || 'No written direction added.'}</p>
                </div>
                <div>
                  <p className="workflow-kicker">VOICE NOTE</p>
                  <p className="review-prompt">{audioName || 'No audio added.'}</p>
                  {audioUrl && <audio className="review-audio" controls src={audioUrl}>Your browser does not support audio playback.</audio>}
                </div>
              </div>

              <div className="review-actions">
                <button className="workflow-secondary-button" type="button" onClick={() => {
                  setNotice('Google Photos saving is not connected in this frontend yet.')
                }}>
                  Save to Google Photos
                </button>
                <button className="workflow-primary-button" type="button" onClick={downloadPhoto}>
                  Download selected photo <Icon name="upload" size={17} />
                </button>
              </div>
              {notice && <p className="workflow-notice" role="status">{notice}</p>}
            </div>
          )}

          <div className="workflow-card-footer">
            <span className="draft-status"><i /> Draft stays in this browser</span>
            <div className="workflow-footer-actions">
              {step > 1 && (
                <button className="workflow-secondary-button" type="button" onClick={() => moveToStep(step - 1)}>Back</button>
              )}
              {step < 3 ? (
                <button
                  className="workflow-primary-button"
                  type="button"
                  disabled={isUploadingPhoto || (step === 1 && !selectedPhoto)}
                  onClick={() => void continueWorkflow()}
                >
                  {isUploadingPhoto ? 'Uploading…' : 'Continue'} {!isUploadingPhoto && <Icon name="arrow" size={17} />}
                </button>
              ) : (
                <button className="workflow-secondary-button" type="button" onClick={() => {
                  if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current)
                  photoUrlRef.current = ''
                  clearAudio()
                  setStep(1)
                  setSelectedPhoto(null)
                  setShowSamples(false)
                  setPrompt('')
                  setPhotoError('')
                  setAudioError('')
                  setNotice('')
                }}>
                  Start a new draft
                </button>
              )}
            </div>
          </div>
        </section>

        <p className="workflow-footnote">
          Pinboard Studio · A student prototype. <Link to="/about">Learn about the project</Link>
        </p>
      </section>

      <footer className="workflow-footer">
        <span>A little space for big ideas.</span>
        <nav aria-label="Footer navigation">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          {isAdmin && <Link to="/customers">Customers</Link>}
        </nav>
        <span>© {new Date().getFullYear()} Pinboard Studio</span>
      </footer>
    </main>
  )
}

export default PhotoWorkflow

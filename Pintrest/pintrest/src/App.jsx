import { useEffect, useRef, useState } from "react"
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom"
import ArtworkForm from './components/ArtworkForm'
import SiteLayout from './components/SiteLayout'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import LoginPage from './pages/LoginPage'
import CustomersPage from './pages/CustomersPage'
import AccountPage from './pages/AccountPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'
import { ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute'

const boards = [
  { id: "warm-interiors", name: "Warm interiors", count: 48 },
  { id: "studio-notes", name: "Studio notes", count: 31 },
  { id: "color-stories", name: "Color stories", count: 24 },
]

const pins = [
  {
    id: "sofa",
    boardId: "warm-interiors",
    title: "Leather and linen",
    size: "tall",
    image:
      "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "stairs",
    boardId: "warm-interiors",
    title: "Quiet staircase",
    size: "medium",
    image:
      "https://images.unsplash.com/photo-1601993957728-1e56ab70c5a8?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "chair",
    boardId: "warm-interiors",
    title: "Natural textures",
    size: "short",
    image:
      "https://images.unsplash.com/photo-1606425288528-4cebbfc69de7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "breakfast-bed",
    boardId: "warm-interiors",
    title: "Slow Sunday",
    size: "tall",
    image:
      "https://images.unsplash.com/photo-1738968673396-e363fa65e3b9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "fruit-room",
    boardId: "warm-interiors",
    title: "Afternoon color",
    size: "medium",
    image:
      "https://images.unsplash.com/photo-1683475962510-cd4e8de64fac?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "soft-room",
    boardId: "warm-interiors",
    title: "Collected living",
    size: "short",
    image:
      "https://images.unsplash.com/photo-1666689465000-9cd6033e80cf?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "quiet-bed",
    boardId: "warm-interiors",
    title: "A quiet corner",
    size: "tall",
    image:
      "https://images.unsplash.com/photo-1666204576220-38aeb1c0041c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "editorial",
    boardId: "studio-notes",
    title: "Editorial study",
    size: "tall",
    image:
      "https://images.unsplash.com/photo-1549298222-1c31e8915347?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "black-dress",
    boardId: "studio-notes",
    title: "Form and silhouette",
    size: "tall",
    image:
      "https://images.unsplash.com/photo-1627395410076-15da6119fff9?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "gallery-swing",
    boardId: "studio-notes",
    title: "Living with art",
    size: "medium",
    image:
      "https://images.unsplash.com/photo-1721068685423-7b2512ef2e28?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "flower-tools",
    boardId: "studio-notes",
    title: "Floral workshop",
    size: "short",
    image:
      "https://images.unsplash.com/photo-1717620380652-1cba237af61a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "tea-book",
    boardId: "studio-notes",
    title: "Reading ritual",
    size: "medium",
    image:
      "https://images.unsplash.com/photo-1661954747645-94bfcae82215?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "pink-glasses",
    boardId: "studio-notes",
    title: "Rose study",
    size: "short",
    image:
      "https://images.unsplash.com/photo-1717620380545-198cee84d884?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "sweet-peas",
    boardId: "color-stories",
    title: "Lilac season",
    size: "tall",
    image:
      "https://images.unsplash.com/photo-1717620377517-855df557f1e2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "pink-building",
    boardId: "color-stories",
    title: "Botanical facade",
    size: "tall",
    image:
      "https://images.unsplash.com/photo-1782545647769-ca5393b82174?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "window-planter",
    boardId: "color-stories",
    title: "Green window",
    size: "medium",
    image:
      "https://images.unsplash.com/photo-1673152490130-fe3cc6dfc636?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "city-flowers",
    boardId: "color-stories",
    title: "Flowers above the city",
    size: "short",
    image:
      "https://images.unsplash.com/photo-1743683339786-7f7e2bf0f26e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
  {
    id: "autumn-building",
    boardId: "color-stories",
    title: "Concrete and autumn",
    size: "tall",
    image:
      "https://images.unsplash.com/photo-1785665358873-4dd4fa50e86a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=86&w=900",
  },
]

const mockupSuggestions = [
  {
    id: "sunset",
    label: "Sunset editorial",
    detail: "Warm light · soft grain",
  },
  {
    id: "color-pop",
    label: "Color pop",
    detail: "Vivid color · crisp detail",
  },
  {
    id: "quiet",
    label: "Quiet minimal",
    detail: "Muted tone · clean crop",
  },
]

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 00-3.65 19.3c-.09-1.58-.02-3.47.4-5.27l1.28-5.4s-.32-.65-.32-1.61c0-1.51.87-2.64 1.96-2.64.93 0 1.37.7 1.37 1.53 0 .93-.59 2.33-.9 3.62-.26 1.08.54 1.96 1.61 1.96 1.94 0 3.42-2.04 3.42-5 0-2.61-1.88-4.44-4.56-4.44-3.11 0-4.93 2.33-4.93 4.74 0 .94.36 1.95.81 2.5.09.11.1.2.08.31l-.3 1.23c-.05.2-.16.24-.37.15-1.38-.64-2.24-2.65-2.24-4.27 0-3.47 2.52-6.66 7.27-6.66 3.82 0 6.79 2.72 6.79 6.36 0 3.79-2.39 6.85-5.71 6.85-1.11 0-2.16-.58-2.52-1.27l-.68 2.61c-.25.96-.92 2.16-1.37 2.89A10 10 0 1012 2z" />
    </svg>
  )
}

function MicrophoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M6.5 11.5a5.5 5.5 0 0011 0M12 17v4m-3 0h6" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l1.3 5.2L18 9l-4.7 1.8L12 16l-1.3-5.2L6 9l4.7-1.8L12 2zM5 15l.7 2.3L8 18l-2.3.7L5 21l-.7-2.3L2 18l2.3-.7L5 15z" />
    </svg>
  )
}

function StudioLandingPage() {
  const [prompt, setPrompt] = useState("")
  const [isDark, setIsDark] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState("")
  const [selectedPinId, setSelectedPinId] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isRequestingMic, setIsRequestingMic] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultReady, setResultReady] = useState(true)
  const [changesAccepted, setChangesAccepted] = useState(false)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [selectedMockup, setSelectedMockup] = useState("sunset")
  const [recordingUrl, setRecordingUrl] = useState("")
  const [recordingError, setRecordingError] = useState("")
  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const recordingChunksRef = useRef([])
  const isMountedRef = useRef(false)

  const visiblePins = pins.filter((pin) => pin.boardId === selectedBoard)
  const selectedPin = pins.find((pin) => pin.id === selectedPinId)
  const canStart = isConnected && Boolean(selectedBoard) && Boolean(selectedPin)

  const connectPinterest = () => {
    const authUrl = import.meta.env.VITE_PINTEREST_AUTH_URL
    if (authUrl) {
      window.location.assign(authUrl)
      return
    }
    setIsConnecting(true)
    window.setTimeout(() => {
      setIsConnecting(false)
      setIsConnected(true)
    }, 700)
  }

  const processImage = () => {
    if (!canStart || isProcessing) return
    setIsProcessing(true)
    setResultReady(false)
    setChangesAccepted(false)
    setPipelineStep(1)
    window.setTimeout(() => setPipelineStep(2), 500)
    window.setTimeout(() => setPipelineStep(3), 1000)
    window.setTimeout(() => setPipelineStep(4), 1500)
    window.setTimeout(() => {
      setPipelineStep(5)
      setIsProcessing(false)
      setResultReady(true)
    }, 1900)
  }

  const disconnect = () => {
    setIsConnected(false)
    setSelectedBoard("")
    setSelectedPinId("")
  }

  const toggleRecording = async () => {
    if (isRequestingMic) return
    if (isRecording) {
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== "inactive") recorder.stop()
      return
    }

    setRecordingError("")
    if (
      typeof MediaRecorder === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setRecordingError("Audio recording is not supported in this browser.")
      return
    }

    setIsRequestingMic(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      mediaStreamRef.current = stream
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find(
        (type) =>
          typeof MediaRecorder.isTypeSupported === "function" &&
          MediaRecorder.isTypeSupported(type),
      )
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      mediaRecorderRef.current = recorder
      recordingChunksRef.current = []
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        setRecordingError("The browser could not finish recording this note.")
        setIsRecording(false)
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }
      recorder.onstop = () => {
        const audioBlob = new Blob(recordingChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        })
        recordingChunksRef.current = []
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
        setIsRecording(false)

        if (audioBlob.size > 0) {
          const nextRecordingUrl = URL.createObjectURL(audioBlob)
          setRecordingUrl(nextRecordingUrl)
        } else {
          setRecordingError("No audio was captured. Try recording again.")
        }
      }

      recorder.start()
      setIsRecording(true)
    } catch (error) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
      if (isMountedRef.current) {
        setRecordingError(
          error?.name === "NotAllowedError" ||
            error?.name === "PermissionDeniedError"
            ? "Allow microphone access in your browser to record a note."
            : "Microphone access is unavailable. Check your device and try again.",
        )
      }
    } finally {
      if (isMountedRef.current) setIsRequestingMic(false)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== "inactive") {
        recorder.onstop = null
        recorder.stop()
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl)
    }
  }, [recordingUrl])

  return (
    <main className={`page-shell ${isDark ? "theme-dark" : ""}`}>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-navigation">
            <div className="brand" aria-label="Pinboard Studio">
              <span className="brand-mark">p</span>
              <span className="brand-name">pinboard</span>
              <span className="brand-studio">studio</span>
            </div>
            <Link className="about-nav-link" to="/about">
              About Us
            </Link>
            <Link className="about-nav-link" to="/contact">
              Contact
            </Link>
            <Link className="about-nav-link" to="/customers">
              Customers
            </Link>
          </div>
          <div className="credits-box" aria-label="Available credits">
            <span>Credits</span>
            <strong>12</strong>
          </div>
          <div className="header-actions">
            <button
              className="theme-button"
              type="button"
              onClick={() => setIsDark((current) => !current)}
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              <span className="theme-indicator" />
              {isDark ? "Light" : "Dark"}
            </button>
            <Link className="login-button" to="/login">
              Login
            </Link>
          </div>
        </div>
      </header>

      <div className="content-wrap">
        <section
          className="pinterest-source-card"
          aria-labelledby="pinterest-source-title"
        >
          <span className="art-index" aria-hidden="true">
            EDITION 01 / PINBOARD
          </span>
          <div className="workspace-heading source-heading">
            <div>
              <div className="eyebrow">
                <span>SELECT IMAGES</span>
              </div>
              <div
                className="page-title"
                id="pinterest-source-title"
                role="heading"
                aria-level={1}
              >
                edit any Pinterest board or image and update your{" "}
                <em>collection of boards.</em>
              </div>
            </div>
            <div className="required-note">* REQUIRED</div>
          </div>

          <div className="source-layout">
            <div className="source-controls">
              <label className="field-label">
                Pinterest image <span>*</span>
              </label>
              {!isConnected ? (
                <div className="pinterest-connect-panel">
                  <span className="pinterest-symbol">
                    <PinterestIcon />
                  </span>
                  <div>
                    <strong>Start with one of your Pins</strong>
                    <p>
                      Connect Pinterest to browse your boards and choose an
                      image.
                    </p>
                  </div>
                  <button
                    className="pinterest-button"
                    type="button"
                    onClick={connectPinterest}
                    disabled={isConnecting}
                  >
                    <PinterestIcon />
                    {isConnecting ? "Connecting..." : "Continue with Pinterest"}
                  </button>
                </div>
              ) : (
                <div className="pinterest-library">
                  <div className="connection-status">
                    <span />
                    Pinterest connected
                    <button type="button" onClick={disconnect}>
                      Disconnect
                    </button>
                  </div>
                  <label htmlFor="board-select">Choose a board</label>
                  <div className="select-wrap">
                    <select
                      id="board-select"
                      value={selectedBoard}
                      onChange={(event) => {
                        setSelectedBoard(event.target.value)
                        setSelectedPinId("")
                        setResultReady(false)
                      }}
                    >
                      <option value="">Select one of your boards</option>
                      {boards.map((board) => (
                        <option key={board.id} value={board.id}>
                          {board.name} · {board.count} Pins
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="source-gallery">
              {isConnected && selectedBoard ? (
                <div className="pin-picker">
                  <div className="pin-picker-heading">
                    <span>Choose a Pin</span>
                    <small>{visiblePins.length} IMAGES</small>
                  </div>
                  <div className="pin-grid">
                    {visiblePins.length ? (
                      visiblePins.map((pin) => (
                        <button
                          className={`pin-card pin-card-${pin.size} ${
                            selectedPinId === pin.id ? "is-selected" : ""
                          }`}
                          type="button"
                          key={pin.id}
                          onClick={() => {
                            setSelectedPinId(pin.id)
                            setResultReady(false)
                          }}
                          aria-pressed={selectedPinId === pin.id}
                        >
                          <img src={pin.image} alt={pin.title} />
                          <span>{pin.title}</span>
                          <i>✓</i>
                        </button>
                      ))
                    ) : (
                      <p className="empty-board">
                        This board has no available image Pins.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pin-preview-collage" aria-hidden="true">
                  {pins.slice(0, 6).map((pin, index) => (
                    <div
                      className={`preview-pin preview-pin-${index + 1}`}
                      key={pin.id}
                    >
                      <img src={pin.image} alt="" />
                    </div>
                  ))}
                  <div className="collage-caption">
                    <PinterestIcon />
                    Your ideas, ready to edit
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          className="workspace direction-card"
          aria-labelledby="workspace-title"
        >
          <div className="workspace-heading">
            <div>
              <div className="eyebrow">
                <span>CHOOSE AUDIO OR TEXT EDITS</span>
              </div>
              <div
                className="page-title"
                id="workspace-title"
                role="heading"
                aria-level={2}
              >
                describe what you want <em>edited.</em>
              </div>
            </div>
            <div className="required-note">TEXT OR AUDIO</div>
          </div>

          <div className="direction-layout">
            <div className="instruction-visual">
              <img
                src={selectedPin?.image || pins[0].image}
                alt={
                  selectedPin
                    ? `${selectedPin.title}, ready for creative direction`
                    : "Interior image ready for creative direction"
                }
              />
              <div className="instruction-shade" />
              <div className="instruction-copy">
                <span>YOUR NEXT STEP</span>
                <strong>Tell us how you want the image to change.</strong>
                <ol>
                  <li>
                    <b>01</b> Type your instructions
                  </li>
                  <li>
                    <b>02</b> Or record an audio note
                  </li>
                  <li>
                    <b>03</b> Click Start editing when done
                  </li>
                </ol>
              </div>
            </div>

            <div className="direction-controls">
              <div className="field-group">
                <div className="field-meta">
                  <label className="field-label" htmlFor="change-prompt">
                    What do you want to change? <em>OPTIONAL</em>
                  </label>
                  <span>{prompt.length}/240</span>
                </div>
                <textarea
                  id="change-prompt"
                  maxLength={240}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder="Make the light softer and add a warm editorial finish..."
                />
                <p className="helper-copy">
                  The Input Agent will translate your direction into an edit
                  plan.
                </p>
              </div>

              <div className="audio-row">
                <div>
                  <div className="field-label">
                    Prefer to talk? <em>OPTIONAL</em>
                  </div>
                  <p>Record your creative direction instead of typing it.</p>
                </div>
                <button
                  className={`record-button ${
                    isRecording ? "is-recording" : ""
                  }`}
                  type="button"
                  onClick={toggleRecording}
                  aria-pressed={isRecording}
                  disabled={isRequestingMic}
                  aria-busy={isRequestingMic}
                >
                  <MicrophoneIcon />
                  {isRecording
                    ? "Stop recording"
                    : isRequestingMic
                      ? "Requesting microphone..."
                      : "Record a note"}
                </button>
              </div>
              {recordingUrl && (
                <div className="audio-playback">
                  <span>Recorded note</span>
                  <audio controls preload="metadata" src={recordingUrl}>
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}
              {recordingError && (
                <p className="recording-error" role="alert">
                  {recordingError}
                </p>
              )}
            </div>
          </div>

          <div className="start-editing-row">
            <span>
              {!isConnected
                ? "CONNECT PINTEREST TO BEGIN"
                : !selectedPin
                  ? "SELECT A BOARD AND PIN"
                  : "READY WHEN YOU ARE"}
            </span>
            <button
              className="start-editing-button"
              type="button"
              onClick={processImage}
              disabled={!canStart || isProcessing}
            >
              {isProcessing ? "Editing image..." : "Start editing"}
              <span>→</span>
            </button>
          </div>
        </section>

        <section className="result-card" aria-labelledby="result-title">
          <span className="result-proof" aria-hidden="true">
            CREATIVE PROOF
          </span>
          <div className="result-copy">
            <div className="eyebrow">
              <span>REVIEW EDITS</span>
            </div>
            <div
              className="result-title"
              id="result-title"
              role="heading"
              aria-level={2}
            >
              Review your changes
            </div>
            <p>
              The Review Agent evaluates each edit and allows one refinement
              before preparing the final Pin.
            </p>
            <div className="agent-suggestions">
              <div>
                <span>01</span>
                <p>Increase contrast to make the subject stand out.</p>
              </div>
              <div>
                <span>02</span>
                <p>Soften the background for a cleaner composition.</p>
              </div>
              <div>
                <span>03</span>
                <p>Crop to a vertical 2:3 Pinterest-ready format.</p>
              </div>
            </div>
            <button
              className={`accept-button ${
                changesAccepted ? "is-accepted" : ""
              }`}
              type="button"
              onClick={() => setChangesAccepted(true)}
              disabled={changesAccepted || !resultReady}
            >
              {changesAccepted ? "Changes accepted" : "Accept changes"}
              <span>{changesAccepted ? "✓" : "→"}</span>
            </button>
          </div>

          <div className="result-visual">
            <div
              className={`result-image mockup-${selectedMockup} ${
                isProcessing ? "is-processing" : ""
              }`}
            >
              <img
                src={selectedPin?.image || pins[0].image}
                alt={
                  selectedPin
                    ? `Edited version of ${selectedPin.title}`
                    : "Processed image preview"
                }
              />
              <span className="crop-mark crop-mark-top" aria-hidden="true" />
              <span className="crop-mark crop-mark-bottom" aria-hidden="true" />
              <div className="result-badge">
                <SparkIcon />
                {isProcessing
                  ? "PROCESSING"
                  : resultReady
                    ? "PROCESSED"
                    : "PREVIEW"}
              </div>
            </div>
            <div className="output-download-row">
              <div className="result-details">
                <span>OUTPUT</span>
                <strong>JPG · 1000 × 1500</strong>
              </div>
              <button
                className="download-button"
                type="button"
                disabled={!resultReady}
              >
                <DownloadIcon />
                Download image
              </button>
            </div>
          </div>

          {isProcessing && (
            <div className="pipeline" aria-live="polite">
              {["Interpret", "Generate", "Review", "Store"].map(
                (step, index) => (
                  <div
                    className={
                      pipelineStep > index + 1
                        ? "is-complete"
                        : pipelineStep === index + 1
                          ? "is-active"
                          : ""
                    }
                    key={step}
                  >
                    <span>
                      {pipelineStep > index + 1 ? "✓" : `0${index + 1}`}
                    </span>
                    <strong>{step}</strong>
                  </div>
                ),
              )}
            </div>
          )}

          <div className="mockup-suggestions">
            <div className="mockup-heading">
              <div>
                <span>MOCKUP SUGGESTIONS</span>
                <strong>AI Suggestions</strong>
              </div>
              <small>CHOOSE AN EDIT</small>
            </div>
            <div className="mockup-grid">
              {mockupSuggestions.map((mockup) => (
                <button
                  className={`mockup-card mockup-card-${mockup.id} ${
                    selectedMockup === mockup.id ? "is-selected" : ""
                  }`}
                  type="button"
                  key={mockup.id}
                  onClick={() => setSelectedMockup(mockup.id)}
                  aria-pressed={selectedMockup === mockup.id}
                >
                  <span className="mockup-image">
                    <img
                      src={selectedPin?.image || pins[0].image}
                      alt=""
                    />
                  </span>
                  <span className="mockup-card-copy">
                    <strong>{mockup.label}</strong>
                    <small>{mockup.detail}</small>
                  </span>
                  <i>{selectedMockup === mockup.id ? "✓" : "→"}</i>
                </button>
              ))}
            </div>
          </div>

          <div className="action-row result-action-row">
            <span className="signin-note">
              <i />{" "}
              {isConnected
                ? "Connected to Pinterest."
                : "Sign in to publish your result."}
            </span>
            <button
              className="primary-button"
              type="button"
              disabled={!resultReady || !isConnected}
            >
              Create and upload to Pinterest
              <span>↑</span>
            </button>
          </div>
        </section>
      </div>

      <footer className="site-footer">
        <nav className="footer-links" aria-label="Footer navigation">
          <Link to="/about">About Us</Link>
          <span aria-hidden="true" />
          <Link to="/contact">Contact</Link>
          <span aria-hidden="true" />
          <Link to="/customers">Customers</Link>
          <span aria-hidden="true" />
          <Link to="/privacy">Privacy</Link>
        </nav>
      </footer>

      <button className="apps-button" type="button">
        Apps
      </button>
    </main>
  )
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudioLandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route element={<SiteLayout />}>
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="account" element={<AccountPage />} />
            <Route path="studio" element={<ArtworkForm />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

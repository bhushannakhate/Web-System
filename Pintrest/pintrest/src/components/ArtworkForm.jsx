import { useEffect, useRef, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './ArtworkForm.css'


// Keep the upload limit in one place so validation and its explanation stay consistent.
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const paths = {
    // Store SVG paths by name so the same small Icon component can draw each icon.
    arrow: <><path d="M12 5v14" /><path d="m18 13-6 6-6-6" /></>,
    check: <><path d="m5 12 4.3 4.3L19 6.7" /></>,
    mic: <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8" /></>,
    pinterest: <><path d="M9.2 21c.6-1.3.9-2.4 1.2-3.8.3-1.4-1.2-2.4-1.2-5 0-3.2 2.3-5.5 5.4-5.5 2.6 0 4.5 1.9 4.5 4.2 0 2.8-1.2 5.9-3.7 5.9-1.2 0-2.1-1-1.8-2.2l.7-2.8c.3-1.2-.1-2.2-1.3-2.2-1.5 0-2.7 1.5-2.7 3.5 0 1.3.4 2.2.4 2.2s-1.4 5.9-1.6 6.9" /><path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10Z" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 20h16" /></>,
  }

  return (
    <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  )
}

function ArtworkForm() {
  // State is data that affects what React renders; updates trigger a re-render.
  const [image, setImage] = useState(null)
  const [imageError, setImageError] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioError, setAudioError] = useState('')
  const [submitState, setSubmitState] = useState('idle')
  const [pinterestState, setPinterestState] = useState('idle')

  // Refs hold DOM/browser objects that should persist without causing re-renders.
  const fileInputRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    // Object URLs point to local files; revoke each URL when the image changes or unmounts.
    const imageUrl = image?.url
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [image])

  useEffect(() => {
    // Release microphone and timer resources if the page is closed while recording.
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const chooseImage = () => fileInputRef.current?.click()

  const setImageFile = (file) => {
    setImageError('')
    if (!file) return
    // Validate file type and size before creating a preview for the selected image.
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file (JPG, PNG, WebP, or GIF).')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('That image is too large. Please choose one under 10 MB.')
      return
    }
    setImage((current) => {
      if (current?.url) URL.revokeObjectURL(current.url)
      return { file, url: URL.createObjectURL(file) }
    })
  }

  const handleFileInput = (event) => {
    setImageFile(event.target.files?.[0])
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.currentTarget.classList.remove('is-dragging')
    setImageFile(event.dataTransfer.files?.[0])
  }

  const removeImage = () => {
    setImage((current) => {
      if (current?.url) URL.revokeObjectURL(current.url)
      return null
    })
    setImageError('')
  }

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const startRecording = async () => {
    setAudioError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setAudioError('Audio recording is not supported in this browser.')
      return
    }

    try {
      // The browser asks permission for the microphone; recording APIs are asynchronous.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      // MediaRecorder delivers recorded audio in chunks; join them when recording stops.
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setAudioUrl((current) => {
          if (current) URL.revokeObjectURL(current)
          return URL.createObjectURL(blob)
        })
      }
      recorder.onerror = () => setAudioError('We could not save that recording. Please try again.')
      recorder.start()
      setRecordingSeconds(0)
      setIsRecording(true)
      timerRef.current = setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000)
    } catch {
      setAudioError('Microphone access was not granted. You can still use the text prompt.')
    }
  }

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const formatTime = (seconds) => `00:${String(seconds).padStart(2, '0')}`

  const handleSubmit = (event) => {
    event.preventDefault()
    // This demo requires an image, then shows a simulated processing result.
    if (!image) {
      setImageError('Add an image before creating your polished artwork.')
      return
    }
    setSubmitState('loading')
    window.setTimeout(() => setSubmitState('success'), 900)
  }

  const handlePinterest = () => {
    setPinterestState('success')
    window.setTimeout(() => setPinterestState('idle'), 2400)
  }

  return (
    <main className="bootstrap-page">
      <div className="page-shell container-fluid" data-bs-theme="light">
        <form className="creation-card" onSubmit={handleSubmit} noValidate>
          <div className="form-heading d-flex flex-wrap gap-2">
            <div>
              <p className="step-label">01 <span>·</span> Change your image by uploading or audio</p>
              <h2>what will you submit to Pinterest?</h2>
            </div>
            <span className="required-note">* required</span>
          </div>

          <div className="upload-grid row g-3">
            <div className="field-block col-12 col-md-6">
              <div className="field-label-row d-flex flex-wrap gap-2">
                <label className="form-label" htmlFor="image-upload">Your image <span>*</span></label>
                {image && <span className="ready-label"><Icon name="check" size={13} /> ready</span>}
              </div>

              {image ? (
                <div className="image-preview-card">
                  <img src={image.url} alt={`Preview of ${image.file.name}`} />
                  <div className="image-overlay">
                    <p>{image.file.name}</p>
                    <div className="preview-actions d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-light mini-button"
                        type="button"
                        onClick={chooseImage}
                      >
                        Replace
                      </button>
                      <button
                        className="btn btn-outline-light mini-button mini-button-quiet"
                        type="button"
                        onClick={removeImage}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  id="image-upload"
                  type="button"
                  className="btn drop-zone"
                  onClick={chooseImage}
                  onDragOver={(event) => { event.preventDefault(); event.currentTarget.classList.add('is-dragging') }}
                  onDragLeave={(event) => event.currentTarget.classList.remove('is-dragging')}
                  onDrop={handleDrop}
                >
                  <span className="upload-icon"><Icon name="upload" size={21} /></span>
                  <span className="drop-title">Drop an image here</span>
                  <span className="drop-subtitle">or <u>browse your files</u></span>
                  <span className="file-types">JPG, PNG, WEBP · max 10 MB</span>
                </button>
              )}
              <input ref={fileInputRef} id="file-input" className="visually-hidden" type="file" accept="image/*" onChange={handleFileInput} />
              {imageError && <p className="alert alert-danger error-message" role="alert">{imageError}</p>}
            </div>

            <div className="field-block prompt-block col-12 col-md-6">
              <div className="field-label-row d-flex flex-wrap gap-2">
                <label className="form-label" htmlFor="prompt">What do you want to change? <span className="optional-label">optional</span></label>
                <span className="character-count">{prompt.length}/240</span>
              </div>
              <textarea
                className="form-control"
                id="prompt"
                value={prompt}
                maxLength={240}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Changing..."
                rows="5"
              />
              <p className="field-hint">For example, apply your watermark or highlight the edges.</p>
            </div>
          </div>

          <div className="divider" />

          <div className="audio-section d-flex flex-column flex-md-row gap-3">
            <div className="audio-copy">
              <div className="field-label-row d-flex flex-wrap gap-2"><label>Describe what you want changed <span className="optional-label">optional</span></label></div>
              <p>Change the color, or make a black-and-white copy.</p>
            </div>
            <div className="audio-control-wrap">
              <button
                className={`btn btn-outline-secondary record-button ${isRecording ? 'is-recording' : ''}`}
                type="button"
                onClick={toggleRecording}
                aria-pressed={isRecording}
              >
                <span className="record-icon">{isRecording ? <span className="stop-square" /> : <Icon name="mic" size={19} />}</span>
                <span>{isRecording ? 'Recording...' : audioUrl ? 'Re-record note' : 'Record a note'}</span>
                {isRecording && <span className="record-timer">{formatTime(recordingSeconds)}</span>}
              </button>
              {audioUrl && !isRecording && <audio className="audio-player" controls src={audioUrl} aria-label="Your recorded note" />}
              {audioError && <p className="alert alert-danger error-message audio-error" role="alert">{audioError}</p>}
            </div>
          </div>

          <div className="form-footer d-flex flex-column-reverse flex-md-row gap-3">
            <div className="privacy-note"><span className="privacy-dot" /> Make sure to sign in to Pinterest.</div>
            <button
              className="btn btn-primary primary-button"
              type="submit"
              disabled={submitState === 'loading'}
            >
              {submitState === 'loading' ? (
                'Warming up the muse...'
              ) : submitState === 'success' ? (
                <><Icon name="check" size={17} /> Ready to polish</>
              ) : (
                <>Create and upload to Pinterest <Icon name="arrow" size={17} /></>
              )}
            </button>
          </div>

          {submitState === 'success' && (
            <div className="alert alert-success success-panel d-flex flex-column flex-md-row gap-3" role="status">
              <div><span className="success-icon"><Icon name="check" size={17} /></span><span>Your brief is ready for the Gemini polish step.</span></div>
              <button type="button" className="btn btn-danger pinterest-button" onClick={handlePinterest} disabled={pinterestState === 'success'}>
                <Icon name="pinterest" size={17} /> {pinterestState === 'success' ? 'Uploaded to Pinterest' : 'Put on Pinterest'}
              </button>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

export default ArtworkForm

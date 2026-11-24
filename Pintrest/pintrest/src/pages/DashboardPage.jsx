import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import {
  deleteUserCreation,
  getCreationMediaDownloadUrl,
  listUserCreations,
  retryUserCreation,
} from '../services/creations'
import './DashboardPage.css'

const EMPTY_FILTERS = { search: '', status: '', from: '', to: '' }

function getTimestamp(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    const timestamp = new Date(value).getTime()
    return Number.isFinite(timestamp) ? timestamp : null
  }
  if (Number.isFinite(value?._seconds)) return value._seconds * 1000
  if (Number.isFinite(value?.seconds)) return value.seconds * 1000
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  return null
}

function formatDate(value) {
  const timestamp = getTimestamp(value)
  if (timestamp === null) return 'Date unavailable'
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp)
}

function creationTitle(creation) {
  const firstLine = creation.instructions?.trim().split(/\r?\n/, 1)[0]
  return firstLine || 'Untitled creation'
}

function sourceStatus(creation) {
  const source = creation.media?.sourceImage
  if (!source) return 'No source image'
  return source.importedFrom === 'google_photos_picker'
    ? 'Imported from Google Photos'
    : 'Source image uploaded'
}

function statusLabel(status) {
  return {
    draft: 'Draft',
    processing: 'In progress',
    completed: 'Completed',
    failed: 'Failed',
  }[status] || 'Unknown'
}

function mediaExtension(contentType) {
  return {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }[contentType] || 'jpg'
}

async function addThumbnailUrls(creations, user) {
  return Promise.all(
    creations.map(async (creation) => {
      const mediaEntries = [
        ['sourceImage', 'sourceImageUrl'],
        ['outputImage', 'outputImageUrl'],
      ].filter(([kind]) => creation.media?.[kind])
      const results = await Promise.allSettled(
        mediaEntries.map(([kind]) =>
          getCreationMediaDownloadUrl(creation.id, kind, user),
        ),
      )
      const urls = {}
      mediaEntries.forEach(([, key], index) => {
        urls[key] =
          results[index].status === 'fulfilled'
            ? results[index].value.downloadUrl
            : ''
      })
      return { ...creation, ...urls }
    }),
  )
}

function DashboardPage() {
  const { user } = useAuth()
  const dialogRef = useRef(null)
  const [filterValues, setFilterValues] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [creations, setCreations] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [moreError, setMoreError] = useState('')
  const [selectedCreation, setSelectedCreation] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [retryInstructions, setRetryInstructions] = useState('')
  const [retrying, setRetrying] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const dialog = dialogRef.current
    if (selectedCreation && dialog && !dialog.open) dialog.showModal()
    if (!selectedCreation && dialog?.open) dialog.close()
  }, [selectedCreation])

  useEffect(() => {
    let active = true
    async function loadCreations() {
      setLoading(true)
      setError('')
      setMoreError('')
      try {
        const page = await listUserCreations(user, appliedFilters)
        const visibleCreations = await addThumbnailUrls(page.creations, user)
        if (!active) return
        setCreations(visibleCreations)
        setNextCursor(page.nextCursor)
      } catch (loadError) {
        if (!active) return
        setCreations([])
        setNextCursor(null)
        setError(loadError.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadCreations()
    return () => {
      active = false
    }
  }, [appliedFilters, refreshKey, user])

  function updateFilter(event) {
    const { name, value } = event.target
    setFilterValues((current) => ({ ...current, [name]: value }))
  }

  function applyFilters(event) {
    event.preventDefault()
    setAppliedFilters({
      search: filterValues.search.trim(),
      status: filterValues.status,
      from: filterValues.from,
      to: filterValues.to,
    })
  }

  function clearFilters() {
    setFilterValues(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
  }

  async function loadMore() {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    setMoreError('')
    try {
      const page = await listUserCreations(user, appliedFilters, nextCursor)
      const visibleCreations = await addThumbnailUrls(page.creations, user)
      setCreations((current) => [...current, ...visibleCreations])
      setNextCursor(page.nextCursor)
    } catch (loadError) {
      setMoreError(loadError.message)
    } finally {
      setLoadingMore(false)
    }
  }

  function openCreation(creation) {
    setSelectedCreation(creation)
    setRetryInstructions(creation.instructions || '')
    setActionError('')
    setActionNotice('')
  }

  async function downloadMedia(creation, mediaKind) {
    setDownloading(mediaKind)
    setActionError('')
    try {
      const { downloadUrl } = await getCreationMediaDownloadUrl(
        creation.id,
        mediaKind,
        user,
        true,
      )
      const media = creation.media?.[mediaKind]
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${creation.id}-${mediaKind}.${mediaExtension(media?.contentType)}`
      link.rel = 'noopener'
      document.body.append(link)
      link.click()
      link.remove()
    } catch (downloadError) {
      setActionError(downloadError.message)
    } finally {
      setDownloading('')
    }
  }

  async function deleteCreation() {
    const title = creationTitle(selectedCreation)
    if (!window.confirm(`Delete “${title}” and its stored media? This cannot be undone.`)) {
      return
    }
    setDeleting(true)
    setActionError('')
    setActionNotice('')
    try {
      await deleteUserCreation(selectedCreation.id, user)
      setCreations((current) =>
        current.filter((creation) => creation.id !== selectedCreation.id),
      )
      setSelectedCreation(null)
      setActionNotice('Creation deleted.')
      setRefreshKey((current) => current + 1)
    } catch (deleteError) {
      setActionError(deleteError.message)
    } finally {
      setDeleting(false)
    }
  }

  async function retryCreation(event) {
    event.preventDefault()
    if (!selectedCreation) return
    const instructions = retryInstructions.trim()
    const includeAudio = !instructions && Boolean(selectedCreation.media?.audio)
    if (!instructions && !includeAudio) {
      setActionError('Add written instructions before retrying this creation.')
      return
    }
    setRetrying(true)
    setActionError('')
    setActionNotice('')
    try {
      await retryUserCreation(
        selectedCreation,
        instructions,
        user,
        includeAudio,
      )
      setActionNotice('Your creation was processed successfully.')
      setSelectedCreation(null)
      setRefreshKey((current) => current + 1)
    } catch (retryError) {
      setActionError(retryError.message)
      setRefreshKey((current) => current + 1)
    } finally {
      setRetrying(false)
    }
  }

  return (
    <main className="creation-dashboard">
      <header className="dashboard-heading">
        <div>
          <p className="dashboard-eyebrow">Your private library</p>
          <h1>Your creations</h1>
          <p className="dashboard-intro">
            Find and manage the images you have saved in Pinboard Studio.
          </p>
        </div>
        <Link className="dashboard-create-button" to="/">
          Create something <span aria-hidden="true">↗</span>
        </Link>
      </header>

      <form className="dashboard-filters" onSubmit={applyFilters}>
        <label className="dashboard-search">
          <span>Search creations</span>
          <input
            type="search"
            name="search"
            value={filterValues.search}
            onChange={updateFilter}
            maxLength={100}
            placeholder="Search instructions or creation ID"
          />
        </label>
        <label>
          <span>Status</span>
          <select name="status" value={filterValues.status} onChange={updateFilter}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="processing">In progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </label>
        <label>
          <span>From</span>
          <input
            type="date"
            name="from"
            value={filterValues.from}
            max={filterValues.to || undefined}
            onChange={updateFilter}
          />
        </label>
        <label>
          <span>To</span>
          <input
            type="date"
            name="to"
            value={filterValues.to}
            min={filterValues.from || undefined}
            onChange={updateFilter}
          />
        </label>
        <div className="dashboard-filter-actions">
          <button type="submit" className="dashboard-apply-button">Apply filters</button>
          <button type="button" className="dashboard-clear-button" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className="dashboard-error" role="alert">
          <p>We couldn’t load your creations. {error}</p>
          <button type="button" onClick={() => setRefreshKey((current) => current + 1)}>
            Try again
          </button>
        </div>
      )}
      {actionNotice && <p className="dashboard-notice" role="status">{actionNotice}</p>}

      {loading ? (
        <div className="creation-grid" aria-label="Loading creations" aria-busy="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="creation-card creation-card-skeleton" key={index} aria-hidden="true">
              <span />
              <div><i /><i /></div>
            </div>
          ))}
        </div>
      ) : !error && creations.length === 0 ? (
        <section className="dashboard-empty" aria-live="polite">
          <span className="dashboard-empty-mark" aria-hidden="true">✳</span>
          <h2>{Object.values(appliedFilters).some(Boolean) ? 'No matching creations' : 'Your library is ready'}</h2>
          <p>
            {Object.values(appliedFilters).some(Boolean)
              ? 'Try another search or clear the filters to see your full library.'
              : 'Creations you save or import from Google Photos will appear here.'}
          </p>
          {Object.values(appliedFilters).some(Boolean) ? (
            <button type="button" className="dashboard-apply-button" onClick={clearFilters}>
              Clear filters
            </button>
          ) : (
            <Link className="dashboard-create-button" to="/">Start a creation</Link>
          )}
        </section>
      ) : (
        <>
          <section aria-label="Your creations">
            <div className="dashboard-results-heading">
              <h2>Library</h2>
              <span>{creations.length}{nextCursor ? '+' : ''} {creations.length === 1 ? 'creation' : 'creations'}</span>
            </div>
            <div className="creation-grid">
              {creations.map((creation) => (
                <article className="creation-card" key={creation.id}>
                  <button
                    className="creation-open-button"
                    type="button"
                    onClick={() => openCreation(creation)}
                    aria-label={`Open ${creationTitle(creation)}`}
                  >
                    <span className="creation-image-pair">
                      <span className="creation-image-frame">
                        {creation.sourceImageUrl ? (
                          <img src={creation.sourceImageUrl} alt="" loading="lazy" />
                        ) : (
                          <span className="creation-image-placeholder">Source</span>
                        )}
                        <span className="creation-image-label">Source</span>
                      </span>
                      <span className="creation-image-frame">
                        {creation.outputImageUrl ? (
                          <img src={creation.outputImageUrl} alt="" loading="lazy" />
                        ) : (
                          <span className="creation-image-placeholder">Output</span>
                        )}
                        <span className="creation-image-label">Output</span>
                      </span>
                    </span>
                    <span className="creation-card-copy">
                      <span className="creation-card-title">{creationTitle(creation)}</span>
                      <span className={`creation-status creation-status-${creation.status}`}>
                        {statusLabel(creation.status)}
                      </span>
                      <span className="creation-card-meta">
                        <span>{formatDate(creation.createdAt)}</span>
                        <span>{sourceStatus(creation)}</span>
                      </span>
                    </span>
                  </button>
                </article>
              ))}
            </div>
          </section>
          {moreError && <p className="dashboard-error" role="alert">{moreError}</p>}
          {nextCursor && (
            <div className="dashboard-load-more">
              <button type="button" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      <dialog
        className="creation-detail-dialog"
        ref={dialogRef}
        aria-labelledby="creation-detail-title"
        onClose={() => {
          setSelectedCreation(null)
          setActionError('')
        }}
      >
        {selectedCreation && (
          <div className="creation-detail">
            <div className="creation-detail-heading">
              <div>
                <p className="dashboard-eyebrow">Creation details</p>
                <h2 id="creation-detail-title">{creationTitle(selectedCreation)}</h2>
              </div>
              <button
                className="creation-dialog-close"
                type="button"
                aria-label="Close creation details"
                onClick={() => setSelectedCreation(null)}
              >
                ×
              </button>
            </div>
            <div className="creation-detail-meta">
              <span className={`creation-status creation-status-${selectedCreation.status}`}>
                {statusLabel(selectedCreation.status)}
              </span>
              <span>{formatDate(selectedCreation.createdAt)}</span>
              <span>{sourceStatus(selectedCreation)}</span>
            </div>
            <div className="creation-detail-images">
              {[
                ['sourceImage', 'Source image', selectedCreation.sourceImageUrl],
                ['outputImage', 'Generated image', selectedCreation.outputImageUrl],
              ].map(([kind, label, url]) => (
                <section className="creation-detail-image" key={kind}>
                  <h3>{label}</h3>
                  {url ? <img src={url} alt={label} /> : <p>No image saved.</p>}
                  {selectedCreation.media?.[kind] && (
                    <button
                      type="button"
                      className="creation-action-button"
                      onClick={() => downloadMedia(selectedCreation, kind)}
                      disabled={downloading === kind}
                    >
                      {downloading === kind ? 'Preparing…' : `Download ${label.toLowerCase()}`}
                    </button>
                  )}
                </section>
              ))}
            </div>
            {selectedCreation.instructions && (
              <section className="creation-detail-instructions">
                <h3>Instructions</h3>
                <p>{selectedCreation.instructions}</p>
              </section>
            )}
            {selectedCreation.status === 'failed' && (
              <form className="creation-retry-form" onSubmit={retryCreation}>
                <label htmlFor="retry-instructions">Update instructions and retry</label>
                <textarea
                  id="retry-instructions"
                  value={retryInstructions}
                  onChange={(event) => setRetryInstructions(event.target.value)}
                  maxLength={2000}
                  rows={3}
                />
                <button
                  type="submit"
                  className="dashboard-apply-button"
                  disabled={retrying || !selectedCreation.media?.sourceImage}
                >
                  {retrying ? 'Retrying…' : 'Retry creation'}
                </button>
                {!selectedCreation.media?.sourceImage && (
                  <p>This creation needs a source image before it can be retried.</p>
                )}
              </form>
            )}
            {actionError && <p className="dashboard-error" role="alert">{actionError}</p>}
            {actionNotice && <p className="dashboard-notice" role="status">{actionNotice}</p>}
            <div className="creation-detail-footer">
              <button
                type="button"
                className="creation-delete-button"
                onClick={deleteCreation}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete creation'}
              </button>
              <button
                type="button"
                className="creation-action-button"
                onClick={() => setSelectedCreation(null)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </dialog>
    </main>
  )
}

export default DashboardPage

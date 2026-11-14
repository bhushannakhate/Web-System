import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { deleteCreation, getCreation, getCreationMediaDownloadUrl } from '../services/creations'
import { formatCreationDateTime, getCreationSourceLabel } from '../utils/creation'
import './CreationDetailPage.css'

async function loadMediaUrl(creation, mediaKind, user) {
  if (!creation.media?.[mediaKind]) return ''
  try {
    const result = await getCreationMediaDownloadUrl(creation.id, mediaKind, user)
    return result.downloadUrl || ''
  } catch {
    return ''
  }
}

function CreationDetailPage() {
  const { creationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [result, setResult] = useState({ creation: null, sourceUrl: '', outputUrl: '', loading: true, error: '' })
  const [deleting, setDeleting] = useState(false)

  const loadCreation = useCallback(async () => {
    setResult((current) => ({ ...current, loading: true, error: '' }))
    try {
      const { creation } = await getCreation(creationId, user)
      const [sourceUrl, outputUrl] = await Promise.all([
        loadMediaUrl(creation, 'sourceImage', user),
        loadMediaUrl(creation, 'outputImage', user),
      ])
      setResult({ creation, sourceUrl, outputUrl, loading: false, error: '' })
    } catch (error) {
      setResult({ creation: null, sourceUrl: '', outputUrl: '', loading: false, error: error.message })
    }
  }, [creationId, user])

  useEffect(() => {
    void loadCreation()
  }, [loadCreation])

  async function handleDelete() {
    if (!result.creation || !window.confirm('Delete this creation and its stored media?')) return
    setDeleting(true)
    try {
      await deleteCreation(result.creation.id, user)
      navigate('/account', { replace: true, state: { notice: 'Creation deleted.' } })
    } catch (error) {
      setResult((current) => ({ ...current, error: error.message }))
      setDeleting(false)
    }
  }

  return (
    <main className="creation-detail-page">
      <div className="creation-detail-container">
        <Link className="dashboard-back-link" to="/account">← Back to your library</Link>
        {result.loading ? (
          <div className="detail-state" role="status">Loading creation…</div>
        ) : result.error && !result.creation ? (
          <div className="detail-state detail-state-error" role="alert">
            <strong>We couldn’t load this creation.</strong>
            <p>{result.error}</p>
            <button className="dashboard-secondary-button" type="button" onClick={() => void loadCreation()}>Try again</button>
          </div>
        ) : (
          <article className="creation-detail-card">
            <header className="creation-detail-heading">
              <div>
                <p className="page-eyebrow"><span /> Creation detail</p>
                <h1>{result.creation.instructions?.trim() || 'Untitled creation'}</h1>
                <p className="creation-detail-meta">Created {formatCreationDateTime(result.creation.createdAt)} · {getCreationSourceLabel(result.creation)}</p>
              </div>
              <span className={`creation-status creation-status-${result.creation.status || 'draft'}`}>{result.creation.status || 'draft'}</span>
            </header>

            {result.error && <p className="detail-inline-error" role="alert">{result.error}</p>}

            <div className="creation-detail-grid">
              <section className="detail-visuals" aria-label="Creation media">
                <div className="detail-image-frame">
                  {result.sourceUrl ? <img src={result.sourceUrl} alt="Source image for this creation" /> : <span>No source preview available</span>}
                  <small>Source image</small>
                </div>
                {result.outputUrl && (
                  <div className="detail-image-frame">
                    <img src={result.outputUrl} alt="Generated output for this creation" />
                    <small>Output image</small>
                  </div>
                )}
              </section>

              <aside className="detail-sidebar">
                <div className="detail-fact"><span>Status</span><strong>{result.creation.status || 'draft'}</strong></div>
                <div className="detail-fact"><span>Revision count</span><strong>{result.creation.revisionCount || 0}</strong></div>
                <div className="detail-fact"><span>Creation ID</span><strong>{result.creation.id}</strong></div>
                {result.creation.instructions && <div className="detail-instructions"><span>Instructions</span><p>{result.creation.instructions}</p></div>}
                <div className="detail-actions">
                  {result.sourceUrl && <a className="dashboard-primary-button" href={result.sourceUrl} target="_blank" rel="noreferrer">Open source image</a>}
                  {result.outputUrl && <a className="dashboard-secondary-button" href={result.outputUrl} target="_blank" rel="noreferrer">Open output image</a>}
                  <button className="detail-delete-button" type="button" onClick={() => void handleDelete()} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete creation'}</button>
                </div>
              </aside>
            </div>
          </article>
        )}
      </div>
    </main>
  )
}

export default CreationDetailPage

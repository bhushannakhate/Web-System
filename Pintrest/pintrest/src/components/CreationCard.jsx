import { Link } from 'react-router-dom'
import { formatCreationDate, getCreationSourceLabel, timestampToDate } from '../utils/creation'

function CreationCard({ creation }) {
  const createdAt = timestampToDate(creation.createdAt)
  const status = creation.status || 'draft'

  return (
    <article className="creation-card">
      <Link className="creation-card-link" to={`/account/creations/${encodeURIComponent(creation.id)}`}>
        <div className="creation-card-media">
          {creation.previewUrl ? (
            <img src={creation.previewUrl} alt="" loading="lazy" />
          ) : (
            <span className="creation-card-placeholder" aria-hidden="true">p</span>
          )}
          <span className={`creation-status creation-status-${status}`}>{status}</span>
        </div>
        <div className="creation-card-content">
          <div className="creation-card-title-row">
            <h3>{creation.instructions?.trim() || 'Untitled creation'}</h3>
            <span aria-hidden="true">↗</span>
          </div>
          <p className="creation-card-source">{getCreationSourceLabel(creation)}</p>
          <time dateTime={createdAt?.toISOString()}>{formatCreationDate(creation.createdAt)}</time>
        </div>
      </Link>
    </article>
  )
}

export default CreationCard

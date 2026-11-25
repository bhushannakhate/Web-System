import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import CreationCard from '../components/CreationCard'
import { listCreations } from '../services/creations'
import { apiRequest } from '../services/api'
import './AccountPage.css'

const PAGE_SIZE = 12
const EMPTY_FILTERS = { search: '', status: 'completed', from: '', to: '' }

async function addPreviewUrls(creations, user) {
  return Promise.all(creations.map(async (creation) => {
    let previewUrl = ''
    let outputUrl = ''
    if (creation.media?.sourceImage) {
      try {
        previewUrl = (await apiRequest(`/creations/${encodeURIComponent(creation.id)}/media/sourceImage/download-url`, user)).downloadUrl || ''
      } catch {
        previewUrl = ''
      }
    }
    if (creation.media?.outputImage) {
      try {
        outputUrl = (await apiRequest(`/creations/${encodeURIComponent(creation.id)}/media/outputImage/download-url`, user)).downloadUrl || ''
      } catch {
        outputUrl = ''
      }
    }
    return { ...creation, previewUrl, outputUrl }
  }))
}

function AccountPage() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [profileResult, setProfileResult] = useState({ profile: null, error: '', loading: true })
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [library, setLibrary] = useState({ creations: [], nextCursor: null, loading: true, error: '' })
  const [loadingMore, setLoadingMore] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [notice, setNotice] = useState(location.state?.notice || '')

  useEffect(() => {
    if (location.state?.notice) window.history.replaceState({}, document.title)
  }, [location.state])

  useEffect(() => {
    let active = true
    setProfileResult((current) => ({ ...current, loading: true, error: '' }))
    apiRequest('/users/me', user)
      .then((payload) => {
        if (active) setProfileResult({ profile: payload.user, error: '', loading: false })
      })
      .catch((error) => {
        if (active) setProfileResult({ profile: null, error: error.message, loading: false })
      })
    return () => { active = false }
  }, [user])

  useEffect(() => {
    let active = true
    setLibrary({ creations: [], nextCursor: null, loading: true, error: '' })
    listCreations(user, { ...appliedFilters, limit: PAGE_SIZE })
      .then(async (payload) => {
        const creations = await addPreviewUrls(payload.creations, user)
        if (active) setLibrary({ creations, nextCursor: payload.nextCursor, loading: false, error: '' })
      })
      .catch((error) => {
        if (active) setLibrary({ creations: [], nextCursor: null, loading: false, error: error.message })
      })
    return () => { active = false }
  }, [user, appliedFilters])

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function handleApplyFilters(event) {
    event.preventDefault()
    setNotice('')
    setAppliedFilters({ ...filters })
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setNotice('')
  }

  async function handleLoadMore() {
    if (!library.nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const payload = await listCreations(user, { ...appliedFilters, limit: PAGE_SIZE, cursor: library.nextCursor })
      const creations = await addPreviewUrls(payload.creations, user)
      setLibrary((current) => ({ ...current, creations: [...current.creations, ...creations], nextCursor: payload.nextCursor }))
    } catch (error) {
      setLibrary((current) => ({ ...current, error: error.message }))
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch {
      setProfileResult((current) => ({ ...current, error: 'We could not sign you out. Please try again.' }))
      setSigningOut(false)
    }
  }

  const profile = profileResult.profile
  const hasFilters = [appliedFilters.search, appliedFilters.from, appliedFilters.to].some(Boolean)

  return (
    <main className="account-page">
      <div className="account-content">
        <header className="account-intro">
          <div>
            <p className="account-eyebrow"><span /> Pinboard Studio · User's creations</p>
            <h1>Your creative <em>library.</em></h1>
            <p className="account-intro-copy">Keep your source images, ideas, and editing drafts together in one private workspace.</p>
          </div>
          <div className="account-profile-card">
            <span className="account-profile-label">SIGNED IN AS</span>
            <strong>{profile?.displayName || user?.displayName || user?.email || 'Pinboard creator'}</strong>
            <span>{profileResult.loading ? 'Loading profile…' : profileResult.error || user?.email || 'Connected account'}</span>
            <button className="account-link-button" type="button" onClick={() => void handleSignOut()} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out'}</button>
          </div>
        </header>

        {notice && <p className="account-notice" role="status">{notice}</p>}
        {profileResult.error && <p className="account-error" role="alert">{profileResult.error}</p>}

        <section className="account-card account-toolbar" aria-labelledby="library-filters-title">
          <div className="account-section-heading">
            <div>
              <p className="account-kicker">YOUR WORK</p>
              <h2 id="library-filters-title">Find a creation</h2>
            </div>
            <Link className="account-primary-button" to="/">+ New creation</Link>
          </div>
          <form className="creation-filters" onSubmit={handleApplyFilters}>
            <label className="filter-search">Search<input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search instructions or creation ID" /></label>
            <label>From<input name="from" type="date" value={filters.from} onChange={handleFilterChange} /></label>
            <label>To<input name="to" type="date" value={filters.to} onChange={handleFilterChange} /></label>
            <div className="filter-actions"><button className="account-primary-button" type="submit">Apply</button>{hasFilters && <button className="account-secondary-button" type="button" onClick={handleClearFilters}>Clear</button>}</div>
          </form>
        </section>

        <section className="account-card account-library" aria-labelledby="saved-creations-title">
          <div className="account-section-heading library-heading">
            <div><p className="account-kicker">PRIVATE LIBRARY</p><h2 id="saved-creations-title">Saved creations</h2></div>
            {!library.loading && <span className="library-count">{library.creations.length} loaded</span>}
          </div>

          {library.loading ? (
            <div className="creation-grid" aria-label="Loading creations" aria-busy="true">{[1, 2, 3].map((item) => <div className="creation-skeleton" key={item} />)}</div>
          ) : library.error && library.creations.length === 0 ? (
            <div className="library-state" role="alert"><strong>We couldn’t load your library.</strong><p>{library.error}</p><button className="account-secondary-button" type="button" onClick={() => setAppliedFilters({ ...appliedFilters })}>Try again</button></div>
          ) : library.creations.length === 0 ? (
            <div className="library-state"><strong>{hasFilters ? 'No creations match those filters.' : 'Your library is ready for its first idea.'}</strong><p>{hasFilters ? 'Try a broader search or clear the filters.' : 'Upload a source image or import one from Google Photos to start a private creation.'}</p><Link className="account-primary-button" to="/">Start creating</Link></div>
          ) : (
            <>
              <div className="creation-grid">{library.creations.map((creation) => <CreationCard creation={creation} key={creation.id} />)}</div>
              {library.nextCursor && <div className="load-more-wrap"><button className="account-secondary-button" type="button" onClick={() => void handleLoadMore()} disabled={loadingMore}>{loadingMore ? 'Loading more…' : 'Load more creations'}</button></div>}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default AccountPage

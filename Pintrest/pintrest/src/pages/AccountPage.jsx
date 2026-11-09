import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import AuthShell from '../components/AuthShell'
import { apiRequest } from '../services/api'

function AccountPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profileResult, setProfileResult] = useState({ uid: '', profile: null, error: '', loading: true })
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    let active = true
    apiRequest('/users/me', user)
      .then((payload) => {
        if (active) setProfileResult({ uid: user.uid, profile: payload.user, error: '', loading: false })
      })
      .catch((error) => {
        if (active) setProfileResult({ uid: user.uid, profile: null, error: error.message, loading: false })
      })

    return () => {
      active = false
    }
  }, [user])

  const hasCurrentProfile = profileResult.uid === user?.uid
  const profile = hasCurrentProfile ? profileResult.profile : null
  const loadingProfile = !hasCurrentProfile || profileResult.loading
  const profileError = hasCurrentProfile ? profileResult.error : ''

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

  return (
    <AuthShell title="Your account" description="Your Pinboard Studio sign-in and profile.">
      <div className="account-summary">
        <span>Name</span>
        <strong>{profile?.displayName || user?.displayName || 'Not set'}</strong>
        <span>Email</span>
        <strong>{user?.email || 'No email address'}</strong>
        <span>Profile status</span>
        <strong>{loadingProfile ? 'Loading profile…' : profile ? 'Connected to Firestore' : 'Profile unavailable'}</strong>
      </div>
      {profileError && <p className="auth-error" role="alert">{profileError}</p>}
      {loadingProfile && <p className="auth-loading" role="status">Loading your profile…</p>}
      <div className="auth-form">
        <Link className="auth-button auth-button-secondary" to="/studio">Open your studio</Link>
        <button className="auth-button" type="button" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </AuthShell>
  )
}

export default AccountPage

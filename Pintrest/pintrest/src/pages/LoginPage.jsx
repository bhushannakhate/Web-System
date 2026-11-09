import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { authErrorMessage } from '../auth/authErrorMessage'
import { useAuth } from '../auth/useAuth'
import AuthShell from '../components/AuthShell'

function LoginPage() {
  const { signIn, signInWithGoogle, configurationError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setCredentials((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function finishSignIn(action) {
    setSubmitting(true)
    setError('')
    try {
      await action()
      navigate(location.state?.from?.pathname || '/account', { replace: true })
    } catch (requestError) {
      setError(authErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    return finishSignIn(() => signIn(credentials.email, credentials.password))
  }

  return (
    <AuthShell title="Welcome back" description="Sign in to pick up where your ideas left off.">
      {configurationError && <p className="auth-config-notice" role="status">{configurationError}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="sign-in-email">Email</label>
          <input id="sign-in-email" name="email" type="email" autoComplete="email" value={credentials.email} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="sign-in-password">Password</label>
          <input id="sign-in-password" name="password" type="password" autoComplete="current-password" value={credentials.password} onChange={handleChange} required />
        </div>
        <div className="auth-links">
          <Link className="auth-link" to="/forgot-password">Forgot password?</Link>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-button" type="submit" disabled={submitting || Boolean(configurationError)}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="auth-divider">or</div>
        <button className="auth-button auth-button-secondary" type="button" onClick={() => finishSignIn(signInWithGoogle)} disabled={submitting || Boolean(configurationError)}>
          Continue with Google
        </button>
      </form>
      <p className="auth-links">
        <span>New to Pinboard Studio?</span>
        <Link className="auth-link" to="/register">Create an account</Link>
      </p>
    </AuthShell>
  )
}

export default LoginPage

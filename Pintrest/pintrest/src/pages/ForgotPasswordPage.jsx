import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { authErrorMessage } from '../auth/authErrorMessage'
import { useAuth } from '../auth/useAuth'

function ForgotPasswordPage() {
  const { resetPassword, configurationError } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setNotice('')
    try {
      await resetPassword(email)
      setNotice('If an account exists for that email, a password-reset link is on its way.')
    } catch (requestError) {
      setError(authErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Reset your password" description="We’ll send a reset link to the email address on your account.">
      {configurationError && <p className="auth-config-notice" role="status">{configurationError}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="reset-email">Email</label>
          <input id="reset-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); setNotice('') }} required />
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p className="auth-success" role="status">{notice}</p>}
        <button className="auth-button" type="submit" disabled={submitting || Boolean(configurationError)}>
          {submitting ? 'Sending link…' : 'Send reset link'}
        </button>
      </form>
      <p className="auth-links"><Link className="auth-link" to="/login">Back to sign in</Link></p>
    </AuthShell>
  )
}

export default ForgotPasswordPage

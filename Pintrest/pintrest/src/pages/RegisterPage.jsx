import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { authErrorMessage } from '../auth/authErrorMessage'
import { useAuth } from '../auth/useAuth'

function RegisterPage() {
  const { register, configurationError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Your passwords do not match.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await register(form.displayName, form.email, form.password)
      navigate('/account', { replace: true })
    } catch (requestError) {
      setError(authErrorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell title="Create your account" description="Save your ideas and keep your creative work together.">
      {configurationError && <p className="auth-config-notice" role="status">{configurationError}</p>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="register-name">Name</label>
          <input id="register-name" name="displayName" autoComplete="name" value={form.displayName} onChange={handleChange} maxLength="80" required />
        </div>
        <div className="auth-field">
          <label htmlFor="register-email">Email</label>
          <input id="register-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="register-password">Password</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" minLength="6" value={form.password} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="register-confirm-password">Confirm password</label>
          <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength="6" value={form.confirmPassword} onChange={handleChange} required />
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="auth-button" type="submit" disabled={submitting || Boolean(configurationError)}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="auth-links">
        <span>Already have an account?</span>
        <Link className="auth-link" to="/login">Sign in</Link>
      </p>
    </AuthShell>
  )
}

export default RegisterPage

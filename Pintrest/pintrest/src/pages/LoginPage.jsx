import { useRef, useState } from 'react'
import './LoginPage.css'

function LoginField({ id, label, ...inputProps }) {
  return (
    <div className="login-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} required {...inputProps} />
    </div>
  )
}

function CreateAccountForm({ onCreate }) {
  const [account, setAccount] = useState({ name: '', email: '', login: '', password: '' })

  function handleChange(event) {
    const { name, value } = event.target
    setAccount((previous) => ({ ...previous, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onCreate(account)
  }

  return (
    <section className="login-card login-create-card" aria-labelledby="create-account-title">
      <h2 id="create-account-title">Create account</h2>
      <p className="login-card-description">Enter details</p>
      <form className="login-form" onSubmit={handleSubmit}>
        <LoginField id="account-name" label="Name" name="name" type="text" autoComplete="name" autoFocus value={account.name} onChange={handleChange} />
        <LoginField id="account-email" label="Email" name="email" type="email" autoComplete="email" value={account.email} onChange={handleChange} />
        <LoginField id="account-login" label="Login" name="login" type="text" autoComplete="username" value={account.login} onChange={handleChange} />
        <LoginField id="account-password" label="Password" name="password" type="password" autoComplete="new-password" value={account.password} onChange={handleChange} />
        <button className="login-button login-button-primary" type="submit">Enter</button>
      </form>
    </section>
  )
}

function LoginPage() {
  const [credentials, setCredentials] = useState({ login: '', password: '' })
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [message, setMessage] = useState('')
  const loginInput = useRef(null)

  function handleLoginChange(event) {
    const { name, value } = event.target
    setCredentials((previous) => ({ ...previous, [name]: value }))
    setMessage('')
  }

  function handleCreateAccount({ login, password }) {
    // Keep the new credentials in the parent when the account form unmounts.
    setCredentials({ login, password })
    setShowCreateAccount(false)
    setMessage('')
    loginInput.current?.focus()
  }

  function handleLoginSubmit(event) {
    event.preventDefault()
    setMessage('')
  }

  return (
    <main className="login-page">
      <header className="login-intro">
        <h1> Log in to Pinboard studio </h1>
      </header>

      <div className={`login-forms${showCreateAccount ? ' is-creating' : ''}`}>
        <section className="login-card" aria-labelledby="sign-in-title">
          <h2 id="sign-in-title">Sign in</h2>
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <LoginField id="sign-in-login" label="Login" name="login" type="text" autoComplete="username" ref={loginInput} value={credentials.login} onChange={handleLoginChange} />
            <LoginField id="sign-in-password" label="Password" name="password" type="password" autoComplete="current-password" value={credentials.password} onChange={handleLoginChange} />
            <button className="login-button login-button-primary" type="submit">Submit</button>
            <button
              className="login-button login-button-secondary"
              type="button"
              aria-expanded={showCreateAccount}
              onClick={() => {
                setShowCreateAccount(true)
                setMessage('')
              }}
            >
              Create account
            </button>
          </form>
          <p className="login-status" role="status">{message}</p>
        </section>

        {showCreateAccount && <CreateAccountForm onCreate={handleCreateAccount} />}
      </div>
    </main>
  )
}

export default LoginPage

import './AuthShell.css'

function AuthShell({ eyebrow = 'PINBOARD STUDIO', title, description, children }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-eyebrow">{eyebrow}</p>
        <h1 id="auth-title">{title}</h1>
        {description && <p className="auth-description">{description}</p>}
        {children}
      </section>
    </main>
  )
}

export default AuthShell

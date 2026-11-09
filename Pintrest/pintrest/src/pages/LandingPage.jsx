import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import './LandingPage.css'

function LandingPage() {
  const { user } = useAuth()

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <p className="page-eyebrow"><span /> Your creative space</p>
        <h1>Make room for <em>ideas.</em></h1>
        <p className="landing-copy">Collect inspiration, shape your next idea, and keep your creative work in one calm place.</p>
        <div className="landing-actions">
          <Link className="landing-primary" to={user ? '/studio' : '/register'}>
            {user ? 'Open your studio' : 'Create your account'}
          </Link>
          {!user && <Link className="landing-secondary" to="/login">Sign in</Link>}
        </div>
      </section>
      <section className="landing-note" aria-label="About Pinboard Studio">
        <span>01</span>
        <p>A little space for big ideas.</p>
      </section>
    </main>
  )
}

export default LandingPage

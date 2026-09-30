import { Link } from 'react-router-dom'
import './AboutPage.css'

const principles = [
  {
    number: '01',
    title: 'Creativity comes first',
    description: 'A good idea can start anywhere. We make it easier to give your inspiration a clear direction.',
  },
  {
    number: '02',
    title: 'Simple by design',
    description: 'The tools should feel approachable, so you can spend less time figuring things out and more time creating.',
  },
  {
    number: '03',
    title: 'Made for sharing',
    description: 'Shape your visual ideas into something you are excited to save, revisit, and share.',
  },
]

function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-copy">
          <p className="page-eyebrow"><span /> A little about us</p>
          <h1 id="about-title">Good ideas deserve <em>a place to grow.</em></h1>
          <p className="about-intro">Pinboard Studio is a simple creative space for shaping visual ideas. Start with an image, add your direction, and make room for what comes next.</p>
          <Link className="about-cta" to="/">Explore the studio <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="about-art" role="img" aria-label="Abstract illustration of colorful creative ideas">
          <div className="art-orbit art-orbit-one" />
          <div className="art-orbit art-orbit-two" />
          <div className="art-sun" />
          <div className="art-card art-card-one"><span>IDEA</span><b>✳</b></div>
          <div className="art-card art-card-two"><span>MAKE</span><b>↗</b></div>
          <span className="art-spark art-spark-one">✳</span>
          <span className="art-spark art-spark-two">✦</span>
        </div>
      </section>

      <section className="about-principles" aria-labelledby="principles-title">
        <div className="section-heading">
          <p className="page-eyebrow"><span /> What we believe</p>
          <h2 id="principles-title">A thoughtful start makes all the difference.</h2>
        </div>
        <div className="principle-grid">
          {principles.map((principle) => (
            <article className="principle-card" key={principle.number}>
              <span className="principle-number">{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-bottom-cta">
        <p>Have a question or an idea to share?</p>
        <Link to="/contact">We would love to hear from you <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  )
}

export default AboutPage
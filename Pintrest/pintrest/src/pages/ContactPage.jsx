import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import './ContactPage.css'

function ContactPage() {
  const [emailPrepared, setEmailPrepared] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const recipients = [
      'bnakhate@horizon.csueastbay.edu',
      'ssotomejia@horizon.csueastbay.edu',
      'rtorres32@horizon.csueastbay.edu',
    ]
    const subject = `Pinboard Studio contact: ${formData.get('topic')}`
    const body = [
      `Name: ${formData.get('name')}`,
      `Email: ${formData.get('email')}`,
      `Topic: ${formData.get('topic')}`,
      '',
      formData.get('message'),
    ].join('\n')
    const mailtoUrl = `mailto:${recipients.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    setEmailPrepared(true)
    window.location.href = mailtoUrl
  }

  return (
    <main className="bootstrap-page contact-page container">
      <section className="contact-intro" aria-labelledby="contact-title">
        <p className="page-eyebrow"><span /> Get in touch</p>
        <h1 id="contact-title">We are all <em>ears.</em></h1>
        <p>Questions, feedback, or a bright idea? Send a note. We are always glad to hear what you are making.</p>
      </section>

      <div className="contact-layout row g-0">
        <aside className="contact-aside col-12 col-md-5" aria-label="Contact information">
          <div className="contact-note-mark" aria-hidden="true">✳</div>
          <h2>Every good collaboration starts with a conversation.</h2>
          <p>Tell us what is on your mind. Share a little context and we will take it from there.</p>
          <div className="contact-aside-rule" />
          <div className="contact-aside-small">
            <span>YOUR MESSAGE GOES TO</span>
            <ul className="contact-recipient-list">
              <li>bnakhate@horizon.csueastbay.edu</li>
              <li>ssotomejia@horizon.csueastbay.edu</li>
              <li>rtorres32@horizon.csueastbay.edu</li>
            </ul>
          </div>
        </aside>

        <section className="contact-form-wrap col-12 col-md-7" aria-label="Send us a message">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-field-row row g-3">
              <div className="contact-field col-12 col-md-6">
                <label className="form-label" htmlFor="contact-name">Your name <span aria-hidden="true">*</span></label>
                <input className="form-control" id="contact-name" name="name" type="text" autoComplete="name" placeholder="Jane Smith" required />
              </div>
              <div className="contact-field col-12 col-md-6">
                <label className="form-label" htmlFor="contact-email">Email address <span aria-hidden="true">*</span></label>
                <input className="form-control" id="contact-email" name="email" type="email" autoComplete="email" placeholder="jane@example.com" required />
              </div>
            </div>

            <div className="contact-field">
              <label className="form-label" htmlFor="contact-topic">What is this about?</label>
              <select className="form-select" id="contact-topic" name="topic" defaultValue="" required>
                <option value="" disabled>Choose a topic</option>
                <option value="feedback">Feedback or suggestion</option>
                <option value="question">A question</option>
                <option value="other">Something else</option>
              </select>
            </div>

            <div className="contact-field">
              <label className="form-label" htmlFor="contact-message">Your message <span aria-hidden="true">*</span></label>
              <textarea className="form-control" id="contact-message" name="message" placeholder="Tell us a little about it..." rows="5" required />
            </div>

            <div className="contact-form-footer">
              <p>This opens your email app so you can send your message.</p>
              <button className="btn btn-dark" type="submit">Open email app <span aria-hidden="true">↗</span></button>
            </div>
            {emailPrepared && <p className="contact-confirmation alert alert-success" role="status">Your email app should open with the recipients and message filled in. Review it and press Send to deliver it.</p>}
          </form>
        </section>
      </div>
    </main>
  )
}

export default ContactPage
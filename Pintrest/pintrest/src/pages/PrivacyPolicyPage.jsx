import { Link } from 'react-router-dom'
import './PrivacyPolicyPage.css'

function PrivacyPolicyPage() {
  return (
    <main className="privacy-page">
      <header className="privacy-header">
        <p className="page-eyebrow"><span /> Your data, your choice</p>
        <h1>Privacy <em>policy.</em></h1>
        <p className="privacy-updated">Effective November 11, 2026</p>
        <p className="privacy-intro">
          Pinboard Studio helps you work with images you choose. We use personal
          information only to provide, protect, and improve the features you
          request. We do not sell your personal information or use it for
          unrelated advertising.
        </p>
      </header>

      <div className="privacy-content">
        <section aria-labelledby="privacy-information">
          <h2 id="privacy-information">Information we handle</h2>
          <ul>
            <li>
              <strong>Account information:</strong> your email address, display
              name, and account identifier. Firebase Authentication handles
              sign-in credentials; Pinboard Studio does not receive or store
              your account password.
            </li>
            <li>
              <strong>Content you provide:</strong> images you select or upload,
              editing instructions, optional voice recordings, and the edited
              results and related creation details you choose to save.
            </li>
            <li>
              <strong>Google Photos data:</strong> when you separately connect
              Google Photos, we receive only the photos you select through
              Google's Picker. We create a private Pinboard copy of an image
              only after you choose to import it. The original remains in your
              Google Photos account.
            </li>
            <li>
              <strong>Basic service information:</strong> information needed to
              operate the service, keep accounts secure, and troubleshoot
              errors.
            </li>
          </ul>
        </section>

        <section aria-labelledby="privacy-use">
          <h2 id="privacy-use">How we use your information</h2>
          <p>
            We use account information to sign you in and provide your account.
            We use selected images and your instructions to provide the
            requested image editing experience, and to save or return results
            to you. Google Photos access is separate from Firebase sign-in;
            we request access only to items you select in Picker. We use an
            imported image only for the Pinboard feature you requested. We do
            not modify or publish the original in Google Photos.
          </p>
          <p>
            When you request AI image editing, the relevant image and
            instruction are sent to Google Gemini for analysis and generation.
            If voice features are used, audio may also be processed to produce
            your instruction text. Google processes that information to provide
            the requested service under its applicable terms and privacy
            practices. See{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              Google's Privacy Policy
            </a>
            .
          </p>
          <p>
            We do not sell, rent, or use your images, Google Photos data, or
            instructions for unrelated advertising. We do not use your content
            to train our own AI models.
          </p>
        </section>

        <section aria-labelledby="privacy-storage">
          <h2 id="privacy-storage">Where information is stored</h2>
          <p>
            Account information is managed with Firebase Authentication.
            Images, audio, and creation information may be stored in our Google
            Firebase and Google Cloud services so we can provide saved
            creations and account features. Access tokens and other connection
            data are used only to support the Google Photos features you
            authorize. Google Photos tokens are encrypted by the API before
            they are stored and are not placed in the browser or returned to
            the frontend. Imported images are validated and stored privately
            with your Pinboard creation.
          </p>
          <p>
            We keep information for as long as needed to provide the service,
            maintain your account and saved creations, and meet applicable
            obligations. You can ask us to delete your account or saved
            information using our <Link to="/contact">contact page</Link>.
            Some information may remain for a limited time in backups or where
            retention is required for security or legal reasons.
          </p>
        </section>

        <section aria-labelledby="privacy-sharing">
          <h2 id="privacy-sharing">When information is shared</h2>
          <p>
            We share information only as needed to operate features you ask
            for, including with Google services such as Firebase, Google Cloud,
            Google Photos, and Gemini to provide the features you request.
            These providers process information under their own applicable
            terms and privacy policies. We do not share your information with
            data brokers or for third-party advertising. Google's privacy
            practices are described in its{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="privacy-controls">
          <h2 id="privacy-controls">Your choices and connected accounts</h2>
          <p>
            Connecting Google Photos is optional. You choose the items shared
            with Pinboard and can disconnect from the photo workflow or revoke
            access in your Google Account settings. Disconnecting revokes our
            stored authorization and prevents future Picker requests; it does
            not remove copies you already imported into Pinboard or delete the
            original photos. Delete a Pinboard creation to remove its stored
            media. You may also contact us to request access to, correction of,
            or deletion of your account information, subject to applicable law.
          </p>
        </section>

        <section aria-labelledby="privacy-security">
          <h2 id="privacy-security">Security and policy updates</h2>
          <p>
            We use Firebase and Google Cloud services to support account and
            content storage. No online service can guarantee absolute
            security, but we work to protect information from unauthorized
            access. We may update this policy as the service changes. The
            effective date above indicates the latest revision.
          </p>
        </section>

        <section aria-labelledby="privacy-contact">
          <h2 id="privacy-contact">Contact us</h2>
          <p>
            For privacy questions or data requests, please use the{' '}
            <Link to="/contact">Pinboard Studio contact page</Link>.
          </p>
        </section>
      </div>
    </main>
  )
}

export default PrivacyPolicyPage

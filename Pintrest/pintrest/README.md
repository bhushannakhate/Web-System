# Project One — Pinboard Studio UI

React and Vite frontend for Pinboard Studio, including the Project 2 Firebase Authentication and Firestore account experience.

## Deployment

- **Combined frontend and API:** https://project-2-api-m5lsuu6ouq-uc.a.run.app
- **Firebase Hosting fallback:** https://project-2-pinboard-2026.web.app
- **Google Cloud project:** `project-2-pinboard-2026`
- **Private ADK agent service:** https://pinboard-adk-adiuzklbmq-uc.a.run.app (separate project/service)

Production builds package the Vite frontend and Express API in one Docker image.
The backend repository's Dockerfile takes this project as a named Buildx context
and serves the built UI and `/api` from the same Cloud Run origin. Set
`VITE_API_BASE_URL` to an empty string for that same-origin deployment; pass the
Firebase web settings as Vite build arguments. These browser settings are public,
but Firebase/service-account credentials and OAuth secrets must never be passed
to the frontend build.

Follow the [backend deployment guide](https://github.com/bhushannakhate/project-2#combined-frontend-and-api-image)
for the complete image build, Artifact Registry push, Cloud Run deployment,
Firebase authorized-domain, and media-bucket CORS steps. The previous
Firebase Hosting static deployment remains available as a fallback:

```bash
npm run build
npx firebase-tools deploy --only hosting --project project-2-pinboard-2026
```

The default `web.app` domain is already authorized for Firebase Authentication. Hosting has a no-cost quota; this project is on the Blaze plan, so usage beyond included quotas may be billed.

## Project 2 API endpoints

The Project 2 API provides Firebase-authenticated profile and creation endpoints plus the opt-in demo customer API. The account page currently calls `GET /api/users/me`; the API supports these other protected endpoints as well. Set `VITE_API_BASE_URL` at build time to the API origin.

| Method   | Endpoint                                                              | UI action                                                             |
| -------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `GET`    | `/api/health`                                                         | Check API availability.                                               |
| `GET`    | `/api/users/me`                                                       | Initialize/load the signed-in user's Firestore profile.               |
| `PATCH`  | `/api/users/me`                                                       | Update the signed-in user's allowed profile fields.                   |
| `GET`    | `/api/creations`                                                      | List the signed-in user's creations.                                  |
| `GET`    | `/api/creations/:creationId`                                          | Load one owned creation.                                              |
| `POST`   | `/api/creations`                                                      | Create a user-owned creation.                                         |
| `PATCH`  | `/api/creations/:creationId`                                          | Update an owned creation.                                             |
| `DELETE` | `/api/creations/:creationId`                                          | Soft-delete an owned creation.                                        |
| `POST`   | `/api/creations/:creationId/media/sourceImage/uploads`                | Create a short-lived source-image upload.                             |
| `POST`   | `/api/creations/:creationId/media/uploads/:uploadId/complete`         | Validate and attach a source image to the creation.                   |
| `GET`    | `/api/google-photos/connection`                                       | Read the signed-in user's Google Photos connection status.            |
| `POST`   | `/api/google-photos/oauth/authorize`                                  | Start the separate Google Photos OAuth consent flow.                  |
| `DELETE` | `/api/google-photos/connection`                                       | Revoke and disconnect Google Photos.                                  |
| `POST`   | `/api/creations/:creationId/google-photos/sessions`                   | Start an owner-bound Picker session for a draft.                      |
| `GET`    | `/api/google-photos/sessions/:sessionId`                              | Poll the Picker session.                                              |
| `GET`    | `/api/google-photos/sessions/:sessionId/media-items`                  | List items explicitly selected in that Picker session.                |
| `POST`   | `/api/creations/:creationId/google-photos/sessions/:sessionId/import` | Import one selected image through server validation and storage.      |
| `POST`   | `/api/creations/:creationId/google-photos/save`                       | Save an owned source or generated image to the user's Photos library. |
| `DELETE` | `/api/google-photos/sessions/:sessionId`                              | Cancel a Picker session.                                              |

The UI obtains a fresh Firebase ID token before calling protected routes and sends it as a bearer token.

After the AI workflow creates an output, the owner can approve it or request one
revision with a revision instruction. Approval is required before the UI offers
Google Photos export. Export asks for a separate confirmation, creates a new
Google Photos item, never changes the selected original, and prevents accidental
duplicate retries for the same approved creation.

### Voice transcription and Gemini consent

After an audio upload is completed, the workflow can call
`POST /api/creations/:creationId/transcription` to create a transcript. The
authenticated owner can review and edit that text in the UI; saving uses
`PATCH /api/creations/:creationId/transcription`. Starting the image workflow
then sends the edited transcript, when present, to the backend. The UI displays
the in-context Gemini disclosure and requires the user to check the consent box;
the API independently enforces `consentToGemini: true`. The browser calls only
Express, never the private ADK service, and does not receive signed media URLs.

On the photo workflow, a signed-in user can upload one JPEG, PNG, or WebP image up to 10 MB or separately connect Google Photos and choose items in Google's Picker. OAuth uses a distinct, server-managed authorization for the Picker media-items scope and the append-only scope needed to save a photo; Firebase sign-in alone does not grant Photos access. The API binds each Picker session to the signed-in user and draft, polls using Google's recommended intervals, and offers only selected photos. When one photo is imported, the backend retrieves its temporary bytes and runs them through the same actual-byte validation, normalization, private storage, and cleanup lifecycle used by device uploads. When the user chooses Save to Google Photos, the API uploads the selected or generated image to their library. Temporary Google Photos URLs are not shown to the browser or saved. The user can revoke the connection from the workflow. Sample photos remain local demo assets and are not Google Photos data.

## Application routes

- `/` — Pinboard Studio photo workflow
- `/about` — about Pinboard Studio
- `/contact` — contact page
- `/login` — Firebase email/password or Google sign-in
- `/register` — Firebase account registration
- `/forgot-password` — Firebase password reset email
- `/account` — protected Firebase and Firestore account view
- `/studio` — legacy URL redirects to the current photo workflow

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the Firebase Web App values from Firebase Console → Project settings → Your apps. The client API key and app ID are Firebase web configuration, not service-account credentials; never put a service-account JSON in this frontend. Enable Email/Password and Google under Firebase Authentication → Sign-in method. The default Firebase Hosting domain is authorized automatically.

Google Photos OAuth credentials and the token-encryption key are API-only settings. Configure the OAuth callback URI, Picker API, and Library API in Google Cloud, then set the server-side `GOOGLE_PHOTOS_*` variables described in the Project 2 API README. Never add those secrets to `VITE_*` variables. Google OAuth callback results return to the frontend origin that initiated the connection.

Leave `VITE_API_BASE_URL` empty for local development (the Vite proxy forwards
`/api` to `http://localhost:4000`) and the combined frontend/API Cloud Run
image (same-origin requests). If deploying the UI separately to Firebase
Hosting, set it to the API origin:

```dotenv
VITE_API_BASE_URL=https://project-2-api-m5lsuu6ouq-uc.a.run.app
```

To enable Google Analytics 4, set `VITE_GA4_MEASUREMENT_ID` to the web stream's
Measurement ID (`G-...`) in `.env.local` before starting Vite or building; both
Firebase Hosting and the combined Docker image embed Vite environment variables
at build time rather than injecting them at runtime. The React app records route pageviews and
agent workflow starts. It forwards the GA client/session IDs with the agent
request so the Express API can associate its outcome event with that visitor.
Never put the GA Measurement Protocol API secret in this frontend; configure
`GA4_MEASUREMENT_ID` and `GA4_API_SECRET` only in the Express API environment.

For local development, `vite.config.js` proxies `/api` requests to `http://localhost:4000`.

## Testing

```bash
npm run check
```

The check runs ESLint, the Vitest frontend/API contract tests, and the Vite
production build. The focused test command is `npm test`; use `npm run build`
when only the deployable static bundle needs to be rebuilt. The backend's
combined Docker build packages the resulting `dist/` directory and serves the
frontend and API from the same Cloud Run origin.

## Issue implementation log

- **Project 2 issue #11 — React sign-in and account experience:** Added Firebase email/password registration and sign-in, Google sign-in, password reset, auth-state/token refresh handling, protected routes, an account view, and authenticated Firestore API requests. The implementation is in this frontend repository. See [issue #11](https://github.com/bhushannakhate/project-2/issues/11) and [implementation PR #27](https://github.com/bhushannakhate/Web-System/pull/27).

## Build

```bash
npm run build
```

The static output is written to `dist/`. The combined backend Docker build copies
this directory into the Express image, which serves the SPA and API on one origin.

## Contact form

The contact form opens the visitor's configured email app with the three project addresses, subject, and message already filled in. The visitor reviews the draft and presses Send. This does not require a mail provider account or API key, but the visitor needs an email app or mail handler configured on their device.

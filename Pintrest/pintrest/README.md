# Project One — Pinboard Studio UI

React and Vite frontend for Pinboard Studio, including the Project 2 Firebase Authentication and Firestore account experience.

## Deployment

- **UI:** https://project-2-pinboard-2026.web.app
- **Customers page:** https://project-2-pinboard-2026.web.app/customers
- **Google Cloud project:** `project-2-pinboard-2026`
- **API base URL:** https://project-2-api-m5lsuu6ouq-uc.a.run.app
- The previous Cloud Run UI remains available at https://project-1-ui-m5lsuu6ouq-uc.a.run.app; Firebase Hosting is the canonical UI for authentication.

Deploy the static app to Firebase Hosting after building:

```bash
npm run build
npx firebase-tools deploy --only hosting --project project-2-pinboard-2026
```

The default `web.app` domain is already authorized for Firebase Authentication. Hosting has a no-cost quota; this project is on the Blaze plan, so usage beyond included quotas may be billed.

## Project 2 API endpoints

The Project 2 API provides Firebase-authenticated profile and creation endpoints plus the opt-in demo customer API. The account page currently calls `GET /api/users/me`; the API supports these other protected endpoints as well. Set `VITE_API_BASE_URL` at build time to the API origin.

| Method | Endpoint | UI action |
|---|---|---|
| `GET` | `/api/health` | Check API availability. |
| `GET` | `/api/users/me` | Initialize/load the signed-in user's Firestore profile. |
| `PATCH` | `/api/users/me` | Update the signed-in user's allowed profile fields. |
| `GET` | `/api/creations` | List the signed-in user's creations. |
| `GET` | `/api/creations/:creationId` | Load one owned creation. |
| `POST` | `/api/creations` | Create a user-owned creation. |
| `PATCH` | `/api/creations/:creationId` | Update an owned creation. |
| `DELETE` | `/api/creations/:creationId` | Soft-delete an owned creation. |
| `POST` | `/api/creations/:creationId/media/sourceImage/uploads` | Create a short-lived source-image upload. |
| `POST` | `/api/creations/:creationId/media/uploads/:uploadId/complete` | Validate and attach a source image to the creation. |
| `GET` | `/api/google-photos/connection` | Read the signed-in user's Google Photos connection status. |
| `POST` | `/api/google-photos/oauth/authorize` | Start the separate Google Photos OAuth consent flow. |
| `DELETE` | `/api/google-photos/connection` | Revoke and disconnect Google Photos. |
| `POST` | `/api/creations/:creationId/google-photos/sessions` | Start an owner-bound Picker session for a draft. |
| `GET` | `/api/google-photos/sessions/:sessionId` | Poll the Picker session. |
| `GET` | `/api/google-photos/sessions/:sessionId/media-items` | List items explicitly selected in that Picker session. |
| `POST` | `/api/creations/:creationId/google-photos/sessions/:sessionId/import` | Import one selected image through server validation and storage. |
| `DELETE` | `/api/google-photos/sessions/:sessionId` | Cancel a Picker session. |

The UI obtains a fresh Firebase ID token before calling protected routes and sends it as a bearer token. The demo customer directory is available at `/customers` only to verified Firebase accounts configured in the API's server-only `ADMIN_EMAILS` allowlist. Its API routes independently enforce administrator access; changing frontend state cannot grant access.

On the photo workflow, a signed-in user can upload one JPEG, PNG, or WebP image up to 10 MB or separately connect Google Photos and choose items in Google's Picker. OAuth uses a distinct, server-managed authorization with only the Picker media-items scope; Firebase sign-in alone does not grant Photos access. The API binds each Picker session to the signed-in user and draft, polls using Google's recommended intervals, and offers only selected photos. When one photo is imported, the backend retrieves its temporary bytes and runs them through the same actual-byte validation, normalization, private storage, and cleanup lifecycle used by device uploads. Temporary Google Photos URLs are not shown to the browser or saved. The user can revoke the connection from the workflow. Sample photos remain local demo assets and are not Google Photos data.

## Application routes

- `/` — Pinboard Studio photo workflow
- `/about` — about Pinboard Studio
- `/contact` — contact page
- `/login` — Firebase email/password or Google sign-in
- `/register` — Firebase account registration
- `/forgot-password` — Firebase password reset email
- `/account` — protected Firebase and Firestore account view
- `/studio` — legacy URL redirects to the current photo workflow
- `/customers` — customer directory and CRUD form

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the Firebase Web App values from Firebase Console → Project settings → Your apps. The client API key and app ID are Firebase web configuration, not service-account credentials; never put a service-account JSON in this frontend. Enable Email/Password and Google under Firebase Authentication → Sign-in method. The default Firebase Hosting domain is authorized automatically.

Google Photos OAuth credentials and the token-encryption key are API-only settings. Configure the OAuth callback URI and Picker API in Google Cloud, then set the server-side `GOOGLE_PHOTOS_*` variables described in the Project 2 API README. Never add those secrets to `VITE_*` variables. Google OAuth callback results return to the frontend origin that initiated the connection.

Set `VITE_API_BASE_URL` to the API base URL:

```dotenv
VITE_API_BASE_URL=https://project-2-api-m5lsuu6ouq-uc.a.run.app
```

For local development, `vite.config.js` proxies `/api` requests to `http://localhost:4000`.

## Issue implementation log

- **Project 2 issue #11 — React sign-in and account experience:** Added Firebase email/password registration and sign-in, Google sign-in, password reset, auth-state/token refresh handling, protected routes, an account view, and authenticated Firestore API requests. The implementation is in this frontend repository because the React UI is deployed separately from the Project 2 API. See [issue #11](https://github.com/bhushannakhate/project-2/issues/11) and [implementation PR #27](https://github.com/bhushannakhate/Web-System/pull/27).

## Build

```bash
npm run build
```

The static output is written to `dist/` and served by Apache in the Cloud Run container.

## Contact form

The contact form opens the visitor's configured email app with the three project addresses, subject, and message already filled in. The visitor reviews the draft and presses Send. This does not require a mail provider account or API key, but the visitor needs an email app or mail handler configured on their device.

# Project One — Pinboard Studio UI

React and Vite frontend for Pinboard Studio, including the Project 2 Firebase Authentication and Firestore account experience.

## Deployment

- **UI service:** https://project-1-ui-m5lsuu6ouq-uc.a.run.app
- **Customers page:** https://project-1-ui-m5lsuu6ouq-uc.a.run.app/customers
- **Google Cloud project:** `project-2-pinboard-2026`
- **Region:** `us-central1`
- **API base URL:** https://project-2-api-m5lsuu6ouq-uc.a.run.app

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

The UI obtains a fresh Firebase ID token before calling protected routes and sends it as a bearer token. The demo customer directory is retained at `/customers`; it is not part of the authenticated Firestore API.

## Application routes

- `/` — Pinboard Studio landing page
- `/about` — about Pinboard Studio
- `/contact` — contact page
- `/login` — Firebase email/password or Google sign-in
- `/register` — Firebase account registration
- `/forgot-password` — Firebase password reset email
- `/account` — protected Firebase and Firestore account view
- `/studio` — protected artwork form
- `/customers` — customer directory and CRUD form

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the Firebase Web App values from Firebase Console → Project settings → Your apps. The client API key and app ID are Firebase web configuration, not service-account credentials; never put a service-account JSON in this frontend. Enable Email/Password and Google under Firebase Authentication → Sign-in method, and add the deployed UI domain to Authorized domains.

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

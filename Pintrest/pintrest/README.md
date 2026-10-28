# Project One — Pinboard Studio UI

React and Vite frontend for Pinboard Studio. The deployed customer directory uses the Project 2 Customer API.

## Deployment

- **UI service:** https://project-1-ui-m5lsuu6ouq-uc.a.run.app
- **Customers page:** https://project-1-ui-m5lsuu6ouq-uc.a.run.app/customers
- **Google Cloud project:** `project-2-pinboard-2026`
- **Region:** `us-central1`
- **API base URL:** https://project-2-api-m5lsuu6ouq-uc.a.run.app

## API endpoints used by the UI

The Customer API provides these endpoints. The customer directory calls the four CRUD endpoints from `src/pages/CustomersPage.jsx`; `/api/health` is available for availability checks. Set `VITE_API_BASE_URL` at build time to the API origin.

| Method | Endpoint | UI action |
|---|---|---|
| `GET` | `/api/health` | Check API availability. |
| `GET` | `/api/customers?limit=10` | Load the customer directory and refresh records. |
| `POST` | `/api/customers` | Create a customer from the directory form. |
| `PATCH` | `/api/customers/:id` | Update the selected customer. |
| `DELETE` | `/api/customers/:id` | Permanently remove the selected customer. |

## Application routes

- `/` — artwork form
- `/about` — about Pinboard Studio
- `/contact` — contact page
- `/login` — login page
- `/customers` — customer directory and CRUD form

## Run locally

```bash
npm install
npm run dev
```

Create `.env.production` or set `VITE_API_BASE_URL` to the API base URL:

```dotenv
VITE_API_BASE_URL=https://project-2-api-m5lsuu6ouq-uc.a.run.app
```

For local development, `vite.config.js` proxies `/api` requests to `http://localhost:4000`.

## Build

```bash
npm run build
```

The static output is written to `dist/` and served by Apache in the Cloud Run container.

## Contact form

The contact form opens the visitor's configured email app with the three project addresses, subject, and message already filled in. The visitor reviews the draft and presses Send. This does not require a mail provider account or API key, but the visitor needs an email app or mail handler configured on their device.

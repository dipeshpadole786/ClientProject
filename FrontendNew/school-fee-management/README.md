# School Fee Management System (Teacher Only)

A clean, minimal React + Vite + Tailwind CSS frontend for managing student fees.
This is a frontend-only project using mock/static data — no backend, database, or API integration.

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (usually http://localhost:5173).

## Demo Login

- Email: `teacher@school.com`
- Password: `admin123`

## Tech Stack

- React 18 (functional components + hooks only)
- Vite
- Tailwind CSS
- React Router v6
- react-icons

## Project Structure

```
src/
├── pages/          Route-level pages (Login, Dashboard, Students, etc.)
├── components/      Reusable UI pieces (Navbar, Sidebar, tables, cards...)
├── layouts/         DashboardLayout wraps all protected pages
├── services/api.js  Mock API layer — swap with real HTTP calls later
├── App.jsx          Route definitions
└── main.jsx         App entry point
```

## Notes

- All data (students, payments) lives in-memory inside `src/services/api.js`.
  Refreshing the page resets it to the seed data.
- Auth state is stored in `localStorage` under `sfms_auth_token` purely to
  persist the login session across refreshes — there is no real backend.
- To connect a real backend later, replace the functions in
  `src/services/api.js` with actual `fetch`/`axios` calls; no other file
  needs to change.

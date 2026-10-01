# Sky N news: frontend

React + Vite. Pages in `src/pages`, reusable pieces in `src/components`, all styles in `src/styles.css`.

- `npm install` once, then `npm run dev` (opens on http://localhost:5173).
- Backend address for development: `BACKEND` in `vite.config.js`.
- `npm run build` creates `dist/`. Serve that folder from the Python backend and send every non-`/api` path to `dist/index.html`, so links like `/article/some-slug` work on refresh.

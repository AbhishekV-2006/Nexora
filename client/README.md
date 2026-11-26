# Nexora Client

React 18 and Vite frontend for Nexora. For local setup, production deployment, and the complete environment-variable list, see the [project README](../README.md).

## Commands

- `npm ci` installs the locked dependencies.
- `npm run dev` starts the local client at `http://localhost:5173`.
- `npm run build` creates the production site in `dist/`.
- `npm run preview` serves the production build locally.

Set `VITE_API_URL` to the backend API base URL, including `/api`. The local default is `http://localhost:5001/api`. Configure your static host to rewrite application routes to `index.html`.

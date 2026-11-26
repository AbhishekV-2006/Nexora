# Nexora Client

React 18/Vite frontend. The production build is served by the Express API from the same Render web service. See the [project README](../README.md) for one-service deployment and environment setup.

## Commands

- `npm ci` installs the locked client dependencies.
- `npm run dev` starts Vite at `http://localhost:5173` and proxies `/api` to port `5001`.
- `npm run build` creates the production SPA in `dist/`.
- `npm run preview` previews the production build locally.

`VITE_API_URL` is optional. Leave it unset for same-origin `/api`; set the full API URL ending in `/api` only when deploying the API separately.

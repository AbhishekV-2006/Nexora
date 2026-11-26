# Nexora

Nexora is a React/Vite freelancer marketplace with an Express API, MongoDB persistence, and Socket.IO WebSocket chat. In production, the Express service serves both the API and the built single-page app.

## Deploy the whole app to Render

1. Push this repository to GitHub.
2. In Render, create a **Blueprint** from the repository. Render reads [`render.yaml`](render.yaml) and creates one web service named `nexora`.
3. When prompted, provide `MONGO_URI` for a MongoDB database reachable from Render. The Blueprint generates a `JWT_SECRET` for you.
4. Deploy. The build installs both lockfiles, builds the Vite client, then starts Express. The app and API share one Render URL; SPA routes such as `/messages` also load on refresh.

Render web services support inbound WebSocket connections. The app uses authenticated Socket.IO WebSocket transport for live messages. See [Render WebSockets](https://render.com/docs/websocket) and the [Blueprint specification](https://render.com/docs/blueprint-spec).

The free service uses ephemeral local storage, so uploaded avatars may disappear when the service restarts or redeploys. If persistent avatars matter, move storage to a persistent disk or object store.

## Environment variables

| Variable | Used by | Required | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | Server | Yes | MongoDB connection string |
| `JWT_SECRET` | Server | Yes | Private token signing secret (Render can generate this) |
| `CLIENT_URL` | Server | No | Additional allowed browser origins; same-origin production is permitted automatically (local default is Vite at port `5173`) |
| `PORT` | Server | Host supplied | Port for Express and WebSockets |
| `NODE_ENV` | Server | Recommended | Set to `production` on Render |
| `UPLOAD_DIR` | Server | No | Avatar directory; point this at persistent storage if configured |
| `VITE_API_URL` | Client build | No | Leave unset for same-origin `/api`; use full `https://api-host/api` only if splitting services |

Do not commit `.env` files or put server secrets in `VITE_*` values. Vite variables are public in the browser bundle.

## Run locally

Requirements: Node.js 20 or newer and MongoDB (local or hosted). Copy [server/.env.example](server/.env.example) to `server/.env` and set `MONGO_URI` plus a random `JWT_SECRET` of at least 32 characters. [client/.env.example](client/.env.example) can be copied to `client/.env`; the API URL is optional.

Start each service in a terminal:

```powershell
cd server
npm ci
npm run dev
```

```powershell
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend on port `5001`. The API health endpoint is `http://localhost:5001/api/health`.

## Chat

Users can start a conversation from a public profile or job page. Message history is stored in MongoDB and delivered over authenticated WebSockets. REST endpoints under `/api/messages` create conversations and load history.

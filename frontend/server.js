// Serves the built React site and forwards /api requests to the Python backend.
// Used on Railway: this is the "frontend" service.
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createProxyMiddleware } from 'http-proxy-middleware'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, 'dist')

const BACKEND_URL = process.env.BACKEND_URL
const PORT = process.env.PORT || 3000

if (!BACKEND_URL) {
  console.warn('BACKEND_URL is not set. Requests to /api will fail until you add it.')
}

const app = express()

// 1. /api/... goes to the backend (same web address for the browser, so admin login cookies work)
app.use(
  createProxyMiddleware({
    target: BACKEND_URL || 'http://localhost:3000',
    changeOrigin: true,
    pathFilter: '/api',
  })
)

// 2. Built React files
app.use(express.static(dist))

// 3. Any other address (like /article/some-slug or /admin) opens the React app
app.use((req, res) => res.sendFile(path.join(dist, 'index.html')))

app.listen(PORT, '0.0.0.0', () => console.log(`Frontend running on port ${PORT}`))
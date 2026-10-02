// All admin backend calls live here.

export class UnauthorizedError extends Error {}

async function request(path, method = 'GET', body) {
  const res = await fetch('/api/admin/' + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) throw new UnauthorizedError('Signed out')

  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!res.ok && data && data.error) throw new Error(data.error)
  if (!res.ok && data === null) throw new Error('Something went wrong. Try again.')
  return data
}

// Returns true when the password is right, false when it is wrong.
export async function adminLogin(password) {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  return res.ok
}

export const checkSession = () => request('stats')

export const getArticles = (status) => request(`articles?status=${encodeURIComponent(status)}`)
export const updateArticle = (id, fields) => request(`articles/${id}`, 'PUT', fields)
export const articleAction = (id, action) => request(`articles/${id}/${action}`, 'POST')
export const deleteArticle = (id) => request(`articles/${id}`, 'DELETE')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Starts the fetch on the server (returns instantly), then polls until it finishes.
// Resolves with { added, errors } so callers work exactly as before.
export async function fetchNow() {
  await request('fetch', 'POST')

  const POLL_MS = 3000
  const MAX_WAIT_MS = 10 * 60 * 1000
  const started = Date.now()

  while (Date.now() - started < MAX_WAIT_MS) {
    await sleep(POLL_MS)
    const status = await request('fetch/status')
    if (status && !status.running) {
      const last = status.last || {}
      return { added: last.added || 0, errors: last.errors || [] }
    }
  }
  return {
    added: 0,
    errors: ['Still running in the background. Refresh the Drafts tab in a few minutes.'],
  }
}

export const getSources = () => request('sources')
export const addSource = (source) => request('sources', 'POST', source)
export const removeSource = (id) => request(`sources/${id}`, 'DELETE')
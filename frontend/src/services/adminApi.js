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
export const fetchNow = () => request('fetch', 'POST')

export const getSources = () => request('sources')
export const addSource = (source) => request('sources', 'POST', source)
export const removeSource = (id) => request(`sources/${id}`, 'DELETE')

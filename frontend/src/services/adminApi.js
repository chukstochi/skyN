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

// Your own article: { title, summary, category, author, image, video, body, publish }
export const createArticle = (fields) => request('articles', 'POST', fields)

export const getSources = () => request('sources')
export const addSource = (source) => request('sources', 'POST', source)
export const removeSource = (id) => request(`sources/${id}`, 'DELETE')

// Upload a picture or video from the phone. Resolves to { url, type }.
export function uploadMedia(file, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file, file.name || 'upload')
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/admin/upload')
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let data = null
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        data = null
      }
      if (xhr.status === 401) return reject(new UnauthorizedError('Signed out'))
      if (xhr.status === 413) return reject(new Error('That file is too big for the server.'))
      if (xhr.status >= 200 && xhr.status < 300 && data && data.url) return resolve(data)
      return reject(new Error((data && data.error) || 'Upload failed. Try again.'))
    }
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'))
    xhr.send(form)
  })
}

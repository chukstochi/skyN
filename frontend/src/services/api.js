// All backend calls live here. If an endpoint changes, change it in this file only.

async function request(url, options) {
  const res = await fetch(url, options)
  if (!res.ok) {
    let message = 'Something went wrong. Try again.'
    try {
      const data = await res.json()
      if (data.error) message = data.error
    } catch {
      /* keep the default message */
    }
    throw new Error(message)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const getArticles = (category) =>
  request('/api/articles' + (category ? `?category=${encodeURIComponent(category)}` : ''))

export const getArticle = (slug) => request(`/api/articles/${encodeURIComponent(slug)}`)

export const subscribe = (email) =>
  request('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

export function timeAgo(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`
  return new Date(timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function imageStyle(article) {
  return article.image
    ? { backgroundImage: `url(${JSON.stringify(article.image)})` }
    : undefined
}

export const articlePath = (article) => `/article/${encodeURIComponent(article.slug)}`
export const categoryPath = (name) => `/category/${encodeURIComponent(name)}`

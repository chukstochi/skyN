export function timeAgo(timestamp) {
  const hours = Math.max(1, Math.round((Date.now() - timestamp) / 36e5))
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`
  const days = Math.round(hours / 24)
  return days === 1 ? '1 day ago' : `${days} days ago`
}

export function imageStyle(article) {
  return article.image
    ? { backgroundImage: `url(${JSON.stringify(article.image)})` }
    : undefined
}

export const articlePath = (article) => `/article/${encodeURIComponent(article.slug)}`
export const categoryPath = (name) => `/category/${encodeURIComponent(name)}`

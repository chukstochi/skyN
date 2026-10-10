import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getArticle } from '../services/api.js'
import { timeAgo } from '../utils.js'
import WatermarkedVideo from '../components/WatermarkedVideo.jsx'

// The source shown to readers. (The admin page still shows the real source.)
const SITE_SOURCE = 'Sky_N_News'

export default function Article() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getArticle(slug)
      .then((a) => {
        if (cancelled) return
        setArticle(a)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === 'loading') return <p className="status">Loading article…</p>
  if (status === 'error' || !article)
    return (
      <p className="status">
        This article could not be found. <Link to="/">Back to all news</Link>
      </p>
    )

  const paragraphs = (article.body || '').split(/\n\s*\n/)

  return (
    <article className="article-page">
      <Link className="back" to="/">
        ← Back to all news
      </Link>
      <span className="tag">{article.category}</span>
      <h1>{article.title}</h1>
      <p className="meta">
        By {article.author} · {timeAgo(article.published_at)} · Source: {SITE_SOURCE}
      </p>
      {article.video ? (
        <WatermarkedVideo src={article.video} poster={article.image || undefined} />
      ) : (
        article.image && (
          <div className="article-media wm-image">
            <img src={article.image} alt="" />
          </div>
        )
      )}
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </article>
  )
}

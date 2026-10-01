import { useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { getArticles } from '../services/api.js'
import Hero from '../components/Hero.jsx'
import ArticleGrid from '../components/ArticleGrid.jsx'
import TrendingBox from '../components/TrendingBox.jsx'
import NewsletterBox from '../components/NewsletterBox.jsx'

// Used for both "/" and "/category/:name"
export default function Home() {
  const { name } = useParams()
  const { query } = useOutletContext()
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    getArticles(name)
      .then((list) => {
        if (cancelled) return
        setArticles(list || [])
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [name])

  const q = query.trim().toLowerCase()
  const list = q
    ? articles.filter((a) => (a.title + a.summary).toLowerCase().includes(q))
    : articles

  if (status === 'loading') return <p className="status">Loading stories…</p>
  if (status === 'error')
    return (
      <p className="status">
        Stories could not be loaded. Check that the backend is running, then refresh the page.
      </p>
    )

  return (
    <>
      <Hero lead={list[0]} side={list.slice(1, 4)} />
      <div className="cols">
        <section>
          <h3 className="sec">Top stories</h3>
          <ArticleGrid articles={list.slice(4, 7)} />
          <h3 className="sec">More news</h3>
          <ArticleGrid articles={list.slice(7)} />
        </section>
        <aside>
          <TrendingBox articles={list.slice(0, 5)} />
          <NewsletterBox />
        </aside>
      </div>
    </>
  )
}

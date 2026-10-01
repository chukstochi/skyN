import { useState } from 'react'
import { ARTICLE_CATEGORIES } from '../../constants.js'

export default function SourceManager({ sources, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState(ARTICLE_CATEGORIES[0])

  async function handleAdd() {
    const added = await onAdd({ name, url, category })
    if (added) {
      setName('')
      setUrl('')
    }
  }

  return (
    <>
      <div className="admin-card">
        <b>Add a news source (RSS feed URL)</b>
        <div className="admin-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name, e.g. BBC News"
            aria-label="Source name"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…/rss"
            aria-label="Feed URL"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <button className="primary" onClick={handleAdd}>
          Add source
        </button>
      </div>

      {sources.map((s) => (
        <div key={s.id} className="admin-card admin-bar">
          <div className="admin-source">
            <b>{s.name}</b> <span className="admin-note">{s.category}</span>
            <br />
            <span className="admin-note">{s.url}</span>
          </div>
          <button className="danger" onClick={() => onRemove(s.id)}>
            Remove
          </button>
        </div>
      ))}
    </>
  )
}

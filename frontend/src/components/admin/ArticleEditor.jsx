import { useState } from 'react'
import { ARTICLE_CATEGORIES } from '../../constants.js'

// One article card in the review desk. Keeps its own edits until saved.
export default function ArticleEditor({ article, status, onSave, onChangeStatus, onDelete }) {
  const [form, setForm] = useState({
    title: article.title ?? '',
    summary: article.summary ?? '',
    category: article.category ?? ARTICLE_CATEGORIES[0],
    author: article.author ?? '',
    image: article.image ?? '',
    body: article.body ?? '',
  })

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  return (
    <div className="admin-card">
      <div className="admin-note">
        Source:{' '}
        <a href={article.source_url} target="_blank" rel="noopener noreferrer">
          {article.source_name}
        </a>
      </div>

      <label>
        Headline
        <input name="title" value={form.title} onChange={update} />
      </label>
      <label>
        Summary
        <input name="summary" value={form.summary} onChange={update} />
      </label>

      <div className="admin-row">
        <label>
          Category
          <select name="category" value={form.category} onChange={update}>
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Author name
          <input name="author" value={form.author} onChange={update} />
        </label>
      </div>

      <label>
        Image URL
        <input name="image" value={form.image} onChange={update} />
      </label>
      <label>
        Body
        <textarea name="body" value={form.body} onChange={update} />
      </label>

      <div className="admin-bar">
        <button onClick={() => onSave(article.id, form)}>Save edits</button>
        {status !== 'published' ? (
          <button className="primary" onClick={() => onChangeStatus(article.id, form, 'publish')}>
            Publish
          </button>
        ) : (
          <button onClick={() => onChangeStatus(article.id, form, 'draft')}>Unpublish</button>
        )}
        {status === 'draft' && (
          <button onClick={() => onChangeStatus(article.id, form, 'reject')}>Reject</button>
        )}
        <button className="danger" onClick={() => onDelete(article.id)}>
          Delete
        </button>
      </div>
    </div>
  )
}

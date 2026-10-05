import { useState } from 'react'
import { ARTICLE_CATEGORIES } from '../../constants.js'
import ImagePreview from './ImagePreview.jsx'

const EMPTY = {
  title: '',
  summary: '',
  category: ARTICLE_CATEGORIES[0],
  author: '',
  image: '',
  body: '',
}

// Write your own article. onSubmit(fields, publish) returns true when saved.
export default function ArticleWriter({ onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const valid = form.title.trim() && form.body.trim()

  async function submit(publish) {
    if (!valid || busy) return
    setBusy(true)
    const ok = await onSubmit(form, publish)
    setBusy(false)
    if (ok) setForm(EMPTY)
  }

  return (
    <div className="admin-card">
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
      <ImagePreview url={form.image} />

      <label>
        Body
        <textarea name="body" value={form.body} onChange={update} />
      </label>

      <div className="admin-bar">
        <button disabled={!valid || busy} onClick={() => submit(false)}>
          Save for review
        </button>
        <button className="primary" disabled={!valid || busy} onClick={() => submit(true)}>
          Publish now
        </button>
      </div>
    </div>
  )
}
import { useState } from 'react'
import { ARTICLE_CATEGORIES } from '../../constants.js'
import ImagePreview from './ImagePreview.jsx'
import MediaPicker from './MediaPicker.jsx'

const AUTHOR_KEY = 'sky_admin_author'

// Remember the last author name you typed, so you don't retype it every time.
function savedAuthor() {
  try {
    return localStorage.getItem(AUTHOR_KEY) || ''
  } catch {
    return ''
  }
}

const EMPTY = { title: '', summary: '', category: ARTICLE_CATEGORIES[0], image: '', video: '', body: '' }

// A form for articles you write yourself (not written by the AI).
export default function ArticleWriter({ onSubmit }) {
  const [form, setForm] = useState(EMPTY)
  const [author, setAuthor] = useState(savedAuthor)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function submit(publish) {
    if (busy) return
    if (!form.title.trim() || !author.trim() || !form.body.trim()) {
      setError('Add a headline, an author name and the article text.')
      return
    }
    setError('')
    setBusy(true)
    try {
      localStorage.setItem(AUTHOR_KEY, author.trim())
    } catch {
      /* ignore */
    }
    const ok = await onSubmit({ ...form, author: author.trim() }, publish)
    setBusy(false)
    if (ok) setForm(EMPTY)
  }

  return (
    <div className="admin-card">
      <b>Write your own article</b>
      <p className="admin-hint">
        Save it as a draft to find it under Needs review, or publish it straight away.
      </p>

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
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Your name" />
        </label>
      </div>

      <label>
        Image URL
        <input name="image" value={form.image} onChange={update} placeholder="https://…" />
      </label>
      <ImagePreview url={form.image} />

      <MediaPicker
        onImage={(url, soft) => setForm((f) => (soft && f.image ? f : { ...f, image: url }))}
        onVideo={(url) => setForm((f) => ({ ...f, video: url }))}
      />
      {form.video && (
        <div style={{ marginBottom: 10 }}>
          <video className="admin-preview" src={form.video} controls playsInline preload="metadata" />
          <button type="button" className="danger" onClick={() => setForm((f) => ({ ...f, video: '' }))}>
            Remove video
          </button>
        </div>
      )}

      <label>
        Article text
        <textarea name="body" value={form.body} onChange={update} />
      </label>

      {error && <p className="admin-note">{error}</p>}

      <div className="admin-bar">
        <button onClick={() => submit(false)} disabled={busy}>
          Save as draft
        </button>
        <button className="primary" onClick={() => submit(true)} disabled={busy}>
          {busy ? 'Saving…' : 'Publish now'}
        </button>
      </div>
    </div>
  )
}

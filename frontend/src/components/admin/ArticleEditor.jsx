import { useState } from 'react'
import { ARTICLE_CATEGORIES } from '../../constants.js'
import ImagePreview from './ImagePreview.jsx'
import MediaPicker from './MediaPicker.jsx'

// One article card in the review desk. Keeps its own edits until saved.
export default function ArticleEditor({ article, status, onSave, onChangeStatus, onDelete }) {
  const [form, setForm] = useState({
    title: article.title ?? '',
    summary: article.summary ?? '',
    category: article.category ?? ARTICLE_CATEGORIES[0],
    author: article.author ?? '',
    image: article.image ?? '',
    video: article.video ?? '',
    body: article.body ?? '',
  })

  function update(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // The /article/<slug> page carries the title + image preview that Facebook, X and WhatsApp show.
  const link = `${window.location.origin}/article/${article.slug}`
  const text = encodeURIComponent(form.title)
  const url = encodeURIComponent(link)
  const targets = [
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${url}`],
    ['X', `https://twitter.com/intent/tweet?text=${text}&url=${url}`],
    ['WhatsApp', `https://wa.me/?text=${text}%20${url}`],
    ['Telegram', `https://t.me/share/url?url=${url}&text=${text}`],
  ]

  function copyLink() {
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    if (navigator.clipboard) navigator.clipboard.writeText(link).then(done, () => window.prompt('Copy this link:', link))
    else window.prompt('Copy this link:', link)
  }

  const hasSourceLink = /^https?:\/\//.test(article.source_url || '')

  return (
    <div className="admin-card">
      <div className="admin-note">
        Source:{' '}
        {hasSourceLink ? (
          <a href={article.source_url} target="_blank" rel="noopener noreferrer">
            {article.source_name}
          </a>
        ) : (
          article.source_name
        )}
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
          <>
            <button onClick={() => setShareOpen((o) => !o)}>{shareOpen ? 'Close share' : 'Share'}</button>
            <button onClick={() => onChangeStatus(article.id, form, 'draft')}>Unpublish</button>
          </>
        )}
        {status === 'draft' && (
          <button onClick={() => onChangeStatus(article.id, form, 'reject')}>Reject</button>
        )}
        <button className="danger" onClick={() => onDelete(article.id)}>
          Delete
        </button>
      </div>

      {status === 'published' && shareOpen && (
        <div className="admin-bar">
          {targets.map(([name, href]) => (
            <button key={name} onClick={() => window.open(href, '_blank', 'noopener,noreferrer,width=640,height=560')}>
              {name}
            </button>
          ))}
          <button onClick={copyLink}>{copied ? 'Copied!' : 'Copy link'}</button>
        </div>
      )}
    </div>
  )
}

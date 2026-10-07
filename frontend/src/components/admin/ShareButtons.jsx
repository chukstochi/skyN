import { useState } from 'react'

// Short summary: at most 50 characters, cut at a word boundary.
function shortSummary(text = '') {
  const s = text.replace(/\s+/g, ' ').trim()
  if (s.length <= 50) return s
  const cut = s.slice(0, 49)
  return cut.slice(0, cut.lastIndexOf(' ') > 20 ? cut.lastIndexOf(' ') : 49).trim() + '…'
}

export default function ShareButtons({ article }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const url = `${window.location.origin}/article/${article.slug}`
  const short = shortSummary(article.summary)
  const caption = `${article.title}\n${short}\n\nRead more: ${url}`
  const enc = encodeURIComponent

  const targets = [
    ['WhatsApp', `https://wa.me/?text=${enc(caption)}`],
    ['X', `https://x.com/intent/post?text=${enc(article.title + '\n' + short)}&url=${enc(url)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ['Telegram', `https://t.me/share/url?url=${enc(url)}&text=${enc(article.title + '\n' + short)}`],
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`],
  ]

  async function copy() {
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this caption:', caption)
    }
  }

  function nativeShare() {
    navigator.share({ title: article.title, text: `${article.title}\n${short}`, url }).catch(() => {})
  }

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen((o) => !o)}>Share ▾</button>
      {open && (
        <div
          className="admin-card"
          style={{ position: 'absolute', zIndex: 20, minWidth: 190, padding: 8, display: 'grid', gap: 6 }}
        >
          {targets.map(([name, href]) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              {name}
            </a>
          ))}
          <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy caption'}</button>
          {navigator.share && <button onClick={nativeShare}>More apps…</button>}
        </div>
      )}
    </span>
  )
}
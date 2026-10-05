import { useEffect, useState } from 'react'
import * as adminApi from '../services/adminApi.js'
import { UnauthorizedError } from '../services/adminApi.js'
import AdminTabs from '../components/admin/AdminTabs.jsx'
import ArticleEditor from '../components/admin/ArticleEditor.jsx'
import ArticleWriter from '../components/admin/ArticleWriter.jsx'
import SourceManager from '../components/admin/SourceManager.jsx'

export default function AdminDashboard({ onSignedOut }) {
  const [tab, setTab] = useState('draft')
  const [articles, setArticles] = useState([])
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [fetching, setFetching] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = () => setReloadKey((k) => k + 1)

  function handleError(err) {
    if (err instanceof UnauthorizedError) onSignedOut()
    else setMessage(err.message || 'Something went wrong. Try again.')
  }

  // Load the list for the current tab (and again whenever reload() is called)
  useEffect(() => {
    if (tab === 'write') {
      setLoading(false)
      return undefined
    }
    let cancelled = false
    const request = tab === 'sources' ? adminApi.getSources() : adminApi.getArticles(tab)
    request
      .then((data) => {
        if (cancelled) return
        if (tab === 'sources') setSources(data || [])
        else setArticles(data || [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setLoading(false)
        handleError(err)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, reloadKey])

  function changeTab(next) {
    if (next === tab) return
    setLoading(true)
    setMessage('')
    setTab(next)
  }

  async function saveArticle(id, fields) {
    try {
      await adminApi.updateArticle(id, fields)
      setMessage('Saved.')
    } catch (err) {
      handleError(err)
    }
  }

  async function changeStatus(id, fields, action) {
    try {
      await adminApi.updateArticle(id, fields)
      await adminApi.articleAction(id, action)
      setMessage(action === 'publish' ? 'Published.' : 'Updated.')
      reload()
    } catch (err) {
      handleError(err)
    }
  }

  async function deleteArticle(id) {
    if (!window.confirm('Delete this article?')) return
    try {
      await adminApi.deleteArticle(id)
      reload()
    } catch (err) {
      handleError(err)
    }
  }

  // Your own article. Returns true when it was saved so the form can clear itself.
  async function createArticle(fields, publish) {
    try {
      await adminApi.createArticle({ ...fields, publish })
      setMessage(publish ? 'Your article is published.' : 'Saved. Find it under Needs review.')
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  // The backend starts the fetch in the background, so we check its status until it finishes.
  async function fetchNow() {
    setFetching(true)
    setMessage('Fetching and rewriting… this can take a minute.')
    try {
      const start = await adminApi.fetchNow()
      if (start && start.skipped) setMessage('A fetch was already running. Waiting for it…')

      let status = null
      for (let i = 0; i < 120; i++) {
        await new Promise((res) => setTimeout(res, 3000))
        status = await adminApi.getFetchStatus()
        if (status && (status.running === false || status.done === true || status.state === 'done')) break
      }

      const added = status?.added ?? status?.result?.added ?? 0
      const errors = status?.errors || status?.result?.errors || []
      setMessage(
        `${added} new drafts added.${errors.length ? ' Issues: ' + errors.slice(0, 3).join(' | ') : ''}`
      )
      reload()
    } catch (err) {
      handleError(err)
    } finally {
      setFetching(false)
    }
  }

  async function addSource(source) {
    try {
      await adminApi.addSource(source)
      reload()
      return true
    } catch (err) {
      handleError(err)
      return false
    }
  }

  async function removeSource(id) {
    try {
      await adminApi.removeSource(id)
      reload()
    } catch (err) {
      handleError(err)
    }
  }

  let content
  if (tab === 'write') {
    content = <ArticleWriter onSubmit={createArticle} />
  } else if (loading) {
    content = <p className="admin-note">Loading…</p>
  } else if (tab === 'sources') {
    content = <SourceManager sources={sources} onAdd={addSource} onRemove={removeSource} />
  } else if (articles.length) {
    content = articles.map((a) => (
      <ArticleEditor
        key={a.id}
        article={a}
        status={tab}
        onSave={saveArticle}
        onChangeStatus={changeStatus}
        onDelete={deleteArticle}
      />
    ))
  } else {
    content = <p className="admin-note">Nothing here. Add sources, then choose Fetch &amp; rewrite now.</p>
  }

  return (
    <div className="admin">
      <div className="admin-bar">
        <h1>Sky N news · Review desk</h1>
        <button className="primary" onClick={fetchNow} disabled={fetching}>
          Fetch &amp; rewrite now
        </button>
      </div>
      <AdminTabs tab={tab} onChange={changeTab} />
      <p className="admin-note">{message}</p>
      {content}
    </div>
  )
}
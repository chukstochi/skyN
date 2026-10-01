import { useState } from 'react'
import { adminLogin } from '../services/adminApi.js'

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const ok = await adminLogin(password)
      if (ok) onSuccess()
      else setError('Wrong password')
    } catch {
      setError('Could not reach the server. Check that the backend is running.')
    }
  }

  return (
    <div className="admin">
      <form className="admin-card admin-login" onSubmit={handleSubmit}>
        <h2>Admin sign in</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password"
          autoFocus
        />
        <button className="primary" type="submit">
          Sign in
        </button>
        <p className="admin-note">{error}</p>
      </form>
    </div>
  )
}

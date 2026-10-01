import { useState } from 'react'
import { subscribe } from '../services/api.js'

export default function NewsletterBox() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await subscribe(email)
      setMessage('You are subscribed.')
      setEmail('')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <form className="box" id="newsletter" onSubmit={handleSubmit}>
      <h3 className="box-title">Newsletter</h3>
      <p className="meta">Get the latest news delivered to your inbox.</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        aria-label="Email address"
      />
      <button className="btn btn-full" type="submit">
        Subscribe
      </button>
      <p className="meta">{message}</p>
    </form>
  )
}

import { useCallback, useEffect, useState } from 'react'
import * as adminApi from '../services/adminApi.js'
import AdminLogin from './AdminLogin.jsx'
import AdminDashboard from './AdminDashboard.jsx'

// Decides whether to show the sign-in screen or the review desk.
export default function Admin() {
  const [signedIn, setSignedIn] = useState(null) // null = still checking

  useEffect(() => {
    adminApi
      .checkSession()
      .then(() => setSignedIn(true))
      .catch(() => setSignedIn(false))
  }, [])

  const handleSignedOut = useCallback(() => setSignedIn(false), [])

  if (signedIn === null) {
    return (
      <div className="admin">
        <p className="admin-note">Loading…</p>
      </div>
    )
  }

  return signedIn ? (
    <AdminDashboard onSignedOut={handleSignedOut} />
  ) : (
    <AdminLogin onSuccess={() => setSignedIn(true)} />
  )
}

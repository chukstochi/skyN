import { useEffect, useState } from 'react'

export default function ImagePreview({ url }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [url])

  if (!url) return null
  if (failed) return <p className="admin-note">Image could not be loaded.</p>
  return (
    <img
      src={url}
      alt=""
      onError={() => setFailed(true)}
      style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 6 }}
    />
  )
}
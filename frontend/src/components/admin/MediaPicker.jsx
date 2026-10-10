import { useRef, useState } from 'react'
import { uploadMedia, UnauthorizedError } from '../../services/adminApi.js'

const MAX_VIDEO_MB = 40
const MAX_SIDE = 1600

// Phone pictures are often 5 MB or more, so shrink them before uploading.
async function shrinkImage(file) {
  if (file.type === 'image/gif') return file
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    return blob ? new File([blob], 'photo.jpg', { type: 'image/jpeg' }) : file
  } catch {
    return file
  }
}

// Grab a still picture from the video to use as the story's cover (null if the browser can't).
function videoFrame(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    let finished = false
    const finish = (blob) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      URL.revokeObjectURL(url)
      resolve(blob)
    }
    const timer = setTimeout(() => finish(null), 6000)
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.onerror = () => finish(null)
    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(1, (video.duration || 1) / 2)
      } catch {
        finish(null)
      }
    }
    video.onseeked = () => {
      try {
        if (!video.videoWidth) return finish(null)
        const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        return canvas.toBlob((b) => finish(b), 'image/jpeg', 0.85)
      } catch {
        return finish(null)
      }
    }
    video.src = url
  })
}

// A button that opens the phone's gallery, uploads the choice, and hands back the new address.
// onImage(url, soft): soft = true means "only use this if there is no picture yet".
export default function MediaPicker({ onImage, onVideo }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) {
      setStatus('Choose a picture or a video.')
      return
    }
    if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setStatus(`That video is over ${MAX_VIDEO_MB} MB. Pick a shorter one.`)
      return
    }
    setBusy(true)
    try {
      if (isImage) {
        setStatus('Preparing picture…')
        const small = await shrinkImage(file)
        const r = await uploadMedia(small, (p) => setStatus(`Uploading picture… ${p}%`))
        onImage(r.url, false)
        setStatus('Picture added.')
      } else {
        setStatus('Uploading video… 0%')
        const r = await uploadMedia(file, (p) => setStatus(`Uploading video… ${p}%`))
        onVideo(r.url)
        const frame = await videoFrame(file)
        let cover = false
        if (frame) {
          try {
            const c = await uploadMedia(new File([frame], 'cover.jpg', { type: 'image/jpeg' }))
            onImage(c.url, true)
            cover = true
          } catch {
            /* the video is added anyway */
          }
        }
        setStatus(cover ? 'Video added.' : 'Video added. Add a cover picture too, so the story has a thumbnail.')
      }
    } catch (err) {
      setStatus(
        err instanceof UnauthorizedError
          ? 'Your session ended. Reload the page and sign in again.'
          : err.message || 'Upload failed. Try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ margin: '4px 0 12px' }}>
      <input ref={inputRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
      <button type="button" onClick={() => inputRef.current && inputRef.current.click()} disabled={busy}>
        {busy ? 'Working…' : 'Add photo or video from your phone'}
      </button>
      {status && <span className="admin-note"> {status}</span>}
    </div>
  )
}

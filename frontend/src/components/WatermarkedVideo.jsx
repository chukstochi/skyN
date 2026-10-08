// For when you add videos: the SKY_N_NEWS watermark sits at the top left.
export default function WatermarkedVideo({ src, poster }) {
  return (
    <div className="video-frame wm-video">
      <video src={src} poster={poster} controls playsInline preload="metadata" />
    </div>
  )
}

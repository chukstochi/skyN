export default function TopBar() {
  return (
    <div className="top">
      <div className="w">
        <span>Live · Real News, Global Perspective, Your World</span>
        <span className="top-date">{new Date().toLocaleString()}</span>
      </div>
    </div>
  )
}

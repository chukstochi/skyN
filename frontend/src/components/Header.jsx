import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Header({ query, onQueryChange }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleSearch(e) {
    onQueryChange(e.target.value)
    // Search results show on the news list, so leave the article page.
    if (pathname.startsWith('/article')) navigate('/')
  }

  function goToNewsletter() {
    const box = document.getElementById('newsletter')
    if (box) box.scrollIntoView({ behavior: 'smooth' })
    else navigate('/')
  }

  return (
    <header>
      <div className="w hd">
        <Link className="logo" to="/">
          Sky_N <b>_News</b>
        </Link>
        <input
          value={query}
          onChange={handleSearch}
          placeholder="Search for news, topics or keywords…"
          aria-label="Search news"
        />
        <button className="btn" onClick={goToNewsletter}>
          Subscribe
        </button>
      </div>
    </header>
  )
}

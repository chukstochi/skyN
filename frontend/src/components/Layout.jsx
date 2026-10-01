import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar.jsx'
import Header from './Header.jsx'
import CategoryNav from './CategoryNav.jsx'
import Footer from './Footer.jsx'

export default function Layout() {
  const [query, setQuery] = useState('')
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <TopBar />
      <Header query={query} onQueryChange={setQuery} />
      <CategoryNav />
      <main className="w">
        <Outlet context={{ query }} />
      </main>
      <Footer />
    </>
  )
}

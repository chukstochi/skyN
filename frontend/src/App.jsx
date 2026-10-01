import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Article from './pages/Article.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <Routes>
      {/* Admin has its own screen, without the public header and footer */}
      <Route path="admin" element={<Admin />} />

      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="category/:name" element={<Home />} />
        <Route path="article/:slug" element={<Article />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

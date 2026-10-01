import { Link } from 'react-router-dom'
import { articlePath, imageStyle } from '../utils.js'

export default function TrendingBox({ articles }) {
  return (
    <div className="box">
      <h3 className="box-title">Trending now</h3>
      <div>
        {articles.map((a, i) => (
          <Link key={a.slug} className="tr" to={articlePath(a)}>
            {i + 1}. <i style={imageStyle(a)} />
            <span>{a.title}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

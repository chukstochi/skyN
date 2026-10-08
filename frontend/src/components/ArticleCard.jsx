import { Link } from 'react-router-dom'
import { articlePath, imageStyle, timeAgo } from '../utils.js'

export default function ArticleCard({ article }) {
  return (
    <Link className="card" to={articlePath(article)}>
      <i className="wm-image" style={imageStyle(article)} />
      <div>
        <span className="tag">{article.category}</span>
        <h4>{article.title}</h4>
        <p>{article.summary}</p>
        <p>{timeAgo(article.published_at)}</p>
      </div>
    </Link>
  )
}

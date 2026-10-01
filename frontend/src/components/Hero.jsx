import { Link } from 'react-router-dom'
import { articlePath, imageStyle, timeAgo } from '../utils.js'

export default function Hero({ lead, side }) {
  return (
    <div className="hero">
      {lead ? (
        <Link className="big" to={articlePath(lead)} style={imageStyle(lead)}>
          <div>
            <span className="tag">{lead.category}</span>
            <h2>{lead.title}</h2>
            <p>{lead.summary}</p>
            <span className="meta meta-light">
              {timeAgo(lead.published_at)} · {lead.author}
            </span>
          </div>
        </Link>
      ) : (
        <div className="big">
          <div>
            <h2>No published stories yet</h2>
          </div>
        </div>
      )}

      <div className="side">
        {side.map((a) => (
          <Link key={a.slug} className="mini" to={articlePath(a)}>
            <i style={imageStyle(a)} />
            <div>
              <span className="tag">{a.category}</span>
              <h4>{a.title}</h4>
              <span className="meta">{timeAgo(a.published_at)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

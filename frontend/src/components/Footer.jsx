import { SOCIAL_LINKS } from '../constants.js'

export default function Footer() {
  return (
    <footer>
      <div className="w">
        <div className="logo">
          SKY N <b>news</b>
        </div>
        <p>Real News · Global Perspective · Your World</p>
        <div className="socials">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Sky N news on ${s.name}`}
            >
              {s.name}
            </a>
          ))}
        </div>
        <p>© {new Date().getFullYear()} Sky N news. All rights reserved.</p>
      </div>
    </footer>
  )
}
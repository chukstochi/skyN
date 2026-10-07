import { Link } from 'react-router-dom'
import {
  FaFacebookF,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaWhatsapp,
  FaLinkedinIn,
  FaTelegram,
} from 'react-icons/fa6'
import { SOCIAL_LINKS } from '../constants.js'

//Matches on the lowercase name from SOCIAL_LINKS. Unknown names fall back to text.
const ICONS = {
  facebook: FaFacebookF,
  x: FaXTwitter,
  twitter: FaXTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  whatsapp: FaWhatsapp,
  linkedin: FaLinkedinIn,
  telegram: FaTelegram,
}

export default function Footer() {
  return (
    <footer>
      <div className="w">
        <div className="logo">
          Sky_N<b>_News</b>
        </div>
        <p>Real News · Global Perspective · Your World</p>
        <div className="socials">
          {SOCIAL_LINKS.map((s) => {
            const Icon = ICONS[s.name.trim().toLowerCase()]
            return (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Sky_N_News on ${s.name}`}
                title={s.name}
              >
                {Icon ? <Icon aria-hidden="true" size={18} /> : s.name}
              </a>
            )
          })}
        </div>
        <p>
          <Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms &amp; Editorial Policy</Link>
        </p>
        <p>© {new Date().getFullYear()} Sky_N_News. All rights reserved.</p>
      </div>
    </footer>
  )
}
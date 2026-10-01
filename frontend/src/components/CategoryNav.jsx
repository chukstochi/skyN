import { NavLink } from 'react-router-dom'
import { CATEGORIES } from '../constants.js'
import { categoryPath } from '../utils.js'

const linkClass = ({ isActive }) => (isActive ? 'on' : '')

export default function CategoryNav() {
  return (
    <nav>
      <div className="w">
        {CATEGORIES.map((name) =>
          name === 'Home' ? (
            <NavLink key={name} to="/" end className={linkClass}>
              Home
            </NavLink>
          ) : (
            <NavLink key={name} to={categoryPath(name)} className={linkClass}>
              {name}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}

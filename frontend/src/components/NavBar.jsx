import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
    isActive ? 'bg-brandSoft text-brand' : 'text-muted hover:text-ink hover:bg-paper'
  }`

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-surface border-b border-rule sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-brand text-white grid place-items-center text-sm font-bold">L</span>
            <span className="font-display text-lg">Ledger</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={linkClass}>Overview</NavLink>
            <NavLink to="/analysis" className={linkClass}>Analysis</NavLink>
            <NavLink to="/planning" className={linkClass}>Expense Planning</NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/profile" className="flex items-center gap-2 text-sm text-muted hover:text-ink">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-brandSoft text-brand grid place-items-center text-xs font-semibold">
                {(user?.name || user?.username || '?').trim()[0]?.toUpperCase() || '?'}
              </span>
            )}
            <span className="hidden sm:inline font-medium">{user?.name || user?.username}</span>
          </NavLink>
          <button onClick={logout} className="text-sm text-muted hover:text-withdrawal font-medium">
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}

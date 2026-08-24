import { NavLink } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
    isActive ? 'bg-white/70 text-brand shadow-sm' : 'text-muted hover:text-ink hover:bg-white/50'
  }`

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/60 backdrop-blur-xl backdrop-saturate-150">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand via-brand2 to-brand3 text-white grid place-items-center text-sm font-bold shadow-md shadow-brand/30">
              C
            </span>
            <span className="font-display text-lg">CredEx1</span>
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
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-brand2 text-white grid place-items-center text-xs font-semibold">
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

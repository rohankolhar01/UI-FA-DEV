import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await signup(username, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full card p-8">
        <div className="flex justify-center mb-3">
          <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand via-brand2 to-brand3 text-white grid place-items-center text-lg font-bold shadow-lg shadow-brand/30">
            C
          </span>
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand mb-2 text-center">CredEx1</p>
        <h1 className="font-display text-2xl text-center mb-8">Create your account.</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              className="field"
            />
            <p className="text-xs text-muted mt-1">At least 3 characters.</p>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
            />
            <p className="text-xs text-muted mt-1">At least 6 characters.</p>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="field"
            />
          </div>

          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-withdrawal">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:text-brandDark font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { updateProfile } from '../api'
import { useAuth } from '../AuthContext'

function initials(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?'
}

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setSaved(false)
  }

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, avatar: reader.result }))
      setSaved(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateProfile(form)
      setForm(updated)
      setUser((u) => ({ ...u, ...updated }))
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand mb-2">Profile</p>
        <h1 className="font-display text-2xl">Account details</h1>
        <p className="text-muted mt-1 text-sm">
          Signed in as <span className="text-ink font-medium">{user?.username}</span>.
        </p>
      </div>

      <div className="card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand via-brand2 to-brand3 text-white flex items-center justify-center text-xl font-semibold overflow-hidden shrink-0 shadow-lg shadow-brand/25">
          {form.avatar ? (
            <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            initials(form.name)
          )}
        </div>
        <label className="btn-secondary cursor-pointer">
          Change photo
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
        </label>
      </div>

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Name</label>
          <input
            value={form.name || ''}
            onChange={set('name')}
            className="field"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Email</label>
          <input
            value={form.email || ''}
            onChange={set('email')}
            className="field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Phone</label>
          <input
            value={form.phone || ''}
            onChange={set('phone')}
            className="field"
            placeholder="+91 9xxxxxxxxx"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
        {saved && <span className="text-sm text-deposit">Saved.</span>}
      </div>
    </div>
  )
}

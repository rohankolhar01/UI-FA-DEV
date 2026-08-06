import { useEffect, useState } from 'react'
import UploadZone from '../components/UploadZone'
import Dashboard from '../components/Dashboard'
import {
  uploadStatement, listStatements, getStatementDashboard, renameStatement, listCategories,
} from '../api'

function formatUploadedAt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function AnalysisPage() {
  const [statements, setStatements] = useState(null) // null = loading
  const [categories, setCategories] = useState([])

  const [selectedId, setSelectedId] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [renameError, setRenameError] = useState(null)

  const refreshStatements = async () => {
    const list = await listStatements()
    setStatements(list)
    return list
  }

  useEffect(() => {
    refreshStatements()
    listCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  const openStatement = async (id) => {
    setSelectedId(id)
    setDashboardLoading(true)
    setDashboardError(null)
    try {
      const d = await getStatementDashboard(id)
      setDashboard(d)
    } catch (e) {
      setDashboardError(e.message)
    } finally {
      setDashboardLoading(false)
    }
  }

  const closeStatement = () => {
    setSelectedId(null)
    setDashboard(null)
    setDashboardError(null)
  }

  const handleUpload = async (file) => {
    setUploading(true)
    setUploadError(null)
    try {
      const result = await uploadStatement(file, null)
      await refreshStatements()
      if (result.statement_id) await openStatement(result.statement_id)
    } catch (e) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCategoryChanged = () => {
    if (selectedId) getStatementDashboard(selectedId).then(setDashboard)
  }

  const startRename = (s) => {
    setRenameError(null)
    setRenamingId(s.id)
    setRenameValue(s.filename)
  }

  const cancelRename = () => {
    setRenamingId(null)
    setRenameValue('')
  }

  const handleRenameSubmit = async (e, id) => {
    e.preventDefault()
    const trimmed = renameValue.trim()
    if (!trimmed) return
    setRenaming(true)
    setRenameError(null)
    try {
      await renameStatement(id, trimmed)
      await refreshStatements()
      setRenamingId(null)
    } catch (err) {
      setRenameError(err.message)
    } finally {
      setRenaming(false)
    }
  }

  if (statements === null) {
    return <p className="text-center text-muted mt-16 text-sm">Loading…</p>
  }

  // A statement is open — show its dashboard with a way back to the list.
  if (selectedId) {
    return (
      <>
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <button onClick={closeStatement} className="text-xs font-medium uppercase tracking-wide text-brand hover:text-brandDark">
            ‹ Back to statements
          </button>
        </div>

        {dashboardLoading ? (
          <p className="text-center text-muted mt-16 text-sm">Loading…</p>
        ) : dashboardError ? (
          <div className="max-w-2xl mx-auto mt-8 px-6">
            <div className="rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-withdrawal">
              {dashboardError}
            </div>
          </div>
        ) : dashboard ? (
          <Dashboard dashboard={dashboard} categories={categories} onCategoryChanged={handleCategoryChanged} />
        ) : null}
      </>
    )
  }

  // Menu view — upload on top, uploaded statements listed below.
  return (
    <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand mb-1">Analysis</p>
        <h1 className="font-display text-2xl">Your statements</h1>
        <p className="text-sm text-muted mt-1">Upload a statement, or pick one below to see its breakdown.</p>
      </div>

      <UploadZone onFile={handleUpload} loading={uploading} error={uploadError} compact />

      {renameError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-withdrawal">{renameError}</div>
      )}

      {statements.length === 0 ? (
        <p className="text-center text-muted text-sm py-10">No statements uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {statements.map((s) => (
            <li key={s.id} className="rounded-card border border-rule bg-surface transition hover:border-brand">
              {renamingId === s.id ? (
                <form onSubmit={(e) => handleRenameSubmit(e, s.id)} className="flex items-center gap-2 px-4 py-3">
                  <span className="w-9 h-9 shrink-0 rounded-lg bg-brandSoft text-brand grid place-items-center text-[10px] font-semibold">
                    PDF
                  </span>
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="field flex-1"
                  />
                  <button type="submit" disabled={renaming} className="btn-secondary shrink-0">
                    {renaming ? '…' : 'Save'}
                  </button>
                  <button type="button" onClick={cancelRename} className="text-xs text-muted hover:text-ink font-medium shrink-0 px-1">
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    onClick={() => openStatement(s.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <span className="w-9 h-9 shrink-0 rounded-lg bg-brandSoft text-brand grid place-items-center text-[10px] font-semibold">
                      PDF
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{s.filename}</span>
                      <span className="block text-xs text-muted mt-0.5">Uploaded {formatUploadedAt(s.uploaded_at)}</span>
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); startRename(s) }}
                    className="shrink-0 text-xs text-muted hover:text-brand font-medium"
                  >
                    Rename
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import UploadZone from '../components/UploadZone'
import UploadModal from '../components/UploadModal'
import EditAccountModal from '../components/EditAccountModal'
import AccountTabs from '../components/AccountTabs'
import Dashboard from '../components/Dashboard'
import {
  uploadStatement, listAccounts, getAccountDashboard, updateAccount, deleteAccount, listCategories,
} from '../api'

export default function AnalysisPage() {
  const [accounts, setAccounts] = useState(null) // null = loading
  const [selectedId, setSelectedId] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)

  const [uploadModal, setUploadModal] = useState(null) // { accountId: string|null } | null
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const [editingAccount, setEditingAccount] = useState(null)
  const [categories, setCategories] = useState([])

  const refreshAccounts = async (preferId) => {
    const list = await listAccounts()
    setAccounts(list)
    if (list.length === 0) {
      setSelectedId(null)
      setDashboard(null)
    } else {
      const next = preferId && list.some((a) => a.id === preferId) ? preferId : list[0].id
      setSelectedId(next)
    }
    return list
  }

  useEffect(() => {
    refreshAccounts()
    listCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setDashboardLoading(true)
    getAccountDashboard(selectedId)
      .then(setDashboard)
      .finally(() => setDashboardLoading(false))
  }, [selectedId])

  const handleUpload = async (file) => {
    setUploading(true)
    setUploadError(null)
    try {
      const result = await uploadStatement(file, uploadModal?.accountId || null)
      await refreshAccounts(result.account.id)
      setSelectedId(result.account.id)
      setDashboard(result)
      setUploadModal(null)
    } catch (e) {
      setUploadError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveAccount = async (accountId, changes) => {
    await updateAccount(accountId, changes)
    await refreshAccounts(selectedId)
    if (accountId === selectedId) {
      getAccountDashboard(accountId).then(setDashboard)
    }
  }

  const handleDelete = async (accountId) => {
    await deleteAccount(accountId)
    refreshAccounts()
  }

  // Re-fetch so the category and vendor charts reflect the correction too.
  const handleCategoryChanged = () => {
    if (selectedId) getAccountDashboard(selectedId).then(setDashboard)
  }

  if (accounts === null) {
    return <p className="text-center text-muted mt-16 text-sm">Loading…</p>
  }

  if (accounts.length === 0) {
    return <UploadZone onFile={handleUpload} loading={uploading} error={uploadError} />
  }

  return (
    <>
      <AccountTabs
        accounts={accounts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAddNew={() => { setUploadError(null); setUploadModal({ accountId: null }) }}
        onEdit={setEditingAccount}
        onDelete={handleDelete}
      />

      {dashboardLoading || !dashboard ? (
        <p className="text-center text-muted mt-16 text-sm">Loading…</p>
      ) : (
        <>
          <div className="max-w-7xl mx-auto px-6 pt-6 flex justify-end">
            <button
              onClick={() => { setUploadError(null); setUploadModal({ accountId: selectedId }) }}
              className="text-sm text-brand hover:text-brandDark font-medium"
            >
              + Add another statement to this account
            </button>
          </div>
          <Dashboard
            dashboard={dashboard}
            warnings={dashboard.warnings}
            categories={categories}
            onCategoryChanged={handleCategoryChanged}
          />
        </>
      )}

      {uploadModal && (
        <UploadModal
          title={uploadModal.accountId ? 'Add statement to this account' : 'New account'}
          onFile={handleUpload}
          loading={uploading}
          error={uploadError}
          onClose={() => setUploadModal(null)}
        />
      )}

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          onSave={handleSaveAccount}
          onClose={() => setEditingAccount(null)}
        />
      )}
    </>
  )
}

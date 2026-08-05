import { useState } from 'react'

// Offered as suggestions only - the field accepts anything you type.
const COMMON_BANKS = [
  'Canara Bank', 'State Bank Of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank Of Baroda',
  'Union Bank Of India', 'IDFC First Bank', 'Yes Bank', 'IndusInd Bank',
  'Federal Bank', 'Bank Of India', 'Indian Bank', 'Karnataka Bank',
]

export default function EditAccountModal({ account, onSave, onClose }) {
  const [label, setLabel] = useState(account.label || '')
  const [bankName, setBankName] = useState(account.bank_name || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = async () => {
    if (!label.trim()) {
      setError('Account name cannot be empty.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(account.id, { label: label.trim(), bank_name: bankName.trim() })
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-start justify-center overflow-y-auto py-16 px-4">
      <div className="bg-paper border border-rule max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-muted hover:text-ink text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
        <div className="p-6 space-y-5">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-muted mb-1">Edit account</p>
            <h2 className="font-display text-2xl">Account details.</h2>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Bank name</label>
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              list="bank-suggestions"
              placeholder="e.g. Canara Bank"
              className="field"
            />
            <datalist id="bank-suggestions">
              {COMMON_BANKS.map((b) => <option key={b} value={b} />)}
            </datalist>
            <p className="text-xs text-muted mt-1">
              Most statements print the bank as a logo image, which can't be read as text — so set it here.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Account name</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="field"
            />
            <p className="text-xs text-muted mt-1">Shown on the account tab.</p>
          </div>

          {account.account_number_masked && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Account number</label>
              <p className="font-mono text-sm text-muted">{account.account_number_masked}</p>
            </div>
          )}

          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-withdrawal">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

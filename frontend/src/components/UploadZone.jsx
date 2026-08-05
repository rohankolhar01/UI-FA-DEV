import { useCallback, useState } from 'react'

export default function UploadZone({ onFile, loading, error, compact = false }) {
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }, [onFile])

  return (
    <div className={compact ? '' : 'max-w-2xl mx-auto mt-16 px-6'}>
      {!compact && (
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-ink mb-3">Upload a bank statement</h1>
          <p className="text-muted max-w-md mx-auto">
            Ledger reads every transaction from your statement PDF, identifies the vendor and
            payment note, and categorises your spend automatically.
          </p>
        </div>
      )}

      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`block cursor-pointer border-2 border-dashed rounded-card p-12 text-center transition-colors
          ${dragging ? 'border-brand bg-brandSoft' : 'border-rule bg-surface hover:border-brand/60'}`}
      >
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        />
        <div className="w-11 h-11 rounded-lg bg-brandSoft text-brand grid place-items-center mx-auto mb-3 text-sm font-semibold">
          PDF
        </div>
        <p className="font-medium text-ink mb-1">
          {loading ? 'Reading your statement…' : 'Drop your statement here, or click to browse'}
        </p>
        <p className="text-sm text-muted">Processed locally on your own server.</p>
      </label>

      {error && (
        <div className="mt-4 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-withdrawal">
          {error}
        </div>
      )}
    </div>
  )
}

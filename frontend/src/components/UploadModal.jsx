import UploadZone from './UploadZone'

export default function UploadModal({ title, onFile, loading, error, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 flex items-start justify-center overflow-y-auto py-16 px-4">
      <div className="card max-w-2xl w-full relative shadow-raised">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-muted hover:text-ink text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
        <div className="p-6">
          {title && <h2 className="font-display text-lg mb-4">{title}</h2>}
          <UploadZone onFile={onFile} loading={loading} error={error} compact />
        </div>
      </div>
    </div>
  )
}

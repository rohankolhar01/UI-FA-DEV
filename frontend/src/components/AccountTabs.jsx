export default function AccountTabs({ accounts, selectedId, onSelect, onAddNew, onEdit, onDelete }) {
  return (
    <div className="border-b border-rule bg-surface sticky top-14 z-10">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 overflow-x-auto">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => onSelect(acc.id)}
            className={`group relative shrink-0 px-4 py-3 text-sm cursor-pointer border-b-2 transition-colors
              ${selectedId === acc.id
                ? 'border-brand text-brand font-medium'
                : 'border-transparent text-muted hover:text-ink'}`}
          >
            <span className="flex items-center gap-2">
              {acc.label}
              <span
                className={`gap-2 text-xs ${selectedId === acc.id ? 'inline-flex' : 'hidden group-hover:inline-flex'}`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(acc) }}
                  className="text-muted hover:text-brand font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${acc.label}" and all its transactions?`)) onDelete(acc.id) }}
                  className="text-muted hover:text-withdrawal font-medium"
                >
                  Delete
                </button>
              </span>
            </span>
          </div>
        ))}
        <button
          onClick={onAddNew}
          className="shrink-0 px-4 py-3 text-sm text-brand hover:text-brandDark font-medium"
        >
          + Add account
        </button>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { updateTransactionCategory } from '../api'

const fmt = (n) =>
  n ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n) : '—'

export default function TransactionTable({ transactions, categories, onCategoryChanged }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState(null)

  const presentCategories = useMemo(
    () => ['All', ...Array.from(new Set(transactions.map((t) => t.category))).sort()],
    [transactions]
  )

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const haystack = `${t.particulars} ${t.vendor || ''} ${t.description || ''}`.toLowerCase()
      const matchesQuery = query ? haystack.includes(query.toLowerCase()) : true
      const matchesCategory = category === 'All' ? true : t.category === category
      return matchesQuery && matchesCategory
    })
  }, [transactions, query, category])

  const handleChange = async (transaction, next) => {
    if (next === transaction.category) return
    setSavingId(transaction.id)
    setError(null)
    try {
      const updated = await updateTransactionCategory(transaction.id, next)
      onCategoryChanged?.(updated)
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-5 border-b border-rule">
        <div>
          <h3 className="font-display text-base">Transactions</h3>
          <p className="text-xs text-muted mt-0.5">
            Showing {filtered.length} of {transactions.length}. Category can be corrected inline.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vendor or description…"
            className="field flex-1 sm:w-64"
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="field w-auto">
            {presentCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <p className="px-5 py-2 text-sm text-withdrawal bg-red-50 border-b border-rule">{error}</p>
      )}

      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-paper z-10">
            <tr className="text-xs font-medium uppercase tracking-wide text-muted border-b border-rule">
              <th className="text-left px-5 py-3">Date</th>
              <th className="text-left px-5 py-3">Vendor</th>
              <th className="text-left px-5 py-3">Description</th>
              <th className="text-left px-5 py-3">Category</th>
              <th className="text-right px-5 py-3">Expense</th>
              <th className="text-right px-5 py-3">Credit</th>
              <th className="text-right px-5 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-rule/70 hover:bg-brandSoft/40">
                <td className="px-5 py-2.5 whitespace-nowrap text-muted tabular-nums">{t.date}</td>
                <td className="px-5 py-2.5 max-w-[220px] truncate font-medium" title={t.particulars}>
                  {t.vendor || <span className="text-muted font-normal">—</span>}
                </td>
                <td className="px-5 py-2.5 max-w-[200px] truncate text-muted" title={t.description || ''}>
                  {t.description || '—'}
                </td>
                <td className="px-5 py-2.5">
                  <select
                    value={t.category}
                    disabled={savingId === t.id}
                    onChange={(e) => handleChange(t, e.target.value)}
                    className={`text-xs rounded-md border px-2 py-1 outline-none cursor-pointer transition-colors
                      focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-50
                      ${t.category === 'Uncategorized'
                        ? 'border-amber-300 bg-amber-50 text-warn'
                        : 'border-rule bg-white text-ink hover:border-brand'}`}
                  >
                    {(categories?.length ? categories : [t.category]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {categories?.length && !categories.includes(t.category) && (
                      <option value={t.category}>{t.category}</option>
                    )}
                  </select>
                </td>
                <td className="px-5 py-2.5 text-right text-withdrawal tabular-nums">
                  {t.withdrawal ? fmt(t.withdrawal) : ''}
                </td>
                <td className="px-5 py-2.5 text-right text-deposit tabular-nums">
                  {t.deposit ? fmt(t.deposit) : ''}
                </td>
                <td className="px-5 py-2.5 text-right text-muted tabular-nums">{fmt(t.balance)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted">No transactions match that search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

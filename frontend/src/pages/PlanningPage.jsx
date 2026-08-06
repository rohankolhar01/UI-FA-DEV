import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  listBudgets, saveBudget, deleteBudget, listCategories,
} from '../api'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

// Distinct hues, not shades of the same colour, so adjacent slices never blur together.
const PALETTE = [
  '#2563EB', '#D97706', '#059669', '#7C3AED', '#DB2777',
  '#0891B2', '#65A30D', '#4F46E5', '#EA580C', '#0D9488',
]

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function todayParts() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function monthKey(year, monthNum) {
  return `${year}-${String(monthNum).padStart(2, '0')}`
}

function monthLabel(month) {
  const [y, m] = month.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function PlanningPage() {
  const { year: thisYear, month: thisMonth } = todayParts()
  const [year, setYear] = useState(thisYear)
  const [month, setMonth] = useState(null) // null = showing the month picker grid

  if (!month) {
    return (
      <MonthGrid
        year={year}
        currentYear={thisYear}
        currentMonth={thisMonth}
        onPrevYear={() => setYear((y) => y - 1)}
        onNextYear={() => setYear((y) => y + 1)}
        onPick={(m) => setMonth(monthKey(year, m))}
      />
    )
  }

  return <MonthPlanner month={month} onBack={() => setMonth(null)} />
}

function MonthGrid({ year, currentYear, currentMonth, onPrevYear, onNextYear, onPick }) {
  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      <div className="text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-brand mb-1">Expense Planning</p>
        <h1 className="font-display text-2xl">Pick a month</h1>
        <p className="text-sm text-muted mt-1">Choose a month to set your budget or review your plan.</p>
      </div>

      <div className="rounded-3xl border border-rule bg-gradient-to-b from-brandSoft/70 to-white shadow-card p-6 sm:p-8 space-y-7">
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={onPrevYear}
            aria-label="Previous year"
            className="h-9 w-9 rounded-full border border-rule bg-white text-muted flex items-center justify-center transition hover:border-brand hover:text-brand"
          >
            ‹
          </button>
          <span className="font-display text-xl tabular-nums w-16 text-center text-ink">{year}</span>
          <button
            onClick={onNextYear}
            aria-label="Next year"
            className="h-9 w-9 rounded-full border border-rule bg-white text-muted flex items-center justify-center transition hover:border-brand hover:text-brand"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MONTH_NAMES.map((name, i) => {
            const m = i + 1
            const isCurrent = year === currentYear && m === currentMonth
            return (
              <button
                key={name}
                onClick={() => onPick(m)}
                className={`group relative overflow-hidden aspect-[3/2] rounded-2xl border bg-white shadow-card flex flex-col items-start justify-end p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-raised hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 ${
                  isCurrent ? 'border-brand' : 'border-rule'
                }`}
              >
                {/* Faint calendar watermark, built from plain shapes so it can't render as a blob */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-3 -top-3 h-16 w-16 transition-colors ${
                    isCurrent ? 'text-brand/30' : 'text-brand/15 group-hover:text-brand/25'
                  }`}
                >
                  <rect x="3" y="5" width="18" height="15" rx="2" />
                  <path d="M3 9.5h18" />
                  <path d="M8 3v4" />
                  <path d="M16 3v4" />
                </svg>

                {isCurrent && (
                  <span className="mb-2 inline-block rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    This month
                  </span>
                )}
                <span className={`font-display text-2xl sm:text-3xl leading-none ${isCurrent ? 'text-brand' : 'text-ink'}`}>
                  {name}
                </span>
                <span className="text-xs text-muted mt-1">{year}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MonthPlanner({ month, onBack }) {
  // Nothing auto-pulled — the planner starts nil. Credit and Debit are both
  // free-form category + amount lists, e.g. "Salary / Income" is just another
  // Credit entry the same way "Groceries" is just another Debit entry.
  const [credits, setCredits] = useState([]) // [{id, category, planned_amount}]
  const [expenses, setExpenses] = useState([]) // [{id, category, planned_amount}]
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newCreditCategory, setNewCreditCategory] = useState('')
  const [newCreditAmount, setNewCreditAmount] = useState('')
  const [addingCredit, setAddingCredit] = useState(false)

  const [newCategory, setNewCategory] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [addingExpense, setAddingExpense] = useState(false)

  const load = async (m) => {
    setLoading(true)
    setError(null)
    try {
      const [rows, cats] = await Promise.all([
        listBudgets(m), categories.length ? Promise.resolve(categories) : listCategories(),
      ])
      setCategories(cats)

      const creditRows = rows.filter((r) => r.entry_type === 'income')
      setCredits(creditRows)
      setNewCreditCategory((prev) => prev || cats.find((c) => !creditRows.some((r) => r.category === c)) || cats[0] || '')

      const expenseRows = rows.filter((r) => r.entry_type !== 'income')
      setExpenses(expenseRows)
      setNewCategory((prev) => prev || cats.find((c) => !expenseRows.some((e) => e.category === c)) || cats[0] || '')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(month) }, [month])

  const totalAvailable = useMemo(() => credits.reduce((s, c) => s + c.planned_amount, 0), [credits])
  const totalPlanned = useMemo(() => expenses.reduce((s, e) => s + e.planned_amount, 0), [expenses])
  const remaining = totalAvailable - totalPlanned

  const chartData = expenses
    .filter((e) => e.planned_amount > 0)
    .map((e) => ({ name: e.category, value: e.planned_amount }))

  const handleAddCredit = async (e) => {
    e.preventDefault()
    const value = parseFloat(newCreditAmount)
    if (!newCreditCategory || Number.isNaN(value) || value < 0) {
      setError('Pick a source and enter an amount.')
      return
    }
    setAddingCredit(true)
    setError(null)
    try {
      await saveBudget({ month, category: newCreditCategory, planned_amount: value, note: '', entry_type: 'income' })
      setNewCreditAmount('')
      await load(month)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingCredit(false)
    }
  }

  const handleAddExpense = async (e) => {
    e.preventDefault()
    const value = parseFloat(newAmount)
    if (!newCategory || Number.isNaN(value) || value < 0) {
      setError('Pick a category and enter an amount.')
      return
    }
    setAddingExpense(true)
    setError(null)
    try {
      await saveBudget({ month, category: newCategory, planned_amount: value, note: '', entry_type: 'expense' })
      setNewAmount('')
      await load(month)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingExpense(false)
    }
  }

  const handleRemoveEntry = async (id) => {
    await deleteBudget(id)
    load(month)
  }

  const availableCreditCategories = categories.filter((c) => !credits.some((r) => r.category === c))
  const availableCategories = categories.filter((c) => !expenses.some((e) => e.category === c))

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6">
      <div>
        <button onClick={onBack} className="text-xs font-medium uppercase tracking-wide text-brand mb-1 hover:text-brandDark">
          ‹ Back to months
        </button>
        <h1 className="font-display text-2xl">Plan for {monthLabel(month)}</h1>
        <p className="text-sm text-muted mt-1">
          Enter what you have, then decide how much to set aside for each expense.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-withdrawal">{error}</div>
      )}

      {/* Balance — Credit total minus Debit total, up front so it's the first thing you see. */}
      <div className={`card p-6 text-center ${remaining < 0 ? 'bg-red-50 border-withdrawal/30' : ''}`}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-2">Balance</p>
        <p className={`text-4xl font-semibold tabular-nums ${remaining < 0 ? 'text-withdrawal' : 'text-deposit'}`}>
          {remaining < 0 ? `-${fmt(-remaining)}` : fmt(remaining)}
        </p>
        <p className="text-sm text-muted mt-2">
          <span className="tabular-nums text-deposit font-medium">{fmt(totalAvailable)}</span> credit
          {' − '}
          <span className="tabular-nums text-red-400 font-medium">{fmt(totalPlanned)}</span> debit
        </p>
      </div>

      {/* Everything in one card — Credit + Debit forms side by side, one combined list, chart on the right. */}
      <div className="card p-6">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-8">
          {/* Left: Credit + Debit forms side by side, then one combined list */}
          <div>
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-deposit" aria-hidden="true" />
                  <h3 className="font-display text-base">Credit</h3>
                </div>
                <form onSubmit={handleAddCredit} className="flex flex-col gap-3">
                  <select value={newCreditCategory} onChange={(e) => setNewCreditCategory(e.target.value)} className="field">
                    {(availableCreditCategories.length ? availableCreditCategories : categories).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number" min="0" step="1" value={newCreditAmount}
                      onChange={(e) => setNewCreditAmount(e.target.value)}
                      placeholder="Amount (₹)" className="field"
                    />
                    <button type="submit" disabled={addingCredit} className="btn-primary shrink-0">
                      {addingCredit ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden="true" />
                  <h3 className="font-display text-base">Debit</h3>
                </div>
                <form onSubmit={handleAddExpense} className="flex flex-col gap-3">
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="field">
                    {(availableCategories.length ? availableCategories : categories).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="number" min="0" step="1" value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="Amount (₹)" className="field"
                    />
                    <button type="submit" disabled={addingExpense} className="btn-primary shrink-0">
                      {addingExpense ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* One combined list — credit entries in green, debit entries in red */}
            {loading ? (
              <p className="text-center text-muted text-sm py-6">Loading…</p>
            ) : credits.length === 0 && expenses.length === 0 ? (
              <p className="text-center text-muted text-sm py-6">Nothing added yet.</p>
            ) : (
              <ul className="space-y-2">
                {[...credits, ...expenses].map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between rounded-md border border-rule px-3 py-2">
                    <span className="text-sm font-medium">{entry.category}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm tabular-nums font-medium ${entry.entry_type === 'income' ? 'text-deposit' : 'text-red-400'}`}>
                        {fmt(entry.planned_amount)}
                      </span>
                      <button
                        onClick={() => handleRemoveEntry(entry.id)}
                        className="text-xs text-muted hover:text-withdrawal font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: the debit breakdown, plotted only from Debit entries */}
          <div className="flex items-center justify-center lg:border-l lg:border-rule lg:pl-8">
            {chartData.length === 0 ? (
              <p className="text-center text-muted text-sm">Add a debit to see the breakdown.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={2}>
                    {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  listBudgets, saveBudget, deleteBudget, listCategories, planSummary,
} from '../api'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const INCOME_CATEGORY = 'Income'

// Distinct hues, not shades of the same colour, so adjacent slices never blur together.
const PALETTE = [
  '#2563EB', '#D97706', '#059669', '#7C3AED', '#DB2777',
  '#0891B2', '#65A30D', '#4F46E5', '#EA580C', '#0D9488',
]

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(month) {
  const [y, m] = month.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function PlanningPage() {
  const [month, setMonth] = useState(currentMonth())
  const [balance, setBalance] = useState(0)
  const [income, setIncome] = useState('')
  const [incomeId, setIncomeId] = useState(null)
  const [expenses, setExpenses] = useState([]) // [{id, category, planned_amount}]
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newCategory, setNewCategory] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [savingIncome, setSavingIncome] = useState(false)
  const [addingExpense, setAddingExpense] = useState(false)

  const load = async (m) => {
    setLoading(true)
    setError(null)
    try {
      const [rows, summary, cats] = await Promise.all([
        listBudgets(m), planSummary(), categories.length ? Promise.resolve(categories) : listCategories(),
      ])
      setBalance(summary.available_balance)
      setCategories(cats)

      const incomeRow = rows.find((r) => r.entry_type === 'income' && r.category === INCOME_CATEGORY)
      setIncome(incomeRow ? String(incomeRow.planned_amount) : '')
      setIncomeId(incomeRow ? incomeRow.id : null)

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

  const totalPlanned = useMemo(() => expenses.reduce((s, e) => s + e.planned_amount, 0), [expenses])
  const totalAvailable = balance + (parseFloat(income) || 0)
  const remaining = totalAvailable - totalPlanned

  const chartData = expenses
    .filter((e) => e.planned_amount > 0)
    .map((e) => ({ name: e.category, value: e.planned_amount }))

  const handleSaveIncome = async () => {
    const value = parseFloat(income) || 0
    setSavingIncome(true)
    setError(null)
    try {
      const saved = await saveBudget({
        month, category: INCOME_CATEGORY, planned_amount: value, note: '', entry_type: 'income',
      })
      setIncomeId(saved.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingIncome(false)
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

  const handleRemoveExpense = async (id) => {
    await deleteBudget(id)
    load(month)
  }

  const availableCategories = categories.filter((c) => !expenses.some((e) => e.category === c))

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand mb-1">Expense Planning</p>
          <h1 className="font-display text-2xl">Plan for {monthLabel(month)}</h1>
          <p className="text-sm text-muted mt-1">
            Check your balance, then decide how much to set aside for each expense.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Month</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="field w-auto" />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-withdrawal">{error}</div>
      )}

      {/* Step 1: how much you have */}
      <div className="card p-6">
        <h3 className="font-display text-base mb-5">1. How much do you have?</h3>

        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1.5">Current balance</p>
        <p className="text-3xl font-semibold tabular-nums">{fmt(balance)}</p>
        <p className="text-xs text-muted mt-1 mb-5">From your latest uploaded statement</p>

        <div className="flex flex-wrap items-end gap-2">
          <span className="text-sm text-muted shrink-0">+ Expected income this month</span>
          <input
            type="number" min="0" step="1" value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="e.g. salary"
            className="field w-40"
          />
          <button onClick={handleSaveIncome} disabled={savingIncome} className="btn-secondary shrink-0">
            {savingIncome ? '…' : 'Save'}
          </button>
        </div>

        <p className="text-sm mt-5">
          <span className="text-muted">Total available to plan with: </span>
          <span className="font-semibold tabular-nums text-brand">{fmt(totalAvailable)}</span>
        </p>
      </div>

      {/* Step 2: where it will go */}
      <div className="card p-6">
        <h3 className="font-display text-base mb-4">2. Where will it go?</h3>

        <form onSubmit={handleAddExpense} className="flex flex-col sm:flex-row gap-3 mb-5">
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="field sm:w-56">
            {(availableCategories.length ? availableCategories : categories).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number" min="0" step="1" value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            placeholder="Amount (₹)" className="field sm:w-40"
          />
          <button type="submit" disabled={addingExpense} className="btn-primary sm:w-auto">
            {addingExpense ? 'Adding…' : 'Add'}
          </button>
        </form>

        {loading ? (
          <p className="text-center text-muted text-sm py-10">Loading…</p>
        ) : expenses.length === 0 ? (
          <p className="text-center text-muted text-sm py-10">
            Nothing planned yet. Add a category above — e.g. Groceries, Rent, Food & Dining.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <ul className="space-y-2">
              {expenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-md border border-rule px-3 py-2">
                  <span className="text-sm font-medium">{e.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm tabular-nums text-ink">{fmt(e.planned_amount)}</span>
                    <button
                      onClick={() => handleRemoveExpense(e.id)}
                      className="text-xs text-muted hover:text-withdrawal font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {chartData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Summary — one line, not a row of stat tiles */}
      <div className={`card p-6 ${remaining < 0 ? 'bg-red-50 border-withdrawal/30' : ''}`}>
        <p className="text-base leading-relaxed">
          You have <span className="font-semibold tabular-nums">{fmt(totalAvailable)}</span> available and have
          planned <span className="font-semibold tabular-nums">{fmt(totalPlanned)}</span> in expenses —{' '}
          {remaining < 0 ? (
            <span className="font-semibold tabular-nums text-withdrawal">
              that's {fmt(-remaining)} more than you have.
            </span>
          ) : (
            <span className="font-semibold tabular-nums text-deposit">
              {fmt(remaining)} left unplanned.
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import {
  listEmis, createEmi, deleteEmi, listReminders, createReminder, setReminderDone, deleteReminder,
} from '../api'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function today() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function ordinal(n) {
  if (n >= 11 && n <= 13) return `${n}th`
  const last = n % 10
  return `${n}${last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th'}`
}

// A 7-wide grid of day numbers (null = blank leading/trailing cell) for one month.
function buildWeeks(year, month) {
  const total = daysInMonth(year, month)
  const startWeekday = new Date(year, month - 1, 1).getDay()
  const cells = [...Array(startWeekday).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default function RemindersPage() {
  const { year: thisYear, month: thisMonth, day: thisDay } = today()
  const [viewYear, setViewYear] = useState(thisYear)
  const [viewMonth, setViewMonth] = useState(thisMonth) // 1-12
  const [modalDay, setModalDay] = useState(null)        // day number, or null when closed

  const [emis, setEmis] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [e, r] = await Promise.all([listEmis(), listReminders()])
      setEmis(e)
      setReminders(r)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const weeks = useMemo(() => buildWeeks(viewYear, viewMonth), [viewYear, viewMonth])
  const monthDays = daysInMonth(viewYear, viewMonth)

  // EMIs recur every month, so a due_day marks a cell whenever it exists in the viewed month.
  const emisByDay = useMemo(() => {
    const map = {}
    for (const e of emis) {
      if (e.due_day <= monthDays) (map[e.due_day] ||= []).push(e)
    }
    return map
  }, [emis, monthDays])

  // Reminders are pinned to one specific calendar date.
  const remindersByDay = useMemo(() => {
    const map = {}
    const prefix = `${viewYear}-${pad2(viewMonth)}-`
    for (const r of reminders) {
      if (r.due_date.startsWith(prefix)) {
        const day = Number(r.due_date.slice(8, 10))
        ;(map[day] ||= []).push(r)
      }
    }
    return map
  }, [reminders, viewYear, viewMonth])

  // What's due today, surfaced up front so a due EMI is impossible to miss.
  const dueToday = useMemo(() => {
    const todayStr = `${thisYear}-${pad2(thisMonth)}-${pad2(thisDay)}`
    const emisDue = emis.filter((e) => e.due_day === thisDay)
    const remindersDue = reminders.filter((r) => r.due_date === todayStr && !r.done)
    return { emis: emisDue, reminders: remindersDue }
  }, [emis, reminders, thisYear, thisMonth, thisDay])

  const goPrevMonth = () => {
    if (viewMonth === 1) { setViewYear((y) => y - 1); setViewMonth(12) } else { setViewMonth((m) => m - 1) }
  }
  const goNextMonth = () => {
    if (viewMonth === 12) { setViewYear((y) => y + 1); setViewMonth(1) } else { setViewMonth((m) => m + 1) }
  }

  const handleDeleteEmi = async (id) => {
    await deleteEmi(id)
    load()
  }

  const handleToggleReminder = async (r) => {
    await setReminderDone(r.id, !r.done)
    load()
  }

  const handleDeleteReminder = async (id) => {
    await deleteReminder(id)
    load()
  }

  const isThisMonth = viewYear === thisYear && viewMonth === thisMonth
  const hasDueToday = dueToday.emis.length > 0 || dueToday.reminders.length > 0

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand mb-1">EMI &amp; Reminders</p>
        <h1 className="font-display text-2xl">Calendar</h1>
        <p className="text-sm text-muted mt-1">
          Click any date to add an EMI or reminder for that day.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-withdrawal">{error}</div>
      )}

      {/* Due today — the actual "your EMI is due" nudge */}
      {hasDueToday && (
        <div className="card p-4 border-brand/40 bg-brandSoft">
          <p className="text-sm font-medium text-brandDark mb-2">Due today</p>
          <ul className="space-y-1">
            {dueToday.emis.map((e) => (
              <li key={`emi-${e.id}`} className="text-sm">
                <span className="font-medium">{e.name}</span>
                <span className="text-muted"> — EMI of </span>
                <span className="font-medium tabular-nums">{fmt(e.monthly_amount)}</span>
              </li>
            ))}
            {dueToday.reminders.map((r) => (
              <li key={`rem-${r.id}`} className="text-sm">
                <span className="font-medium">{r.title}</span>
                {r.note && <span className="text-muted"> — {r.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Calendar */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <button onClick={goPrevMonth} aria-label="Previous month" className="btn-secondary px-3">‹</button>
          <span className="font-display text-lg">{MONTH_NAMES[viewMonth - 1]} {viewYear}</span>
          <button onClick={goNextMonth} aria-label="Next month" className="btn-secondary px-3">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-xs font-medium uppercase tracking-wide text-muted py-1">{w}</div>
          ))}
        </div>

        <div className="space-y-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1.5">
              {week.map((day, di) => {
                if (day === null) return <div key={di} />
                const dayEmis = emisByDay[day] || []
                const dayReminders = remindersByDay[day] || []
                const isToday = isThisMonth && day === thisDay
                return (
                  <button
                    key={di}
                    onClick={() => setModalDay(day)}
                    title={`Add or view items for ${MONTH_NAMES[viewMonth - 1]} ${day}`}
                    className={`aspect-square rounded-lg border p-1.5 text-sm flex flex-col items-center justify-start gap-1 transition
                      hover:border-brand hover:bg-brandSoft/50
                      ${isToday ? 'border-brand ring-1 ring-brand/40' : 'border-rule bg-white'}`}
                  >
                    <span className={isToday ? 'font-semibold text-brand' : 'text-ink'}>{day}</span>
                    {(dayEmis.length > 0 || dayReminders.length > 0) && (
                      <span className="flex flex-wrap justify-center gap-1">
                        {dayEmis.map((e) => (
                          <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-deposit" aria-hidden="true" />
                        ))}
                        {dayReminders.map((r) => (
                          <span key={r.id} className="h-1.5 w-1.5 rounded-full bg-brand2" aria-hidden="true" />
                        ))}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-rule text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-deposit" aria-hidden="true" /> EMI (monthly)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand2" aria-hidden="true" /> Reminder
          </span>
        </div>
      </div>

      {/* Everything added, for review and removal */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display text-base mb-4">EMIs</h3>
          {loading ? (
            <p className="text-center text-muted text-sm py-4">Loading…</p>
          ) : emis.length === 0 ? (
            <p className="text-center text-muted text-sm py-4">
              None yet — click a date above to add one.
            </p>
          ) : (
            <ul className="space-y-2">
              {emis.map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-md border border-rule px-3 py-2">
                  <span className="text-sm min-w-0">
                    <span className="font-medium">{e.name}</span>
                    <span className="text-muted"> · every {ordinal(e.due_day)}</span>
                  </span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm tabular-nums">{fmt(e.monthly_amount)}</span>
                    <button onClick={() => handleDeleteEmi(e.id)} className="text-xs text-muted hover:text-withdrawal font-medium">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-display text-base mb-4">Reminders</h3>
          {loading ? (
            <p className="text-center text-muted text-sm py-4">Loading…</p>
          ) : reminders.length === 0 ? (
            <p className="text-center text-muted text-sm py-4">
              None yet — click a date above to add one.
            </p>
          ) : (
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-md border border-rule px-3 py-2">
                  <label className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer">
                    <input type="checkbox" checked={r.done} onChange={() => handleToggleReminder(r)} className="shrink-0" />
                    <span className="min-w-0">
                      <span className={`text-sm font-medium ${r.done ? 'line-through text-muted' : ''}`}>{r.title}</span>
                      <span className="block text-xs text-muted">{r.due_date}</span>
                    </span>
                  </label>
                  <button onClick={() => handleDeleteReminder(r.id)} className="text-xs text-muted hover:text-withdrawal font-medium shrink-0">
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {modalDay !== null && (
        <DayModal
          year={viewYear}
          month={viewMonth}
          day={modalDay}
          emis={emisByDay[modalDay] || []}
          reminders={remindersByDay[modalDay] || []}
          onClose={() => setModalDay(null)}
          onSaved={load}
          onDeleteEmi={handleDeleteEmi}
          onDeleteReminder={handleDeleteReminder}
        />
      )}
    </div>
  )
}

function DayModal({ year, month, day, emis, reminders, onClose, onSaved, onDeleteEmi, onDeleteReminder }) {
  const [kind, setKind] = useState('emi') // 'emi' | 'reminder'
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const dateStr = `${year}-${pad2(month)}-${pad2(day)}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setErr(kind === 'emi' ? 'Give the EMI a name.' : 'Give the reminder a title.')
      return
    }
    setSaving(true)
    setErr(null)
    try {
      if (kind === 'emi') {
        await createEmi({ name: name.trim(), monthly_amount: parseFloat(amount) || 0, due_day: day })
      } else {
        await createReminder({ title: name.trim(), due_date: dateStr, note })
      }
      await onSaved()
      onClose()
    } catch (e2) {
      setErr(e2.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 flex items-start justify-center overflow-y-auto py-16 px-4"
      onClick={onClose}
    >
      <div className="card max-w-md w-full relative shadow-raised" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-muted hover:text-ink text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <div className="p-6">
          <h2 className="font-display text-lg mb-1">{MONTH_NAMES[month - 1]} {day}, {year}</h2>
          <p className="text-xs text-muted mb-5">
            An EMI added here repeats on the {ordinal(day)} of every month.
          </p>

          {/* Already on this day */}
          {(emis.length > 0 || reminders.length > 0) && (
            <ul className="space-y-2 mb-5">
              {emis.map((e) => (
                <li key={`emi-${e.id}`} className="flex items-center justify-between rounded-md border border-rule px-3 py-2">
                  <span className="flex items-center gap-2 min-w-0 text-sm">
                    <span className="h-2 w-2 rounded-full bg-deposit shrink-0" aria-hidden="true" />
                    <span className="font-medium truncate">{e.name}</span>
                  </span>
                  <span className="flex items-center gap-3 shrink-0">
                    <span className="text-sm tabular-nums">{fmt(e.monthly_amount)}</span>
                    <button
                      onClick={() => { onDeleteEmi(e.id); onClose() }}
                      className="text-xs text-muted hover:text-withdrawal font-medium"
                    >
                      Remove
                    </button>
                  </span>
                </li>
              ))}
              {reminders.map((r) => (
                <li key={`rem-${r.id}`} className="flex items-center justify-between rounded-md border border-rule px-3 py-2">
                  <span className="flex items-center gap-2 min-w-0 text-sm">
                    <span className="h-2 w-2 rounded-full bg-brand2 shrink-0" aria-hidden="true" />
                    <span className={`font-medium truncate ${r.done ? 'line-through text-muted' : ''}`}>{r.title}</span>
                  </span>
                  <button
                    onClick={() => { onDeleteReminder(r.id); onClose() }}
                    className="text-xs text-muted hover:text-withdrawal font-medium shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          {err && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-withdrawal mb-3">{err}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setKind('emi'); setErr(null) }}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  kind === 'emi' ? 'border-brand bg-brandSoft text-brand' : 'border-rule text-muted hover:text-ink'
                }`}
              >
                EMI
              </button>
              <button
                type="button"
                onClick={() => { setKind('reminder'); setErr(null) }}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  kind === 'reminder' ? 'border-brand bg-brandSoft text-brand' : 'border-rule text-muted hover:text-ink'
                }`}
              >
                Reminder
              </button>
            </div>

            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={kind === 'emi' ? 'e.g. Home Loan, Car, Cooler' : 'e.g. Renew insurance'}
              className="field"
            />

            {kind === 'emi' ? (
              <input
                type="number" min="0" step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (₹)"
                className="field"
              />
            ) : (
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="field"
              />
            )}

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving…' : kind === 'emi' ? `Save EMI for the ${ordinal(day)}` : 'Save reminder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

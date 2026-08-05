const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

function Card({ label, value, tone = 'ink' }) {
  const toneClass = {
    ink: 'text-ink',
    withdrawal: 'text-withdrawal',
    deposit: 'text-deposit',
  }[tone]
  return (
    <div className="card px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1.5">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums ${toneClass}`}>{value}</p>
    </div>
  )
}

export default function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <Card label="Total Expenses" value={fmt(summary.total_withdrawals)} tone="withdrawal" />
      <Card label="Total Credits" value={fmt(summary.total_deposits)} tone="deposit" />
      <Card
        label="Net Position"
        value={fmt(summary.net)}
        tone={summary.net >= 0 ? 'deposit' : 'withdrawal'}
      />
      <Card label="Transactions" value={summary.total_transactions} />
      {summary.opening_balance != null && (
        <Card label="Opening Balance" value={fmt(summary.opening_balance)} />
      )}
      {summary.closing_balance != null && (
        <Card label="Closing Balance" value={fmt(summary.closing_balance)} />
      )}
    </div>
  )
}

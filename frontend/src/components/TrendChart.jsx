import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

export default function TrendChart({ data }) {
  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-base">Monthly Trend</h3>
        <span className="text-xs text-muted">Expenses vs credits</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ left: 0, right: 16, top: 8 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.28)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: 'rgba(148,163,184,0.38)' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={64}
            tickFormatter={(v) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(v)}
          />
          <Tooltip
            formatter={(v) => fmt(v)}
            contentStyle={{
              border: '1px solid rgba(255,255,255,0.7)', borderRadius: 12, fontSize: 12,
              background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 24px rgba(49,46,129,0.14)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
          <Line type="monotone" dataKey="withdrawals" stroke="#C81E1E" strokeWidth={2} dot={{ r: 3 }} name="Expenses" />
          <Line type="monotone" dataKey="deposits" stroke="#047857" strokeWidth={2} dot={{ r: 3 }} name="Credits" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

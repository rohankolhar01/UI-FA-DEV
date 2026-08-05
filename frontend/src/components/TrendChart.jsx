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
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} width={64}
            tickFormatter={(v) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(v)}
          />
          <Tooltip
            formatter={(v) => fmt(v)}
            contentStyle={{
              border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12,
              boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
          <Line type="monotone" dataKey="withdrawals" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} name="Expenses" />
          <Line type="monotone" dataKey="deposits" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} name="Credits" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

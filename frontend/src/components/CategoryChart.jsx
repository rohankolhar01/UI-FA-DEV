import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Sequential blues: one visual family, darkest = largest spend.
const PALETTE = [
  '#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA',
  '#7DA9FB', '#93C5FD', '#A9D2FE', '#BFDBFE', '#DBEAFE',
]

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

export default function CategoryChart({ data }) {
  const chartData = (data || []).slice(0, 10).map((d) => ({ name: d.category, total: d.total }))

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-base">Expenses by Category</h3>
        <span className="text-xs text-muted">Top {chartData.length}</span>
      </div>
      {chartData.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">No categorised expenses yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(240, chartData.length * 36)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 32 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={132}
              tick={{ fontSize: 12, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => [fmt(v), 'Spend']}
              cursor={{ fill: '#F1F5F9' }}
              contentStyle={{
                border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12,
                boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
              }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={18}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

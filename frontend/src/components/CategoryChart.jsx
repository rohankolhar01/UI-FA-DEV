import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Sequential indigo: one hue, dark→light, darkest = largest spend.
// Ordinal ramp — the lightest step still clears 2:1 on the app surface.
const PALETTE = [
  '#312E81', '#3730A3', '#4338CA', '#4F46E5', '#6366F1',
  '#7C7BF0', '#8B8AF2', '#9C9BF4', '#ADACF6', '#BEBDF8',
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
              cursor={{ fill: 'rgba(79,70,229,0.07)' }}
              contentStyle={{
                border: '1px solid rgba(255,255,255,0.7)', borderRadius: 12, fontSize: 12,
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 24px rgba(49,46,129,0.14)',
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

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Sequential cyan — the second sequential context, its own one-hue ramp so it
// never reads as "the same series" as the indigo category chart.
const PALETTE = [
  '#164E63', '#155E75', '#0E7490', '#0891B2', '#06A6C9',
  '#22B8D9', '#45C7E3', '#67D4EC', '#8BE0F2', '#AFEAF7',
]

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0)

export default function VendorChart({ data }) {
  const chartData = (data || [])
    .filter((d) => d.debit > 0)
    .slice(0, 10)
    .map((d) => ({ name: d.vendor, total: d.debit }))

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between mb-5">
        <h3 className="font-display text-base">Vendors Paid</h3>
        <span className="text-xs text-muted">Top {chartData.length}</span>
      </div>
      {chartData.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">No vendor payments recorded yet.</p>
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
              formatter={(v) => [fmt(v), 'Paid']}
              cursor={{ fill: 'rgba(6,182,212,0.08)' }}
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

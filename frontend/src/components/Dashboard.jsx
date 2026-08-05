import SummaryCards from './SummaryCards'
import CategoryChart from './CategoryChart'
import TrendChart from './TrendChart'
import VendorChart from './VendorChart'
import TransactionTable from './TransactionTable'
import { csvDownloadUrl, excelDownloadUrl } from '../api'

export default function Dashboard({ dashboard, warnings, categories, onCategoryChanged }) {
  const { account, transactions, summary } = dashboard
  const uncategorized = transactions.filter((t) => t.category === 'Uncategorized').length

  return (
    <div className="max-w-7xl mx-auto py-8 px-6 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted mb-1">
            {account.bank_name || 'Bank account'}
            {account.account_number_masked ? ` · ${account.account_number_masked}` : ''}
          </p>
          <h1 className="font-display text-2xl">{account.label}</h1>
        </div>
        <div className="flex gap-2">
          <a href={csvDownloadUrl(account.id)} className="btn-secondary">Export CSV</a>
          <a href={excelDownloadUrl(account.id)} className="btn-primary">Export Excel</a>
        </div>
      </div>

      {warnings?.length > 0 && (
        <div className="rounded-card border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warn">
          {warnings.map((w, i) => <p key={i}>{w}</p>)}
        </div>
      )}

      {uncategorized > 0 && (
        <div className="rounded-card border border-rule bg-brandSoft px-4 py-3 text-sm text-brandDark">
          {uncategorized} transaction{uncategorized === 1 ? '' : 's'} could not be categorised automatically.
          Set the category directly in the table below — your choice is kept on future uploads.
        </div>
      )}

      <SummaryCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={summary.by_category} />
        <VendorChart data={summary.vendor_breakdown} />
      </div>

      <TrendChart data={summary.by_month} />

      <TransactionTable
        transactions={transactions}
        categories={categories}
        onCategoryChanged={onCategoryChanged}
      />
    </div>
  )
}

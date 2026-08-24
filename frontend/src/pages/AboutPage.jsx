const STEPS = [
  {
    step: '01',
    title: 'Import',
    body: 'Upload a bank statement PDF. CredEx1 reconstructs the transaction table directly from the document — no manual entry or copy-paste.',
  },
  {
    step: '02',
    title: 'Extract',
    body: 'Each UPI, IMPS or NEFT narration is separated into the payee, the payment note entered at the time of payment, the reference number and the payment channel.',
  },
  {
    step: '03',
    title: 'Categorise',
    body: 'Vendor and note are matched against a rule set covering groceries, dining, transport, utilities, rent and more. Anything unmatched is flagged so you can assign the category yourself.',
  },
  {
    step: '04',
    title: 'Analyse and plan',
    body: 'Category and vendor breakdowns, monthly trends, and a planned-versus-actual view per category. Export the full register to CSV or Excel at any time.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand mb-3">About</p>
        <h1 className="font-display text-3xl mb-4">Built for clarity on where money goes.</h1>
        <p className="text-muted max-w-2xl text-lg">
          Bank statements are written for banks, not for people. CredEx1 turns a statement
          PDF into a readable account of who you paid, what it was for, and how spending
          tracks over time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.step} className="card p-6">
            <span className="inline-block rounded-lg bg-gradient-to-br from-brand to-brand2 px-2.5 py-1 text-xs font-semibold text-white mb-3 shadow-md shadow-brand/25">
              {s.step}
            </span>
            <h3 className="font-display text-base mb-2">{s.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-lg mb-2">Data handling</h2>
        <p className="text-muted text-sm max-w-2xl leading-relaxed">
          Statements are parsed by your own backend and stored in a PostgreSQL database you
          control. Every account and transaction is scoped to the user who uploaded it, and
          passwords are stored only as bcrypt hashes. No statement data is sent to any
          third-party service.
        </p>
      </div>
    </div>
  )
}

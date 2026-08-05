import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const FEATURES = [
  {
    title: 'Automated statement import',
    body: 'Upload a bank statement PDF. Every transaction — date, amount and running balance — is extracted without manual entry.',
  },
  {
    title: 'Vendor and purpose detection',
    body: 'The payee and the payment note you enter in your UPI app are read directly from the statement narration.',
  },
  {
    title: 'Spend analytics',
    body: 'Expenses broken down by category and vendor, tracked month over month across every account you hold.',
  },
  {
    title: 'Monthly expense planning',
    body: 'Set a planned amount per category and track it against actual spend, so overruns are visible early.',
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const firstName = (user?.name || user?.username || '').split(' ')[0]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto px-6 py-16"
    >
      <motion.p variants={item} className="text-xs font-medium uppercase tracking-wide text-brand mb-3">
        Overview
      </motion.p>
      <motion.h1 variants={item} className="font-display text-4xl mb-4">
        Welcome back{firstName ? `, ${firstName}` : ''}.
      </motion.h1>
      <motion.p variants={item} className="text-muted max-w-2xl mb-12 text-lg">
        Ledger converts raw bank statement narration into a clear view of your spending —
        who you paid, what for, and how it tracks against your plan.
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {FEATURES.map((f) => (
          <motion.div key={f.title} variants={item} className="card p-6">
            <h3 className="font-display text-base mb-2">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="card p-6 mb-10">
        <p className="text-xs font-medium uppercase tracking-wide text-muted mb-3">How it works</p>
        <p className="text-sm text-muted">
          You pay <span className="text-ink font-medium">Ramesh Kirana</span> via UPI and enter{' '}
          <span className="text-ink font-medium">"food"</span> as the note.
        </p>
        <p className="mt-2 text-sm text-muted">
          Ledger records it under vendor <span className="text-ink font-medium">Ramesh Kirana</span>, categorised as{' '}
          <span className="inline-block rounded-md bg-brandSoft px-2 py-0.5 text-xs font-medium text-brand">
            Food &amp; Dining
          </span>
          . Anything it can't classify, you can correct in one click.
        </p>
      </motion.div>

      <motion.div variants={item} className="flex gap-3">
        <Link to="/analysis" className="btn-primary">Go to Analysis</Link>
        <Link to="/planning" className="btn-secondary">Plan this month</Link>
      </motion.div>
    </motion.div>
  )
}

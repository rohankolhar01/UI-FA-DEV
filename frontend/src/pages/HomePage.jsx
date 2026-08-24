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
    tint: 'from-brand to-brand2',
    icon: (
      <>
        <path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M4 21h16" />
      </>
    ),
  },
  {
    title: 'Vendor and purpose detection',
    body: 'The payee and the payment note you enter in your UPI app are read directly from the statement narration.',
    tint: 'from-brand2 to-brand3',
    icon: (
      <>
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
      </>
    ),
  },
  {
    title: 'Spend analytics',
    body: 'Expenses broken down by category and vendor, tracked month over month across every account you hold.',
    tint: 'from-brand3 to-brand',
    icon: (
      <>
        <path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" />
      </>
    ),
  },
  {
    title: 'Monthly expense planning',
    body: 'Set a planned amount per category and track it against actual spend, so overruns are visible early.',
    tint: 'from-brand to-brand3',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18" />
        <path d="M8 3v4" /><path d="M16 3v4" />
      </>
    ),
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
        Welcome back{firstName ? ', ' : ''}
        {firstName && <span className="text-gradient">{firstName}</span>}.
      </motion.h1>
      <motion.p variants={item} className="text-muted max-w-2xl mb-12 text-lg">
        CredEx1 converts raw bank statement narration into a clear view of your spending —
        who you paid, what for, and how it tracks against your plan.
      </motion.p>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={item}
            className="card p-6 transition-transform duration-150 hover:-translate-y-0.5"
          >
            <span
              className={`mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${f.tint} text-white shadow-lg shadow-brand/20`}
            >
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-5 w-5"
              >
                {f.icon}
              </svg>
            </span>
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
          CredEx1 records it under vendor <span className="text-ink font-medium">Ramesh Kirana</span>, categorised as{' '}
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

const BASE = '/api'

async function handle(res, fallback) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: fallback }))
    throw new Error(err.detail || fallback)
  }
  return res.json()
}

export async function signup(username, password) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return handle(res, 'Could not create account.')
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  return handle(res, 'Incorrect username or password.')
}

export async function logout() {
  const res = await fetch(`${BASE}/auth/logout`, { method: 'POST' })
  return handle(res, 'Could not log out.')
}

export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`)
  if (res.status === 401) return null
  return handle(res, 'Could not load session.')
}

export async function uploadStatement(file, accountId) {
  const form = new FormData()
  form.append('file', file)
  if (accountId) form.append('account_id', accountId)
  const res = await fetch(`${BASE}/accounts/upload`, { method: 'POST', body: form })
  return handle(res, 'Upload failed.')
}

export async function listAccounts() {
  const res = await fetch(`${BASE}/accounts`)
  return handle(res, 'Could not load accounts.')
}

export async function getAccountDashboard(accountId) {
  const res = await fetch(`${BASE}/accounts/${accountId}`)
  return handle(res, 'Could not load account.')
}

export async function updateAccount(accountId, { label, bank_name }) {
  const res = await fetch(`${BASE}/accounts/${accountId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label, bank_name }),
  })
  return handle(res, 'Could not update account.')
}

export async function deleteAccount(accountId) {
  const res = await fetch(`${BASE}/accounts/${accountId}`, { method: 'DELETE' })
  return handle(res, 'Could not delete account.')
}

export async function getProfile() {
  const res = await fetch(`${BASE}/profile`)
  return handle(res, 'Could not load profile.')
}

export async function updateProfile(profile) {
  const res = await fetch(`${BASE}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  return handle(res, 'Could not save profile.')
}

export async function listStatementYears() {
  const res = await fetch(`${BASE}/statements/years`)
  return handle(res, 'Could not load years.')
}

export async function listStatementMonths(year) {
  const res = await fetch(`${BASE}/statements/months?year=${encodeURIComponent(year)}`)
  return handle(res, 'Could not load months.')
}

export async function listStatements(month) {
  const res = await fetch(`${BASE}/statements?month=${encodeURIComponent(month)}`)
  return handle(res, 'Could not load statements.')
}

export async function getStatementDashboard(statementId) {
  const res = await fetch(`${BASE}/statements/${statementId}`)
  return handle(res, 'Could not load that statement.')
}

export async function deleteStatement(statementId) {
  const res = await fetch(`${BASE}/statements/${statementId}`, { method: 'DELETE' })
  return handle(res, 'Could not delete that statement.')
}

export async function listCategories() {
  const res = await fetch(`${BASE}/categories`)
  return handle(res, 'Could not load categories.')
}

export async function updateTransactionCategory(transactionId, category) {
  const res = await fetch(`${BASE}/transactions/${transactionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  })
  return handle(res, 'Could not update category.')
}

export async function listBudgets(month) {
  const res = await fetch(`${BASE}/budgets?month=${encodeURIComponent(month)}`)
  return handle(res, 'Could not load your plan.')
}

export async function listActuals(month) {
  const res = await fetch(`${BASE}/budgets/actuals?month=${encodeURIComponent(month)}`)
  return handle(res, 'Could not load actual spend.')
}

export async function planSummary() {
  const res = await fetch(`${BASE}/budgets/summary`)
  return handle(res, 'Could not load your balance.')
}

export async function saveBudget({ month, category, planned_amount, note, entry_type }) {
  const res = await fetch(`${BASE}/budgets`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ month, category, planned_amount, note, entry_type }),
  })
  return handle(res, 'Could not save the plan.')
}

export async function deleteBudget(budgetId) {
  const res = await fetch(`${BASE}/budgets/${budgetId}`, { method: 'DELETE' })
  return handle(res, 'Could not delete the plan entry.')
}

export function csvDownloadUrl(accountId) {
  return `${BASE}/export/csv/${accountId}`
}

export function excelDownloadUrl(accountId) {
  return `${BASE}/export/excel/${accountId}`
}

import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Transaction, TransactionType } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader, ProgressBar, StatTile, fmtDate } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { currentMonthISO, formatMonthLabel, isDateInMonth } from '../lib/date'
import { todayISO } from '../lib/id'

const CATEGORY_COLORS = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-7)',
  'var(--series-8)',
]

function categoryColor(category: string, allCategories: string[]): string {
  const sorted = [...allCategories].sort()
  const idx = sorted.indexOf(category)
  return CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
}

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

type FormState = {
  date: string
  description: string
  category: string
  type: TransactionType
  amount: string
}
const EMPTY_FORM: FormState = {
  date: todayISO(),
  description: '',
  category: '',
  type: 'expense',
  amount: '',
}

export function Finance() {
  const transactions = useBrainStore((s) => s.transactions)
  const financeSettings = useBrainStore((s) => s.financeSettings)
  const addTransaction = useBrainStore((s) => s.addTransaction)
  const updateTransaction = useBrainStore((s) => s.updateTransaction)
  const deleteTransaction = useBrainStore((s) => s.deleteTransaction)
  const updateFinanceSettings = useBrainStore((s) => s.updateFinanceSettings)

  const month = useMemo(() => currentMonthISO(), [])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [budgetDraft, setBudgetDraft] = useState(String(financeSettings.monthlyBudget))

  const monthTx = transactions.filter((t) => isDateInMonth(t.date, month))
  const income = monthTx.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = monthTx.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const net = income - expenses

  const categories = useMemo(
    () => Array.from(new Set(monthTx.filter((t) => t.type === 'expense').map((t) => t.category))),
    [monthTx]
  )
  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>()
    for (const t of monthTx) {
      if (t.type !== 'expense') continue
      totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount)
    }
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
  }, [monthTx])
  const maxCategory = categoryTotals[0]?.[1] ?? 0

  const sortedTx = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1))

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditingId(t.id)
    setForm({ date: t.date, description: t.description, category: t.category, type: t.type, amount: String(t.amount) })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.description.trim() || !form.category.trim() || !Number.isFinite(amount) || amount <= 0) return
    const payload = {
      date: form.date,
      description: form.description.trim(),
      category: form.category.trim(),
      type: form.type,
      amount,
    }
    if (editingId) updateTransaction(editingId, payload)
    else addTransaction(payload)
    setOpen(false)
  }

  function saveBudget() {
    const val = Number(budgetDraft)
    if (Number.isFinite(val) && val >= 0) updateFinanceSettings({ monthlyBudget: val })
  }

  return (
    <div>
      <PageHeader
        title="Finance"
        description={`${formatMonthLabel(month)} — income, spending, and where it's going.`}
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New transaction
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Income" value={fmtCurrency(income, financeSettings.currency)} accent="var(--status-good)" />
        <StatTile label="Expenses" value={fmtCurrency(expenses, financeSettings.currency)} accent="var(--status-critical)" />
        <StatTile
          label="Net"
          value={fmtCurrency(net, financeSettings.currency)}
          accent={net >= 0 ? 'var(--status-good)' : 'var(--status-critical)'}
        />
        <StatTile
          label="Budget left"
          value={fmtCurrency(Math.max(0, financeSettings.monthlyBudget - expenses), financeSettings.currency)}
          hint={`of ${fmtCurrency(financeSettings.monthlyBudget, financeSettings.currency)}`}
          accent="var(--series-1)"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-ink-primary">Spending by category</h2>
          {categoryTotals.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-secondary">No expenses logged this month.</p>
          ) : (
            <div className="space-y-3">
              {categoryTotals.map(([cat, total]) => (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-ink-primary">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: categoryColor(cat, categories) }}
                      />
                      {cat}
                    </span>
                    <span className="tabular text-ink-secondary">{fmtCurrency(total, financeSettings.currency)}</span>
                  </div>
                  <ProgressBar value={(total / maxCategory) * 100} accent={categoryColor(cat, categories)} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-semibold text-ink-primary">Monthly budget</h2>
          <div className="mb-2 flex items-center justify-between text-xs text-ink-secondary">
            <span>Spent</span>
            <span className="tabular">
              {fmtCurrency(expenses, financeSettings.currency)} / {fmtCurrency(financeSettings.monthlyBudget, financeSettings.currency)}
            </span>
          </div>
          <ProgressBar
            value={financeSettings.monthlyBudget ? (expenses / financeSettings.monthlyBudget) * 100 : 0}
            accent={expenses > financeSettings.monthlyBudget ? 'var(--status-critical)' : 'var(--series-1)'}
          />
          <div className="mt-4 flex items-end gap-2">
            <FormRow label="Set monthly budget">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={budgetDraft}
                onChange={(e) => setBudgetDraft(e.target.value)}
              />
            </FormRow>
            <Button variant="secondary" onClick={saveBudget} className="mb-3">
              Save
            </Button>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <h2 className="mb-2 text-sm font-semibold text-ink-primary">Transactions</h2>
        {sortedTx.length === 0 ? (
          <EmptyState title="No transactions yet" description="Log income and expenses to see them here." />
        ) : (
          <Card className="divide-y divide-line-hairline">
            {sortedTx.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-primary">{t.description}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {fmtDate(t.date)} · {t.category}
                  </p>
                </div>
                <span
                  className="tabular shrink-0 text-sm font-semibold"
                  style={{ color: t.type === 'income' ? 'var(--status-good)' : 'var(--text-primary)' }}
                >
                  {t.type === 'income' ? '+' : '-'}
                  {fmtCurrency(t.amount, financeSettings.currency)}
                </span>
                <div className="flex shrink-0 gap-1.5">
                  <IconButton label="Edit" onClick={() => openEdit(t)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteTransaction(t.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit transaction' : 'New transaction'}>
        <form onSubmit={submit}>
          <FormRow label="Description">
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              autoFocus
              required
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Type">
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </FormRow>
            <FormRow label="Amount">
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </FormRow>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Category">
              <input
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Food, Housing…"
                required
              />
            </FormRow>
            <FormRow label="Date">
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </FormRow>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Add transaction'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

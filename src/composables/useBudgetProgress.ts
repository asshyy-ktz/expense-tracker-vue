import { computed, type ComputedRef } from 'vue'
import { useBudgetsStore } from '@/stores/useBudgetsStore'
import { useTransactionsStore } from '@/stores/useTransactionsStore'

export type BudgetStatus = 'ok' | 'warning' | 'over'

export interface BudgetProgress {
  id: string
  category: string
  month: string
  limit: number
  spent: number
  remaining: number
  percent: number
  status: BudgetStatus
}

/** Threshold colour bands used everywhere budget progress is rendered. */
export function budgetStatusFor(percent: number): BudgetStatus {
  if (percent >= 100) return 'over'
  if (percent >= 75) return 'warning'
  return 'ok'
}

/**
 * Joins each budget for the given month with the sum of expense
 * transactions in that category/month, producing spent/remaining/percent
 * and a colour-band status for progress bars.
 */
export function useBudgetProgress(month: ComputedRef<string> | string): { progress: ComputedRef<BudgetProgress[]> } {
  const budgets = useBudgetsStore()
  const transactions = useTransactionsStore()

  const progress = computed<BudgetProgress[]>(() => {
    const currentMonth = typeof month === 'string' ? month : month.value
    return budgets
      .budgetsForMonth(currentMonth)
      .map((budget) => {
        const spent = transactions.transactions
          .filter((t) => t.type === 'expense' && t.category === budget.category && t.date.slice(0, 7) === currentMonth)
          .reduce((sum, t) => sum + t.amount, 0)
        const percent = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0
        return {
          id: budget.id,
          category: budget.category,
          month: budget.month,
          limit: budget.limit,
          spent,
          remaining: budget.limit - spent,
          percent,
          status: budgetStatusFor(percent),
        }
      })
      .sort((a, b) => b.percent - a.percent)
  })

  return { progress }
}

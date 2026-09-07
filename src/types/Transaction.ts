export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  accountId: string
  type: TransactionType
  amount: number
  category: string
  date: string // ISO date (yyyy-mm-dd)
  note: string
  /** Set when this instance was generated from a recurring rule. */
  recurringRuleId: string | null
  createdAt: number
  updatedAt: number
  /** True while this record only exists locally, queued for sync. */
  pendingSync: boolean
}

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Rent',
  'Utilities',
  'Transport',
  'Dining Out',
  'Entertainment',
  'Health',
  'Shopping',
  'Travel',
  'Subscriptions',
  'Insurance',
  'Other',
] as const

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Other Income'] as const

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

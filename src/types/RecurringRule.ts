export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'

import type { TransactionType } from './Transaction'

export interface RecurringRule {
  id: string
  type: TransactionType
  amount: number
  category: string
  accountId: string
  note: string
  frequency: RecurringFrequency
  startDate: string // ISO date, first occurrence
  endDate: string | null // ISO date, inclusive; null = no end
  /** ISO date of the last instance that was generated for this rule. */
  lastGeneratedDate: string | null
  active: boolean
  createdAt: number
}

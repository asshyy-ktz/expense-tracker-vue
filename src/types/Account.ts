export type AccountType = 'cash' | 'bank' | 'credit'

export interface Account {
  id: string
  name: string
  type: AccountType
  /** Starting balance the running balance is computed from, in the account's currency minor-agnostic float form. */
  openingBalance: number
  currency: string
  color: string
  createdAt: number
  archived: boolean
}

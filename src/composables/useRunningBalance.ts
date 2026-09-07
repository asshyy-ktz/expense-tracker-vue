import { computed, type ComputedRef } from 'vue'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { useTransactionsStore } from '@/stores/useTransactionsStore'
import type { Account } from '@/types/Account'

export interface AccountBalance {
  account: Account
  balance: number
  income: number
  expense: number
}

/**
 * Computes each account's running balance (opening balance + all its
 * transactions) and exposes a combined total across visible accounts.
 */
export function useRunningBalance(): {
  balances: ComputedRef<AccountBalance[]>
  totalBalance: ComputedRef<number>
  balanceFor: (accountId: string) => number
} {
  const accounts = useAccountsStore()
  const transactions = useTransactionsStore()

  const balances = computed<AccountBalance[]>(() => {
    return accounts.visibleAccounts.map((account) => {
      const accountTxs = transactions.transactions.filter((t) => t.accountId === account.id)
      const income = accountTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const expense = accountTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      return {
        account,
        balance: account.openingBalance + income - expense,
        income,
        expense,
      }
    })
  })

  const totalBalance = computed(() => balances.value.reduce((sum, b) => sum + b.balance, 0))

  function balanceFor(accountId: string): number {
    return balances.value.find((b) => b.account.id === accountId)?.balance ?? 0
  }

  return { balances, totalBalance, balanceFor }
}

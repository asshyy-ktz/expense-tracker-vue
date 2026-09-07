import type { Account } from '@/types/Account'
import type { Transaction } from '@/types/Transaction'
import type { Budget } from '@/types/Budget'
import {
  getAllAccounts,
  putAccount,
  putTransactions,
  putBudget,
  getMeta,
  setMeta,
} from '@/db/indexedDb'

const SEED_FLAG = 'seeded-v1'

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7)
}

/**
 * Populates IndexedDB with demo accounts, transactions, and budgets on first
 * load so the app is never empty. Guarded by a meta flag so it only runs once.
 */
export async function seedDatabaseIfEmpty(): Promise<void> {
  const alreadySeeded = await getMeta<boolean>(SEED_FLAG)
  const existingAccounts = await getAllAccounts()
  if (alreadySeeded && existingAccounts.length > 0) return

  const accounts: Account[] = [
    {
      id: 'acct-cash',
      name: 'Wallet Cash',
      type: 'cash',
      openingBalance: 220,
      currency: 'USD',
      color: '#22c55e',
      createdAt: Date.now(),
      archived: false,
    },
    {
      id: 'acct-bank',
      name: 'Everyday Checking',
      type: 'bank',
      openingBalance: 4200,
      currency: 'USD',
      color: '#3b82f6',
      createdAt: Date.now(),
      archived: false,
    },
    {
      id: 'acct-credit',
      name: 'Rewards Credit Card',
      type: 'credit',
      openingBalance: -350,
      currency: 'USD',
      color: '#a855f7',
      createdAt: Date.now(),
      archived: false,
    },
  ]

  for (const account of accounts) {
    await putAccount(account)
  }

  const now = Date.now()
  let seq = 0
  function tx(partial: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'recurringRuleId' | 'pendingSync'>): Transaction {
    seq += 1
    return {
      ...partial,
      id: `seed-tx-${seq}`,
      recurringRuleId: null,
      pendingSync: false,
      createdAt: now - seq * 1000,
      updatedAt: now - seq * 1000,
    }
  }

  const transactions: Transaction[] = [
    tx({ accountId: 'acct-bank', type: 'income', amount: 5200, category: 'Salary', date: isoDaysAgo(58), note: 'Monthly salary' }),
    tx({ accountId: 'acct-bank', type: 'income', amount: 5200, category: 'Salary', date: isoDaysAgo(28), note: 'Monthly salary' }),
    tx({ accountId: 'acct-bank', type: 'income', amount: 5200, category: 'Salary', date: isoDaysAgo(1), note: 'Monthly salary' }),
    tx({ accountId: 'acct-bank', type: 'income', amount: 640, category: 'Freelance', date: isoDaysAgo(20), note: 'Landing page contract' }),
    tx({ accountId: 'acct-bank', type: 'income', amount: 85, category: 'Investments', date: isoDaysAgo(12), note: 'Dividend payout' }),

    tx({ accountId: 'acct-bank', type: 'expense', amount: 1450, category: 'Rent', date: isoDaysAgo(57), note: 'September rent' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 1450, category: 'Rent', date: isoDaysAgo(27), note: 'October rent' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 1450, category: 'Rent', date: isoDaysAgo(2), note: 'November rent' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 120, category: 'Utilities', date: isoDaysAgo(50), note: 'Electricity + water' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 132, category: 'Utilities', date: isoDaysAgo(20), note: 'Electricity + water' }),
    tx({ accountId: 'acct-credit', type: 'expense', amount: 64, category: 'Subscriptions', date: isoDaysAgo(40), note: 'Streaming bundle' }),
    tx({ accountId: 'acct-credit', type: 'expense', amount: 64, category: 'Subscriptions', date: isoDaysAgo(10), note: 'Streaming bundle' }),
    tx({ accountId: 'acct-cash', type: 'expense', amount: 58, category: 'Groceries', date: isoDaysAgo(45), note: 'Weekly groceries' }),
    tx({ accountId: 'acct-cash', type: 'expense', amount: 71, category: 'Groceries', date: isoDaysAgo(38), note: 'Weekly groceries' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 92, category: 'Groceries', date: isoDaysAgo(24), note: 'Weekly groceries' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 66, category: 'Groceries', date: isoDaysAgo(17), note: 'Weekly groceries' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 84, category: 'Groceries', date: isoDaysAgo(9), note: 'Weekly groceries' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 47, category: 'Groceries', date: isoDaysAgo(3), note: 'Weekly groceries' }),
    tx({ accountId: 'acct-credit', type: 'expense', amount: 38, category: 'Transport', date: isoDaysAgo(33), note: 'Gas' }),
    tx({ accountId: 'acct-credit', type: 'expense', amount: 41, category: 'Transport', date: isoDaysAgo(15), note: 'Gas' }),
    tx({ accountId: 'acct-cash', type: 'expense', amount: 22, category: 'Transport', date: isoDaysAgo(6), note: 'Rideshare' }),
    tx({ accountId: 'acct-credit', type: 'expense', amount: 76, category: 'Dining Out', date: isoDaysAgo(29), note: 'Dinner with friends' }),
    tx({ accountId: 'acct-credit', type: 'expense', amount: 54, category: 'Dining Out', date: isoDaysAgo(19), note: 'Date night' }),
    tx({ accountId: 'acct-cash', type: 'expense', amount: 18, category: 'Dining Out', date: isoDaysAgo(5), note: 'Coffee run' }),
    tx({ accountId: 'acct-credit', type: 'expense', amount: 130, category: 'Shopping', date: isoDaysAgo(26), note: 'New headphones' }),
    tx({ accountId: 'acct-credit', type: 'expense', amount: 95, category: 'Shopping', date: isoDaysAgo(8), note: 'Clothes' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 45, category: 'Entertainment', date: isoDaysAgo(23), note: 'Movie night' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 60, category: 'Entertainment', date: isoDaysAgo(4), note: 'Concert tickets' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 210, category: 'Health', date: isoDaysAgo(31), note: 'Dentist visit' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 35, category: 'Health', date: isoDaysAgo(11), note: 'Pharmacy' }),
    tx({ accountId: 'acct-bank', type: 'expense', amount: 180, category: 'Insurance', date: isoDaysAgo(52), note: 'Renter insurance' }),
  ]

  await putTransactions(transactions)

  const currentMonth = monthOf(isoDaysAgo(0))
  const budgets: Budget[] = [
    { id: 'seed-budget-1', category: 'Groceries', limit: 350, month: currentMonth, createdAt: now },
    { id: 'seed-budget-2', category: 'Dining Out', limit: 150, month: currentMonth, createdAt: now },
    { id: 'seed-budget-3', category: 'Entertainment', limit: 120, month: currentMonth, createdAt: now },
    { id: 'seed-budget-4', category: 'Transport', limit: 100, month: currentMonth, createdAt: now },
    { id: 'seed-budget-5', category: 'Shopping', limit: 200, month: currentMonth, createdAt: now },
    { id: 'seed-budget-6', category: 'Subscriptions', limit: 80, month: currentMonth, createdAt: now },
  ]

  for (const budget of budgets) {
    await putBudget(budget)
  }

  await setMeta(SEED_FLAG, true)
}

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Account } from '@/types/Account'
import type { Transaction } from '@/types/Transaction'
import type { Budget } from '@/types/Budget'
import type { RecurringRule } from '@/types/RecurringRule'
import type { SyncAction, SyncConflict } from '@/types/Sync'

const DB_NAME = 'expense-tracker-db'
const DB_VERSION = 1

interface ExpenseTrackerDB extends DBSchema {
  accounts: {
    key: string
    value: Account
    indexes: { 'by-createdAt': number }
  }
  transactions: {
    key: string
    value: Transaction
    indexes: {
      'by-date': string
      'by-account': string
      'by-category': string
    }
  }
  budgets: {
    key: string
    value: Budget
    indexes: { 'by-month': string; 'by-category': string }
  }
  recurringRules: {
    key: string
    value: RecurringRule
    indexes: { 'by-active': number }
  }
  syncQueue: {
    key: string
    value: SyncAction
    indexes: { 'by-createdAt': number }
  }
  syncConflicts: {
    key: string
    value: SyncConflict
    indexes: { 'by-detectedAt': number }
  }
  meta: {
    key: string
    value: { key: string; value: unknown }
  }
}

let dbPromise: Promise<IDBPDatabase<ExpenseTrackerDB>> | null = null

export function getDb(): Promise<IDBPDatabase<ExpenseTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ExpenseTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('accounts')) {
          const store = db.createObjectStore('accounts', { keyPath: 'id' })
          store.createIndex('by-createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('transactions')) {
          const store = db.createObjectStore('transactions', { keyPath: 'id' })
          store.createIndex('by-date', 'date')
          store.createIndex('by-account', 'accountId')
          store.createIndex('by-category', 'category')
        }
        if (!db.objectStoreNames.contains('budgets')) {
          const store = db.createObjectStore('budgets', { keyPath: 'id' })
          store.createIndex('by-month', 'month')
          store.createIndex('by-category', 'category')
        }
        if (!db.objectStoreNames.contains('recurringRules')) {
          const store = db.createObjectStore('recurringRules', { keyPath: 'id' })
          store.createIndex('by-active', 'active')
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id' })
          store.createIndex('by-createdAt', 'createdAt')
        }
        if (!db.objectStoreNames.contains('syncConflicts')) {
          const store = db.createObjectStore('syncConflicts', { keyPath: 'id' })
          store.createIndex('by-detectedAt', 'detectedAt')
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

// ---------- Accounts ----------

export async function putAccount(account: Account): Promise<void> {
  const db = await getDb()
  await db.put('accounts', account)
}

export async function getAllAccounts(): Promise<Account[]> {
  const db = await getDb()
  return db.getAll('accounts')
}

export async function deleteAccountRecord(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('accounts', id)
}

// ---------- Transactions ----------

export async function putTransaction(tx: Transaction): Promise<void> {
  const db = await getDb()
  await db.put('transactions', tx)
}

export async function putTransactions(txs: Transaction[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('transactions', 'readwrite')
  await Promise.all([...txs.map((t) => tx.store.put(t)), tx.done])
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await getDb()
  return db.getAll('transactions')
}

export async function deleteTransactionRecord(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('transactions', id)
}

// ---------- Budgets ----------

export async function putBudget(budget: Budget): Promise<void> {
  const db = await getDb()
  await db.put('budgets', budget)
}

export async function getAllBudgets(): Promise<Budget[]> {
  const db = await getDb()
  return db.getAll('budgets')
}

export async function deleteBudgetRecord(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('budgets', id)
}

// ---------- Recurring rules ----------

export async function putRecurringRule(rule: RecurringRule): Promise<void> {
  const db = await getDb()
  await db.put('recurringRules', rule)
}

export async function getAllRecurringRules(): Promise<RecurringRule[]> {
  const db = await getDb()
  return db.getAll('recurringRules')
}

export async function deleteRecurringRuleRecord(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('recurringRules', id)
}

// ---------- Sync queue ----------

export async function putSyncAction(action: SyncAction): Promise<void> {
  const db = await getDb()
  await db.put('syncQueue', action)
}

export async function getSyncQueue(): Promise<SyncAction[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('syncQueue', 'by-createdAt')
  return all.sort((a, b) => a.createdAt - b.createdAt)
}

export async function deleteSyncAction(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('syncQueue', id)
}

export async function putSyncConflict(conflict: SyncConflict): Promise<void> {
  const db = await getDb()
  await db.put('syncConflicts', conflict)
}

export async function getSyncConflicts(): Promise<SyncConflict[]> {
  const db = await getDb()
  const all = await db.getAllFromIndex('syncConflicts', 'by-detectedAt')
  return all.sort((a, b) => b.detectedAt - a.detectedAt)
}

export async function deleteSyncConflict(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('syncConflicts', id)
}

// ---------- Meta (seed flag, etc.) ----------

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDb()
  await db.put('meta', { key, value })
}

export async function getMeta<T>(key: string): Promise<T | undefined> {
  const db = await getDb()
  const row = await db.get('meta', key)
  return row?.value as T | undefined
}

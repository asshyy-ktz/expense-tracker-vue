import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Transaction, TransactionType } from '@/types/Transaction'
import { getAllTransactions, putTransaction, deleteTransactionRecord } from '@/db/indexedDb'
import { useSyncQueueStore } from '@/stores/useSyncQueueStore'
import { useUiStore } from '@/stores/useUiStore'

/** True when the browser is actually offline, or the user flipped the demo "simulate offline" switch. */
function isEffectivelyOffline(): boolean {
  return !navigator.onLine || useUiStore().simulatedOffline
}

function nextId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export interface TransactionInput {
  accountId: string
  type: TransactionType
  amount: number
  category: string
  date: string
  note: string
  recurringRuleId?: string | null
}

/**
 * Owns transaction CRUD. Every write lands in IndexedDB immediately
 * (offline-first) — when the browser is offline the write is additionally
 * queued in the sync queue so it can be replayed (and possibly flagged as a
 * conflict) once connectivity returns.
 */
export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([])
  const isLoaded = ref(false)

  async function init() {
    if (isLoaded.value) return
    transactions.value = await getAllTransactions()
    isLoaded.value = true
  }

  async function addTransaction(input: TransactionInput): Promise<Transaction> {
    const now = Date.now()
    const offline = isEffectivelyOffline()
    const record: Transaction = {
      id: nextId(),
      accountId: input.accountId,
      type: input.type,
      amount: input.amount,
      category: input.category,
      date: input.date,
      note: input.note,
      recurringRuleId: input.recurringRuleId ?? null,
      createdAt: now,
      updatedAt: now,
      pendingSync: offline,
    }
    transactions.value.push(record)
    await putTransaction(record)

    if (offline) {
      const syncQueue = useSyncQueueStore()
      await syncQueue.enqueue('create', record.id, describeTransaction(record), { ...record })
    }
    return record
  }

  async function updateTransaction(id: string, patch: Partial<TransactionInput>): Promise<void> {
    const record = transactions.value.find((t) => t.id === id)
    if (!record) return
    Object.assign(record, patch, { updatedAt: Date.now() })
    const offline = isEffectivelyOffline()
    if (offline) record.pendingSync = true
    await putTransaction(record)

    if (offline) {
      const syncQueue = useSyncQueueStore()
      await syncQueue.enqueue('update', record.id, describeTransaction(record), { ...record })
    }
  }

  async function deleteTransaction(id: string): Promise<void> {
    const record = transactions.value.find((t) => t.id === id)
    transactions.value = transactions.value.filter((t) => t.id !== id)
    await deleteTransactionRecord(id)

    if (record && isEffectivelyOffline()) {
      const syncQueue = useSyncQueueStore()
      await syncQueue.enqueue('delete', id, describeTransaction(record), null)
    }
  }

  /** Used by the recurring generator to insert already-computed instances without re-triggering sync logic per-item. */
  async function bulkInsert(records: Transaction[]): Promise<void> {
    for (const record of records) {
      transactions.value.push(record)
      await putTransaction(record)
    }
  }

  function describeTransaction(t: Transaction): string {
    const sign = t.type === 'income' ? '+' : '-'
    return `${t.category} (${sign}$${t.amount.toFixed(2)}) on ${t.date}`
  }

  function transactionById(id: string): Transaction | undefined {
    return transactions.value.find((t) => t.id === id)
  }

  /** Re-reads everything from IndexedDB — used after the sync queue resolves a conflict directly against the DB. */
  async function refreshFromDb() {
    transactions.value = await getAllTransactions()
  }

  return {
    transactions,
    isLoaded,
    init,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    bulkInsert,
    transactionById,
    refreshFromDb,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SyncAction, SyncActionType } from '@/types/Sync'
import type { SyncConflict } from '@/types/Sync'
import {
  getSyncQueue,
  putSyncAction,
  deleteSyncAction,
  getSyncConflicts,
  putSyncConflict,
  deleteSyncConflict,
  putTransaction,
  deleteTransactionRecord,
} from '@/db/indexedDb'
import type { Transaction } from '@/types/Transaction'

function nextId(): string {
  return `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Queues create/update/delete actions performed while offline, persists the
 * queue to IndexedDB (so it survives a reload), and replays it once the app
 * detects it's back online — surfacing a conflict when the simulated
 * "remote" state no longer matches what the action expected.
 */
export const useSyncQueueStore = defineStore('syncQueue', () => {
  const queue = ref<SyncAction[]>([])
  const conflicts = ref<SyncConflict[]>([])
  const isLoaded = ref(false)
  const isSyncing = ref(false)

  const pendingCount = computed(() => queue.value.filter((a) => a.status === 'pending').length)

  async function init() {
    if (isLoaded.value) return
    queue.value = await getSyncQueue()
    conflicts.value = await getSyncConflicts()
    isLoaded.value = true
  }

  async function enqueue(type: SyncActionType, transactionId: string, description: string, payload: Record<string, unknown> | null) {
    const action: SyncAction = {
      id: nextId(),
      type,
      transactionId,
      description,
      payload,
      createdAt: Date.now(),
      status: 'pending',
    }
    queue.value.push(action)
    await putSyncAction(action)
    return action
  }

  /**
   * Replays the queue against the current in-memory transaction list. In
   * this client-only demo "remote state" is simulated: a small random
   * chance per action produces a conflict (e.g. the transaction was already
   * changed/removed on another device before reconnecting), mirroring what
   * a real backend's 409 response would look like.
   */
  async function flush(getTransactions: () => Transaction[]) {
    if (isSyncing.value) return
    isSyncing.value = true
    try {
      const pending = queue.value.filter((a) => a.status === 'pending')
      for (const action of pending) {
        action.status = 'syncing'
        await new Promise((resolve) => setTimeout(resolve, 250))

        const conflictChance = Math.random()
        const stillExists = getTransactions().some((t) => t.id === action.transactionId)
        const isConflict = conflictChance < 0.3 || (action.type !== 'delete' && !stillExists && action.type !== 'create')

        if (!isConflict) {
          queue.value = queue.value.filter((a) => a.id !== action.id)
          await deleteSyncAction(action.id)

          if (action.payload) {
            const record = action.payload as unknown as Transaction
            record.pendingSync = false
            await putTransaction(record)
          }
        } else {
          action.status = 'conflict'
          await putSyncAction(action)

          const remoteSnapshot = action.payload
            ? { ...action.payload, amount: Math.round(((action.payload.amount as number) * (0.85 + Math.random() * 0.3)) * 100) / 100 }
            : null

          const conflict: SyncConflict = {
            id: `conflict-${action.id}`,
            action,
            reason: `"${action.description}" was changed elsewhere before this ${action.type} could sync.`,
            remoteSnapshot,
            detectedAt: Date.now(),
          }
          conflicts.value.push(conflict)
          await putSyncConflict(conflict)
        }
      }
    } finally {
      isSyncing.value = false
    }
  }

  /** Keep the local (queued) change — drop the conflict and clear the pending flag. */
  async function resolveKeepLocal(conflictId: string) {
    const conflict = conflicts.value.find((c) => c.id === conflictId)
    if (!conflict) return
    conflicts.value = conflicts.value.filter((c) => c.id !== conflictId)
    queue.value = queue.value.filter((a) => a.id !== conflict.action.id)
    await deleteSyncConflict(conflictId)
    await deleteSyncAction(conflict.action.id)

    if (conflict.action.payload) {
      const record = { ...conflict.action.payload, pendingSync: false } as unknown as Transaction
      await putTransaction(record)
    }
  }

  /** Discard the queued action and accept the simulated remote state. */
  async function resolveAcceptRemote(conflictId: string) {
    const conflict = conflicts.value.find((c) => c.id === conflictId)
    if (!conflict) return
    conflicts.value = conflicts.value.filter((c) => c.id !== conflictId)
    queue.value = queue.value.filter((a) => a.id !== conflict.action.id)
    await deleteSyncConflict(conflictId)
    await deleteSyncAction(conflict.action.id)

    if (conflict.action.type === 'delete') {
      // remote still has it — nothing to delete locally, leave as-is.
      return
    }
    if (conflict.remoteSnapshot) {
      const record = { ...conflict.remoteSnapshot, pendingSync: false } as unknown as Transaction
      await putTransaction(record)
    } else {
      await deleteTransactionRecord(conflict.action.transactionId)
    }
  }

  return {
    queue,
    conflicts,
    isLoaded,
    isSyncing,
    pendingCount,
    init,
    enqueue,
    flush,
    resolveKeepLocal,
    resolveAcceptRemote,
  }
})

export type SyncActionType = 'create' | 'update' | 'delete'

export interface SyncAction {
  id: string
  type: SyncActionType
  transactionId: string
  /** Human-readable label of the transaction at the time the action was queued. */
  description: string
  /** Snapshot of the transaction payload for create/update actions. */
  payload: Record<string, unknown> | null
  createdAt: number
  status: 'pending' | 'syncing' | 'conflict' | 'failed'
}

export interface SyncConflict {
  id: string
  action: SyncAction
  /** Why the action could not be applied cleanly on reconnect. */
  reason: string
  /** What the simulated "remote" thinks the record looks like now. */
  remoteSnapshot: Record<string, unknown> | null
  detectedAt: number
}

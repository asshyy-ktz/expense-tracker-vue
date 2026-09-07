<script setup lang="ts">
import { computed } from 'vue'
import { useOnlineStatus } from '@/composables/useOnlineStatus'
import { useUiStore } from '@/stores/useUiStore'
import { useSyncQueueStore } from '@/stores/useSyncQueueStore'
import { useTransactionsStore } from '@/stores/useTransactionsStore'
import { useToast } from '@/composables/useToast'

const { isOnline } = useOnlineStatus()
const ui = useUiStore()
const syncQueue = useSyncQueueStore()
const transactions = useTransactionsStore()
const toast = useToast()

const effectivelyOnline = computed(() => isOnline.value && !ui.simulatedOffline)

async function syncNow() {
  await syncQueue.flush(() => transactions.transactions)
  await transactions.refreshFromDb()
  if (syncQueue.conflicts.length > 0) {
    toast.error(`Synced with ${syncQueue.conflicts.length} conflict(s) to resolve`)
  } else {
    toast.success('All changes synced')
  }
}

function toggleOffline() {
  ui.toggleSimulatedOffline()
  if (!ui.simulatedOffline && syncQueue.pendingCount > 0) {
    syncNow()
  }
}
</script>

<template>
  <div class="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-xs">
    <span class="flex items-center gap-1.5 font-medium" :class="effectivelyOnline ? 'text-success' : 'text-destructive'">
      <span class="h-2 w-2 rounded-full" :class="effectivelyOnline ? 'bg-success' : 'bg-destructive'" />
      {{ effectivelyOnline ? 'Online' : 'Offline' }}
    </span>

    <span v-if="syncQueue.pendingCount > 0" class="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
      {{ syncQueue.pendingCount }} queued
    </span>

    <button
      v-if="effectivelyOnline && syncQueue.pendingCount > 0"
      class="rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground disabled:opacity-50"
      :disabled="syncQueue.isSyncing"
      @click="syncNow"
    >
      {{ syncQueue.isSyncing ? 'Syncing…' : 'Sync now' }}
    </button>

    <button
      class="ml-auto rounded-md border border-border px-2.5 py-1 font-medium text-muted-foreground hover:bg-secondary"
      @click="toggleOffline"
    >
      {{ ui.simulatedOffline ? 'Go online' : 'Simulate offline' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transaction } from '@/types/Transaction'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { formatCurrency, formatDate } from '@/composables/useFormat'

const props = defineProps<{ transaction: Transaction }>()
const emit = defineEmits<{ edit: [tx: Transaction]; delete: [id: string] }>()

const accounts = useAccountsStore()
const account = computed(() => accounts.accountById(props.transaction.accountId))
</script>

<template>
  <div class="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
    <div
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
      :class="transaction.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'"
    >
      {{ transaction.type === 'income' ? '↓' : '↑' }}
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p class="truncate text-sm font-medium">{{ transaction.category }}</p>
        <span v-if="transaction.recurringRuleId" class="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground">🔁</span>
        <span v-if="transaction.pendingSync" class="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">queued</span>
      </div>
      <p class="truncate text-xs text-muted-foreground">
        {{ formatDate(transaction.date) }} · {{ account?.name ?? 'Unknown account' }}
        <span v-if="transaction.note">· {{ transaction.note }}</span>
      </p>
    </div>
    <p class="shrink-0 text-sm font-semibold" :class="transaction.type === 'income' ? 'text-success' : 'text-foreground'">
      {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
    </p>
    <div class="flex shrink-0 items-center gap-1">
      <button class="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" @click="emit('edit', transaction)">✏️</button>
      <button class="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" @click="emit('delete', transaction.id)">🗑️</button>
    </div>
  </div>
</template>

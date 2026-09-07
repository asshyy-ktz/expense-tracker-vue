<script setup lang="ts">
import { computed } from 'vue'
import type { RecurringRule } from '@/types/RecurringRule'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { formatCurrency } from '@/composables/useFormat'

const props = defineProps<{ rule: RecurringRule }>()
const emit = defineEmits<{ cancel: [id: string]; reactivate: [id: string]; delete: [id: string] }>()

const accounts = useAccountsStore()
const account = computed(() => accounts.accountById(props.rule.accountId))

const frequencyLabel: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  monthly: 'Monthly',
  yearly: 'Yearly',
}
</script>

<template>
  <div class="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p class="truncate text-sm font-medium">{{ rule.category }}</p>
        <span v-if="!rule.active" class="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">cancelled</span>
      </div>
      <p class="truncate text-xs text-muted-foreground">
        {{ frequencyLabel[rule.frequency] }} · {{ account?.name ?? 'Unknown account' }}
        <span v-if="rule.endDate"> · ends {{ rule.endDate }}</span>
      </p>
    </div>
    <p class="shrink-0 text-sm font-semibold" :class="rule.type === 'income' ? 'text-success' : 'text-foreground'">
      {{ rule.type === 'income' ? '+' : '-' }}{{ formatCurrency(rule.amount) }}
    </p>
    <div class="flex shrink-0 items-center gap-1">
      <button
        v-if="rule.active"
        class="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary"
        @click="emit('cancel', rule.id)"
      >
        Cancel
      </button>
      <button v-else class="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-secondary" @click="emit('reactivate', rule.id)">
        Resume
      </button>
      <button class="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" @click="emit('delete', rule.id)">🗑️</button>
    </div>
  </div>
</template>

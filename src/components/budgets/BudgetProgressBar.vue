<script setup lang="ts">
import type { BudgetProgress } from '@/composables/useBudgetProgress'
import { formatCurrency } from '@/composables/useFormat'

defineProps<{ item: BudgetProgress }>()
const emit = defineEmits<{ delete: [id: string] }>()

const barColor: Record<string, string> = {
  ok: 'bg-success',
  warning: 'bg-amber-500',
  over: 'bg-destructive',
}
const textColor: Record<string, string> = {
  ok: 'text-success',
  warning: 'text-amber-600',
  over: 'text-destructive',
}
</script>

<template>
  <div class="rounded-xl border border-border bg-card p-4">
    <div class="mb-2 flex items-center justify-between">
      <p class="text-sm font-medium">{{ item.category }}</p>
      <div class="flex items-center gap-2">
        <p class="text-xs font-medium" :class="textColor[item.status]">{{ item.percent }}%</p>
        <button class="text-xs text-muted-foreground hover:text-destructive" @click="emit('delete', item.id)">✕</button>
      </div>
    </div>
    <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div class="h-full rounded-full transition-all" :class="barColor[item.status]" :style="{ width: `${Math.min(item.percent, 100)}%` }" />
    </div>
    <div class="mt-2 flex items-center justify-between text-xs text-muted-foreground">
      <span>{{ formatCurrency(item.spent) }} spent</span>
      <span>{{ formatCurrency(item.limit) }} limit</span>
    </div>
  </div>
</template>

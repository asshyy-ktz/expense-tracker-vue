<script setup lang="ts">
import type { AccountBalance } from '@/composables/useRunningBalance'
import { formatCurrency } from '@/composables/useFormat'

defineProps<{ item: AccountBalance; active: boolean }>()
const emit = defineEmits<{ select: [id: string]; archive: [id: string] }>()

const typeLabel: Record<string, string> = { cash: 'Cash', bank: 'Bank', credit: 'Credit card' }
const typeIcon: Record<string, string> = { cash: '💵', bank: '🏦', credit: '💳' }
</script>

<template>
  <button
    class="w-full rounded-xl border p-4 text-left transition-colors"
    :class="active ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-secondary/50'"
    @click="emit('select', item.account.id)"
  >
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-2">
        <span class="flex h-8 w-8 items-center justify-center rounded-full text-sm" :style="{ backgroundColor: item.account.color + '22' }">
          {{ typeIcon[item.account.type] }}
        </span>
        <div>
          <p class="text-sm font-medium">{{ item.account.name }}</p>
          <p class="text-xs text-muted-foreground">{{ typeLabel[item.account.type] }}</p>
        </div>
      </div>
      <button class="text-xs text-muted-foreground hover:text-destructive" @click.stop="emit('archive', item.account.id)">Archive</button>
    </div>
    <p class="mt-3 text-xl font-semibold" :class="item.balance < 0 ? 'text-destructive' : 'text-foreground'">
      {{ formatCurrency(item.balance) }}
    </p>
    <div class="mt-2 flex justify-between text-xs text-muted-foreground">
      <span class="text-success">+{{ formatCurrency(item.income) }}</span>
      <span class="text-destructive">-{{ formatCurrency(item.expense) }}</span>
    </div>
  </button>
</template>

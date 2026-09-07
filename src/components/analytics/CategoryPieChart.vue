<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { Transaction } from '@/types/Transaction'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{ transactions: Transaction[] }>()

const palette = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444', '#14b8a6', '#eab308', '#ec4899', '#6366f1', '#84cc16', '#0ea5e9', '#f43f5e']

const chartData = computed(() => {
  const totals = new Map<string, number>()
  for (const t of props.transactions.filter((t) => t.type === 'expense')) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount)
  }
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1])
  return {
    labels: sorted.map(([category]) => category),
    datasets: [
      {
        data: sorted.map(([, amount]) => amount),
        backgroundColor: sorted.map((_, i) => palette[i % palette.length]),
        borderWidth: 0,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' as const, labels: { boxWidth: 12, font: { size: 11 } } } },
}
</script>

<template>
  <div class="h-64">
    <Doughnut v-if="chartData.labels.length > 0" :data="chartData" :options="chartOptions" />
    <div v-else class="flex h-full items-center justify-center text-sm text-muted-foreground">No expenses in this range</div>
  </div>
</template>

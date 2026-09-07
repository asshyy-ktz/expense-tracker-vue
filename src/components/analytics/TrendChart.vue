<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import type { Transaction } from '@/types/Transaction'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps<{ transactions: Transaction[]; startDate: string; endDate: string }>()

function monthsBetween(start: string, end: string): string[] {
  const months: string[] = []
  const cursor = new Date(`${start.slice(0, 7)}-01T00:00:00`)
  const last = new Date(`${end.slice(0, 7)}-01T00:00:00`)
  while (cursor <= last) {
    months.push(cursor.toISOString().slice(0, 7))
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

const chartData = computed(() => {
  const months = monthsBetween(props.startDate, props.endDate)
  const income = months.map((m) => props.transactions.filter((t) => t.type === 'income' && t.date.slice(0, 7) === m).reduce((s, t) => s + t.amount, 0))
  const expense = months.map((m) => props.transactions.filter((t) => t.type === 'expense' && t.date.slice(0, 7) === m).reduce((s, t) => s + t.amount, 0))

  return {
    labels: months.map((m) => new Date(`${m}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })),
    datasets: [
      { label: 'Income', data: income, backgroundColor: '#22c55e', borderRadius: 4 },
      { label: 'Expense', data: expense, backgroundColor: '#ef4444', borderRadius: 4 },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
  scales: { y: { beginAtZero: true } },
}
</script>

<template>
  <div class="h-64">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

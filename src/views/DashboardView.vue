<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { useTransactionsStore } from '@/stores/useTransactionsStore'
import { useRunningBalance } from '@/composables/useRunningBalance'
import { useBudgetProgress } from '@/composables/useBudgetProgress'
import { currentMonthIso, formatCurrency } from '@/composables/useFormat'
import StatCard from '@/components/shared/StatCard.vue'
import SyncStatusBar from '@/components/sync/SyncStatusBar.vue'
import TrendChart from '@/components/analytics/TrendChart.vue'
import CategoryPieChart from '@/components/analytics/CategoryPieChart.vue'
import DateRangePicker from '@/components/analytics/DateRangePicker.vue'
import BudgetProgressBar from '@/components/budgets/BudgetProgressBar.vue'
import TransactionRow from '@/components/transactions/TransactionRow.vue'

const accounts = useAccountsStore()
const transactions = useTransactionsStore()
const { totalBalance } = useRunningBalance()
const { progress } = useBudgetProgress(currentMonthIso())

function defaultStart(): string {
  const d = new Date()
  d.setDate(d.getDate() - 90)
  return d.toISOString().slice(0, 10)
}
const startDate = ref(defaultStart())
const endDate = ref(new Date().toISOString().slice(0, 10))

const scopedTransactions = computed(() => {
  const accountFilter = accounts.activeAccountId
  return transactions.transactions
    .filter((t) => accountFilter === 'all' || t.accountId === accountFilter)
    .filter((t) => t.date >= startDate.value && t.date <= endDate.value)
})

const monthlyIncome = computed(() =>
  scopedTransactions.value
    .filter((t) => t.type === 'income' && t.date.slice(0, 7) === currentMonthIso())
    .reduce((sum, t) => sum + t.amount, 0),
)
const monthlyExpense = computed(() =>
  scopedTransactions.value
    .filter((t) => t.type === 'expense' && t.date.slice(0, 7) === currentMonthIso())
    .reduce((sum, t) => sum + t.amount, 0),
)

const recentTransactions = computed(() =>
  [...scopedTransactions.value].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt)).slice(0, 6),
)
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-4 p-4 lg:p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Dashboard</h1>
      <SyncStatusBar />
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Total balance" :value="formatCurrency(totalBalance)" />
      <StatCard label="This month income" :value="formatCurrency(monthlyIncome)" tone="success" />
      <StatCard label="This month expense" :value="formatCurrency(monthlyExpense)" tone="destructive" />
      <StatCard label="Net this month" :value="formatCurrency(monthlyIncome - monthlyExpense)" :tone="monthlyIncome - monthlyExpense >= 0 ? 'success' : 'destructive'" />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div class="rounded-xl border border-border bg-card p-4 lg:col-span-3">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-sm font-semibold">Income vs. expense</h2>
          <DateRangePicker v-model:start-date="startDate" v-model:end-date="endDate" />
        </div>
        <TrendChart :transactions="scopedTransactions" :start-date="startDate" :end-date="endDate" />
      </div>
      <div class="rounded-xl border border-border bg-card p-4 lg:col-span-2">
        <h2 class="mb-3 text-sm font-semibold">Spending by category</h2>
        <CategoryPieChart :transactions="scopedTransactions" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div class="rounded-xl border border-border bg-card p-4">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold">Budget progress</h2>
          <RouterLink to="/budgets" class="text-xs font-medium text-primary">Manage</RouterLink>
        </div>
        <div v-if="progress.length === 0" class="py-6 text-center text-sm text-muted-foreground">No budgets set for this month.</div>
        <div v-else class="space-y-3">
          <BudgetProgressBar v-for="item in progress.slice(0, 4)" :key="item.id" :item="item" @delete="() => {}" />
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-border bg-card">
        <div class="flex items-center justify-between p-4 pb-0">
          <h2 class="text-sm font-semibold">Recent transactions</h2>
          <RouterLink to="/transactions" class="text-xs font-medium text-primary">View all</RouterLink>
        </div>
        <div v-if="recentTransactions.length === 0" class="p-6 text-center text-sm text-muted-foreground">No transactions in range.</div>
        <TransactionRow v-for="tx in recentTransactions" :key="tx.id" :transaction="tx" @edit="() => {}" @delete="() => {}" />
      </div>
    </div>
  </div>
</template>

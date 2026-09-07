<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBudgetsStore } from '@/stores/useBudgetsStore'
import { useBudgetProgress } from '@/composables/useBudgetProgress'
import { currentMonthIso, monthLabel } from '@/composables/useFormat'
import { useToast } from '@/composables/useToast'
import BudgetProgressBar from '@/components/budgets/BudgetProgressBar.vue'
import BudgetForm from '@/components/budgets/BudgetForm.vue'

const budgetsStore = useBudgetsStore()
const toast = useToast()

const month = ref(currentMonthIso())
const showForm = ref(false)

const { progress } = useBudgetProgress(month)

const totalLimit = computed(() => progress.value.reduce((sum, p) => sum + p.limit, 0))
const totalSpent = computed(() => progress.value.reduce((sum, p) => sum + p.spent, 0))

async function handleSubmit(payload: { category: string; limit: number; month: string }) {
  await budgetsStore.setBudget(payload)
  toast.success('Budget saved')
  showForm.value = false
}

async function handleDelete(id: string) {
  await budgetsStore.deleteBudget(id)
  toast.info('Budget removed')
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 lg:p-6">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Budgets</h1>
        <p class="text-xs text-muted-foreground">{{ monthLabel(month) }}</p>
      </div>
      <button class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" @click="showForm = true">+ Set budget</button>
    </div>

    <div class="mb-4 rounded-xl border border-border bg-card p-4">
      <p class="text-xs font-medium text-muted-foreground">Total budgeted vs. spent</p>
      <p class="mt-1 text-lg font-semibold">${{ totalSpent.toFixed(0) }} / ${{ totalLimit.toFixed(0) }}</p>
    </div>

    <div v-if="progress.length === 0" class="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No budgets set for this month yet.
    </div>
    <div v-else class="space-y-3">
      <BudgetProgressBar v-for="item in progress" :key="item.id" :item="item" @delete="handleDelete" />
    </div>

    <BudgetForm v-if="showForm" :month="month" @close="showForm = false" @submit="handleSubmit" />
  </div>
</template>

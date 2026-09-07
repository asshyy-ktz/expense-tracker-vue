import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Budget } from '@/types/Budget'
import { getAllBudgets, putBudget, deleteBudgetRecord } from '@/db/indexedDb'

function nextId(): string {
  return `budget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = ref<Budget[]>([])
  const isLoaded = ref(false)

  async function init() {
    if (isLoaded.value) return
    budgets.value = await getAllBudgets()
    isLoaded.value = true
  }

  async function setBudget(input: { category: string; limit: number; month: string }) {
    const existing = budgets.value.find((b) => b.category === input.category && b.month === input.month)
    if (existing) {
      existing.limit = input.limit
      await putBudget(existing)
      return existing
    }
    const budget: Budget = {
      id: nextId(),
      category: input.category,
      limit: input.limit,
      month: input.month,
      createdAt: Date.now(),
    }
    budgets.value.push(budget)
    await putBudget(budget)
    return budget
  }

  async function deleteBudget(id: string) {
    budgets.value = budgets.value.filter((b) => b.id !== id)
    await deleteBudgetRecord(id)
  }

  function budgetsForMonth(month: string): Budget[] {
    return budgets.value.filter((b) => b.month === month)
  }

  return { budgets, isLoaded, init, setBudget, deleteBudget, budgetsForMonth }
})

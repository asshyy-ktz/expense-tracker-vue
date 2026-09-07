import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RecurringRule, RecurringFrequency } from '@/types/RecurringRule'
import type { TransactionType } from '@/types/Transaction'
import { getAllRecurringRules, putRecurringRule, deleteRecurringRuleRecord } from '@/db/indexedDb'

function nextId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export interface RecurringRuleInput {
  type: TransactionType
  amount: number
  category: string
  accountId: string
  note: string
  frequency: RecurringFrequency
  startDate: string
  endDate: string | null
}

export const useRecurringRulesStore = defineStore('recurringRules', () => {
  const rules = ref<RecurringRule[]>([])
  const isLoaded = ref(false)

  async function init() {
    if (isLoaded.value) return
    rules.value = await getAllRecurringRules()
    isLoaded.value = true
  }

  async function createRule(input: RecurringRuleInput) {
    const rule: RecurringRule = {
      id: nextId(),
      type: input.type,
      amount: input.amount,
      category: input.category,
      accountId: input.accountId,
      note: input.note,
      frequency: input.frequency,
      startDate: input.startDate,
      endDate: input.endDate,
      lastGeneratedDate: null,
      active: true,
      createdAt: Date.now(),
    }
    rules.value.push(rule)
    await putRecurringRule(rule)
    return rule
  }

  async function updateRule(id: string, patch: Partial<RecurringRuleInput>) {
    const rule = rules.value.find((r) => r.id === id)
    if (!rule) return
    Object.assign(rule, patch)
    await putRecurringRule(rule)
  }

  async function cancelRule(id: string) {
    const rule = rules.value.find((r) => r.id === id)
    if (!rule) return
    rule.active = false
    await putRecurringRule(rule)
  }

  async function reactivateRule(id: string) {
    const rule = rules.value.find((r) => r.id === id)
    if (!rule) return
    rule.active = true
    await putRecurringRule(rule)
  }

  async function deleteRule(id: string) {
    rules.value = rules.value.filter((r) => r.id !== id)
    await deleteRecurringRuleRecord(id)
  }

  async function markGenerated(id: string, lastGeneratedDate: string) {
    const rule = rules.value.find((r) => r.id === id)
    if (!rule) return
    rule.lastGeneratedDate = lastGeneratedDate
    await putRecurringRule(rule)
  }

  return { rules, isLoaded, init, createRule, updateRule, cancelRule, reactivateRule, deleteRule, markGenerated }
})

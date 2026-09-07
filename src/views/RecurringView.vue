<script setup lang="ts">
import { ref } from 'vue'
import { useRecurringRulesStore } from '@/stores/useRecurringRulesStore'
import { useRecurringGenerator } from '@/composables/useRecurringGenerator'
import { useToast } from '@/composables/useToast'
import RecurringRuleRow from '@/components/recurring/RecurringRuleRow.vue'
import RecurringRuleForm from '@/components/recurring/RecurringRuleForm.vue'
import type { RecurringFrequency } from '@/types/RecurringRule'
import type { TransactionType } from '@/types/Transaction'

const rules = useRecurringRulesStore()
const { runGeneration } = useRecurringGenerator()
const toast = useToast()

const showForm = ref(false)

async function handleSubmit(payload: {
  type: TransactionType
  amount: number
  category: string
  accountId: string
  note: string
  frequency: RecurringFrequency
  startDate: string
  endDate: string | null
}) {
  await rules.createRule(payload)
  await runGeneration()
  toast.success('Recurring rule created and instances generated')
  showForm.value = false
}

async function handleCancel(id: string) {
  await rules.cancelRule(id)
  toast.info('Rule cancelled')
}

async function handleReactivate(id: string) {
  await rules.reactivateRule(id)
  await runGeneration()
  toast.success('Rule resumed')
}

async function handleDelete(id: string) {
  await rules.deleteRule(id)
  toast.info('Rule deleted')
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 lg:p-6">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Recurring rules</h1>
        <p class="text-xs text-muted-foreground">Auto-generates transactions up to 60 days ahead</p>
      </div>
      <button class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" @click="showForm = true">+ New rule</button>
    </div>

    <div v-if="rules.rules.length === 0" class="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No recurring rules yet. Create one for rent, salary, or subscriptions.
    </div>
    <div v-else class="overflow-hidden rounded-xl border border-border bg-card">
      <RecurringRuleRow
        v-for="rule in rules.rules"
        :key="rule.id"
        :rule="rule"
        @cancel="handleCancel"
        @reactivate="handleReactivate"
        @delete="handleDelete"
      />
    </div>

    <RecurringRuleForm v-if="showForm" @close="showForm = false" @submit="handleSubmit" />
  </div>
</template>

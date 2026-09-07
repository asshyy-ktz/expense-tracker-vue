<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/Transaction'
import type { TransactionType } from '@/types/Transaction'
import type { RecurringFrequency } from '@/types/RecurringRule'
import Modal from '@/components/shared/Modal.vue'

const emit = defineEmits<{
  close: []
  submit: [
    payload: {
      type: TransactionType
      amount: number
      category: string
      accountId: string
      note: string
      frequency: RecurringFrequency
      startDate: string
      endDate: string | null
    },
  ]
}>()

const accounts = useAccountsStore()

const type = ref<TransactionType>('expense')
const amount = ref('')
const category = ref('')
const accountId = ref(accounts.visibleAccounts[0]?.id ?? '')
const note = ref('')
const frequency = ref<RecurringFrequency>('monthly')
const startDate = ref(new Date().toISOString().slice(0, 10))
const hasEndDate = ref(false)
const endDate = ref('')

const categories = computed(() => (type.value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES))

watch(type, () => {
  if (!categories.value.includes(category.value as never)) category.value = ''
})

const isValid = computed(
  () => Number(amount.value) > 0 && category.value !== '' && accountId.value !== '' && startDate.value !== '' && (!hasEndDate.value || endDate.value !== ''),
)

function submit() {
  if (!isValid.value) return
  emit('submit', {
    type: type.value,
    amount: Number(amount.value),
    category: category.value,
    accountId: accountId.value,
    note: note.value,
    frequency: frequency.value,
    startDate: startDate.value,
    endDate: hasEndDate.value ? endDate.value : null,
  })
}
</script>

<template>
  <Modal title="New recurring rule" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div class="flex rounded-lg border border-border p-1">
        <button
          type="button"
          class="flex-1 rounded-md py-1.5 text-sm font-medium"
          :class="type === 'expense' ? 'bg-destructive text-destructive-foreground' : 'text-muted-foreground'"
          @click="type = 'expense'"
        >
          Expense
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-1.5 text-sm font-medium"
          :class="type === 'income' ? 'bg-success text-success-foreground' : 'text-muted-foreground'"
          @click="type = 'income'"
        >
          Income
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">Amount</label>
          <input v-model="amount" type="number" min="0.01" step="0.01" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">Frequency</label>
          <select v-model="frequency" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
          <select v-model="category" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="" disabled>Select…</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">Account</label>
          <select v-model="accountId" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option v-for="a in accounts.visibleAccounts" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-muted-foreground">Start date</label>
          <input v-model="startDate" type="date" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <input v-model="hasEndDate" type="checkbox" />
            End date
          </label>
          <input
            v-model="endDate"
            type="date"
            :disabled="!hasEndDate"
            class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-40"
          />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Note</label>
        <input v-model="note" type="text" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Optional" />
      </div>

      <button type="submit" :disabled="!isValid" class="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
        Create rule
      </button>
    </form>
  </Modal>
</template>

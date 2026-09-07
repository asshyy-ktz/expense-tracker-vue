<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/Transaction'
import type { Transaction, TransactionType } from '@/types/Transaction'
import Modal from '@/components/shared/Modal.vue'

const props = defineProps<{ editing: Transaction | null }>()
const emit = defineEmits<{
  close: []
  submit: [payload: { accountId: string; type: TransactionType; amount: number; category: string; date: string; note: string }]
}>()

const accounts = useAccountsStore()

const type = ref<TransactionType>(props.editing?.type ?? 'expense')
const amount = ref(props.editing ? String(props.editing.amount) : '')
const category = ref(props.editing?.category ?? '')
const accountId = ref(props.editing?.accountId ?? accounts.visibleAccounts[0]?.id ?? '')
const date = ref(props.editing?.date ?? new Date().toISOString().slice(0, 10))
const note = ref(props.editing?.note ?? '')

const categories = computed(() => (type.value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES))

watch(type, () => {
  if (!categories.value.includes(category.value as never)) category.value = ''
})

const isValid = computed(() => Number(amount.value) > 0 && category.value !== '' && accountId.value !== '' && date.value !== '')

function submit() {
  if (!isValid.value) return
  emit('submit', {
    accountId: accountId.value,
    type: type.value,
    amount: Number(amount.value),
    category: category.value,
    date: date.value,
    note: note.value,
  })
}
</script>

<template>
  <Modal :title="editing ? 'Edit transaction' : 'Add transaction'" @close="emit('close')">
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

      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Amount</label>
        <input
          v-model="amount"
          type="number"
          min="0.01"
          step="0.01"
          required
          class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          placeholder="0.00"
        />
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

      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
        <input v-model="date" type="date" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </div>

      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Note</label>
        <input v-model="note" type="text" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Optional" />
      </div>

      <button
        type="submit"
        :disabled="!isValid"
        class="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {{ editing ? 'Save changes' : 'Add transaction' }}
      </button>
    </form>
  </Modal>
</template>

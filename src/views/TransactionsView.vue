<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactionsStore } from '@/stores/useTransactionsStore'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { useToast } from '@/composables/useToast'
import type { Transaction, TransactionType } from '@/types/Transaction'
import { ALL_CATEGORIES } from '@/types/Transaction'
import TransactionRow from '@/components/transactions/TransactionRow.vue'
import TransactionForm from '@/components/transactions/TransactionForm.vue'

const transactions = useTransactionsStore()
const accounts = useAccountsStore()
const toast = useToast()

const showForm = ref(false)
const editingTx = ref<Transaction | null>(null)
const search = ref('')
const filterType = ref<'all' | TransactionType>('all')
const filterCategory = ref<string>('all')

const filtered = computed(() => {
  const accountFilter = accounts.activeAccountId
  const q = search.value.trim().toLowerCase()
  return transactions.transactions
    .filter((t) => accountFilter === 'all' || t.accountId === accountFilter)
    .filter((t) => filterType.value === 'all' || t.type === filterType.value)
    .filter((t) => filterCategory.value === 'all' || t.category === filterCategory.value)
    .filter((t) => !q || t.category.toLowerCase().includes(q) || t.note.toLowerCase().includes(q))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
})

function openCreate() {
  editingTx.value = null
  showForm.value = true
}

function openEdit(tx: Transaction) {
  editingTx.value = tx
  showForm.value = true
}

async function handleSubmit(payload: { accountId: string; type: TransactionType; amount: number; category: string; date: string; note: string }) {
  if (editingTx.value) {
    await transactions.updateTransaction(editingTx.value.id, payload)
    toast.success('Transaction updated')
  } else {
    await transactions.addTransaction(payload)
    toast.success('Transaction added')
  }
  showForm.value = false
}

async function handleDelete(id: string) {
  await transactions.deleteTransaction(id)
  toast.info('Transaction deleted')
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 lg:p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-xl font-semibold">Transactions</h1>
      <button class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" @click="openCreate">+ Add</button>
    </div>

    <div class="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search…"
        class="col-span-2 rounded-lg border border-input bg-background px-3 py-2 text-sm lg:col-span-2"
      />
      <select v-model="filterType" class="rounded-lg border border-input bg-background px-3 py-2 text-sm">
        <option value="all">All types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <select v-model="filterCategory" class="rounded-lg border border-input bg-background px-3 py-2 text-sm">
        <option value="all">All categories</option>
        <option v-for="c in ALL_CATEGORIES" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>

    <div v-if="filtered.length === 0" class="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      No transactions match these filters.
    </div>
    <div v-else class="overflow-hidden rounded-xl border border-border bg-card">
      <TransactionRow v-for="tx in filtered" :key="tx.id" :transaction="tx" @edit="openEdit" @delete="handleDelete" />
    </div>

    <TransactionForm v-if="showForm" :editing="editingTx" @close="showForm = false" @submit="handleSubmit" />
  </div>
</template>

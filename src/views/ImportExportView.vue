<script setup lang="ts">
import { useTransactionsStore } from '@/stores/useTransactionsStore'
import { exportTransactionsToCsv } from '@/composables/useCsvImportExport'
import { useToast } from '@/composables/useToast'
import ImportWizard from '@/components/csv/ImportWizard.vue'

const transactions = useTransactionsStore()
const toast = useToast()

function handleExport() {
  if (transactions.transactions.length === 0) {
    toast.info('No transactions to export')
    return
  }
  exportTransactionsToCsv(transactions.transactions)
  toast.success('CSV exported')
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-4 p-4 lg:p-6">
    <h1 class="text-xl font-semibold">Import / Export</h1>

    <div class="rounded-xl border border-border bg-card p-4">
      <h2 class="mb-1 text-sm font-semibold">Export to CSV</h2>
      <p class="mb-3 text-xs text-muted-foreground">Downloads all {{ transactions.transactions.length }} transactions as a CSV file.</p>
      <button class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" @click="handleExport">Export CSV</button>
    </div>

    <ImportWizard />
  </div>
</template>

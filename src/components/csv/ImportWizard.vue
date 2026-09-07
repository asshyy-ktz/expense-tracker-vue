<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseCsv, guessColumnMapping, buildImportPreview } from '@/composables/useCsvImportExport'
import type { ParsedCsv, ColumnMapping, ImportPreviewRow } from '@/composables/useCsvImportExport'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { useTransactionsStore } from '@/stores/useTransactionsStore'
import { useToast } from '@/composables/useToast'
import { ALL_CATEGORIES } from '@/types/Transaction'

const accounts = useAccountsStore()
const transactions = useTransactionsStore()
const toast = useToast()

const step = ref<'upload' | 'map' | 'preview'>('upload')
const parsed = ref<ParsedCsv | null>(null)
const mapping = ref<ColumnMapping>({ date: null, type: null, category: null, amount: null, accountId: null, note: null })
const fileName = ref('')

const columnOptions: { key: keyof ColumnMapping; label: string }[] = [
  { key: 'date', label: 'Date' },
  { key: 'type', label: 'Type' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount' },
  { key: 'accountId', label: 'Account ID' },
  { key: 'note', label: 'Note' },
]

function handleFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result ?? '')
    const result = parseCsv(text)
    parsed.value = result
    mapping.value = guessColumnMapping(result.headers)
    step.value = 'map'
  }
  reader.readAsText(file)
}

const preview = computed<ImportPreviewRow[]>(() => {
  if (!parsed.value) return []
  return buildImportPreview(
    parsed.value.rows,
    mapping.value,
    ALL_CATEGORIES,
    accounts.accounts.map((a) => a.id),
  )
})

const validRows = computed(() => preview.value.filter((r) => r.valid))
const invalidRows = computed(() => preview.value.filter((r) => !r.valid))

const mappingComplete = computed(() => mapping.value.date !== null && mapping.value.type !== null && mapping.value.category !== null && mapping.value.amount !== null && mapping.value.accountId !== null)

async function commitImport() {
  for (const row of validRows.value) {
    if (!row.transaction) continue
    await transactions.addTransaction(row.transaction)
  }
  toast.success(`Imported ${validRows.value.length} transaction(s)`)
  reset()
}

function reset() {
  step.value = 'upload'
  parsed.value = null
  fileName.value = ''
}
</script>

<template>
  <div class="rounded-xl border border-border bg-card p-4">
    <h2 class="mb-1 text-sm font-semibold">Import from CSV</h2>
    <p class="mb-4 text-xs text-muted-foreground">Columns expected: date (yyyy-mm-dd), type (income/expense), category, amount, accountId, note.</p>

    <div v-if="step === 'upload'">
      <label class="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center hover:bg-secondary/50">
        <span class="text-2xl">📄</span>
        <span class="text-sm font-medium">Choose a CSV file</span>
        <input type="file" accept=".csv,text/csv" class="hidden" @change="handleFile" />
      </label>
    </div>

    <div v-else-if="step === 'map'" class="space-y-3">
      <p class="text-xs text-muted-foreground">File: {{ fileName }} · {{ parsed?.rows.length ?? 0 }} rows</p>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="col in columnOptions" :key="col.key">
          <label class="mb-1 block text-xs font-medium text-muted-foreground">{{ col.label }}</label>
          <select v-model.number="mapping[col.key]" class="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm">
            <option :value="null">Not mapped</option>
            <option v-for="(h, idx) in parsed?.headers ?? []" :key="idx" :value="idx">{{ h }}</option>
          </select>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-border px-3 py-2 text-sm" @click="reset">Back</button>
        <button
          class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          :disabled="!mappingComplete"
          @click="step = 'preview'"
        >
          Preview import
        </button>
      </div>
    </div>

    <div v-else-if="step === 'preview'" class="space-y-3">
      <div class="flex items-center gap-3 text-xs">
        <span class="text-success">{{ validRows.length }} valid</span>
        <span v-if="invalidRows.length > 0" class="text-destructive">{{ invalidRows.length }} invalid</span>
      </div>
      <div class="max-h-64 overflow-auto rounded-lg border border-border">
        <table class="w-full text-left text-xs">
          <thead class="sticky top-0 bg-secondary">
            <tr>
              <th class="px-2 py-1.5">Row</th>
              <th class="px-2 py-1.5">Status</th>
              <th class="px-2 py-1.5">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in preview" :key="row.rowIndex" class="border-t border-border">
              <td class="px-2 py-1.5">{{ row.rowIndex }}</td>
              <td class="px-2 py-1.5">
                <span :class="row.valid ? 'text-success' : 'text-destructive'">{{ row.valid ? 'Valid' : 'Invalid' }}</span>
              </td>
              <td class="px-2 py-1.5">
                <span v-if="row.valid && row.transaction">
                  {{ row.transaction.date }} · {{ row.transaction.type }} · {{ row.transaction.category }} · ${{ row.transaction.amount }}
                </span>
                <span v-else class="text-destructive">{{ row.errors.join(', ') }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="flex gap-2">
        <button class="rounded-lg border border-border px-3 py-2 text-sm" @click="step = 'map'">Back</button>
        <button
          class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          :disabled="validRows.length === 0"
          @click="commitImport"
        >
          Import {{ validRows.length }} transaction(s)
        </button>
      </div>
    </div>
  </div>
</template>

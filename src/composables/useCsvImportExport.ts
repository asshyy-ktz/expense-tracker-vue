import type { Transaction, TransactionType } from '@/types/Transaction'

export const CSV_EXPORT_COLUMNS = ['date', 'type', 'category', 'amount', 'accountId', 'note'] as const

export interface CsvRow {
  raw: string[]
  rowIndex: number
}

export interface ColumnMapping {
  date: number | null
  type: number | null
  category: number | null
  amount: number | null
  accountId: number | null
  note: number | null
}

export interface ParsedCsv {
  headers: string[]
  rows: CsvRow[]
}

export interface ImportPreviewRow {
  rowIndex: number
  valid: boolean
  errors: string[]
  transaction: {
    date: string
    type: TransactionType
    category: string
    amount: number
    accountId: string
    note: string
  } | null
}

/** Minimal RFC4180-ish CSV parser: handles quoted fields, escaped quotes, and commas inside quotes. */
export function parseCsv(text: string): ParsedCsv {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0)
  const parseLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"'
          i++
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
      } else if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  if (lines.length === 0) return { headers: [], rows: [] }
  const headers = parseLine(lines[0]!).map((h) => h.trim())
  const rows: CsvRow[] = lines.slice(1).map((line, idx) => ({ raw: parseLine(line), rowIndex: idx + 2 }))
  return { headers, rows }
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

/** Builds a CSV string from transactions and triggers a client-side download. */
export function exportTransactionsToCsv(transactions: Transaction[], filename = 'transactions.csv'): void {
  const header = CSV_EXPORT_COLUMNS.join(',')
  const rows = transactions.map((t) =>
    [t.date, t.type, escapeCsvField(t.category), t.amount.toString(), t.accountId, escapeCsvField(t.note)].join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Best-effort auto-detection of a column mapping from a CSV's header row. */
export function guessColumnMapping(headers: string[]): ColumnMapping {
  const find = (candidates: string[]): number | null => {
    const lower = headers.map((h) => h.toLowerCase())
    for (const candidate of candidates) {
      const idx = lower.indexOf(candidate)
      if (idx !== -1) return idx
    }
    return null
  }
  return {
    date: find(['date', 'transaction date']),
    type: find(['type', 'transaction type']),
    category: find(['category', 'cat']),
    amount: find(['amount', 'value']),
    accountId: find(['accountid', 'account', 'account id']),
    note: find(['note', 'notes', 'memo', 'description']),
  }
}

/** Validates + coerces raw CSV rows into transaction-shaped previews using the given column mapping. */
export function buildImportPreview(rows: CsvRow[], mapping: ColumnMapping, validCategories: string[], validAccountIds: string[]): ImportPreviewRow[] {
  return rows.map((row) => {
    const errors: string[] = []
    const get = (colIndex: number | null): string => (colIndex === null ? '' : (row.raw[colIndex] ?? '').trim())

    const dateStr = get(mapping.date)
    const typeStr = get(mapping.type).toLowerCase()
    const categoryStr = get(mapping.category)
    const amountStr = get(mapping.amount)
    const accountIdStr = get(mapping.accountId)
    const noteStr = get(mapping.note)

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) errors.push('Date must be yyyy-mm-dd')
    if (typeStr !== 'income' && typeStr !== 'expense') errors.push('Type must be "income" or "expense"')
    if (!categoryStr) errors.push('Category is required')
    else if (validCategories.length > 0 && !validCategories.includes(categoryStr)) errors.push(`Unknown category "${categoryStr}"`)
    const amount = Number(amountStr)
    if (!amountStr || Number.isNaN(amount) || amount <= 0) errors.push('Amount must be a positive number')
    if (!accountIdStr) errors.push('Account is required')
    else if (validAccountIds.length > 0 && !validAccountIds.includes(accountIdStr)) errors.push(`Unknown account "${accountIdStr}"`)

    const valid = errors.length === 0
    return {
      rowIndex: row.rowIndex,
      valid,
      errors,
      transaction: valid
        ? {
            date: dateStr,
            type: typeStr as TransactionType,
            category: categoryStr,
            amount,
            accountId: accountIdStr,
            note: noteStr,
          }
        : null,
    }
  })
}

export function useCsvImportExport() {
  return { parseCsv, exportTransactionsToCsv, guessColumnMapping, buildImportPreview }
}

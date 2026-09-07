export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function currentMonthIso(): string {
  return new Date().toISOString().slice(0, 7)
}

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  return new Date(y!, (m ?? 1) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

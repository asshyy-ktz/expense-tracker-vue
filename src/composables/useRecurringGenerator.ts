import { useRecurringRulesStore } from '@/stores/useRecurringRulesStore'
import { useTransactionsStore } from '@/stores/useTransactionsStore'
import type { RecurringRule, RecurringFrequency } from '@/types/RecurringRule'
import type { Transaction } from '@/types/Transaction'

/** How far into the future instances are pre-generated, in days. */
const HORIZON_DAYS = 60

function addInterval(date: Date, frequency: RecurringFrequency): Date {
  const next = new Date(date)
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  return next
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function nextId(): string {
  return `tx-rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Rolls every active recurring rule forward, generating concrete
 * transaction instances from the later of (startDate, lastGeneratedDate+1
 * interval) up to a rolling horizon (today + HORIZON_DAYS) or the rule's
 * end date, whichever is sooner. Idempotent: re-running after instances
 * already exist through the horizon generates nothing new.
 */
export function useRecurringGenerator() {
  const rules = useRecurringRulesStore()
  const transactions = useTransactionsStore()

  async function runGeneration(): Promise<number> {
    const horizon = new Date()
    horizon.setDate(horizon.getDate() + HORIZON_DAYS)

    let generatedCount = 0

    for (const rule of rules.rules) {
      if (!rule.active) continue
      const instances = generateInstancesForRule(rule, horizon)
      if (instances.length === 0) continue

      await transactions.bulkInsert(instances)
      const lastDate = instances[instances.length - 1]!.date
      await rules.markGenerated(rule.id, lastDate)
      generatedCount += instances.length
    }

    return generatedCount
  }

  function generateInstancesForRule(rule: RecurringRule, horizon: Date): Transaction[] {
    const instances: Transaction[] = []
    const end = rule.endDate ? new Date(rule.endDate) : null

    let cursor: Date
    if (rule.lastGeneratedDate) {
      cursor = addInterval(new Date(rule.lastGeneratedDate), rule.frequency)
    } else {
      cursor = new Date(rule.startDate)
    }

    let guard = 0
    while (cursor <= horizon && (!end || cursor <= end) && guard < 500) {
      guard += 1
      const iso = toIso(cursor)
      const now = Date.now()
      instances.push({
        id: nextId(),
        accountId: rule.accountId,
        type: rule.type,
        amount: rule.amount,
        category: rule.category,
        date: iso,
        note: rule.note,
        recurringRuleId: rule.id,
        createdAt: now,
        updatedAt: now,
        pendingSync: false,
      })
      cursor = addInterval(cursor, rule.frequency)
    }

    return instances
  }

  return { runGeneration }
}

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Account, AccountType } from '@/types/Account'
import { getAllAccounts, putAccount, deleteAccountRecord } from '@/db/indexedDb'

function nextId(): string {
  return `acct-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([])
  const isLoaded = ref(false)
  const activeAccountId = ref<string | 'all'>('all')

  const visibleAccounts = computed(() => accounts.value.filter((a) => !a.archived))

  async function init() {
    if (isLoaded.value) return
    accounts.value = await getAllAccounts()
    isLoaded.value = true
  }

  async function createAccount(input: { name: string; type: AccountType; openingBalance: number; color: string; currency?: string }) {
    const account: Account = {
      id: nextId(),
      name: input.name,
      type: input.type,
      openingBalance: input.openingBalance,
      color: input.color,
      currency: input.currency ?? 'USD',
      createdAt: Date.now(),
      archived: false,
    }
    accounts.value.push(account)
    await putAccount(account)
    return account
  }

  async function updateAccount(id: string, patch: Partial<Pick<Account, 'name' | 'type' | 'openingBalance' | 'color' | 'archived'>>) {
    const account = accounts.value.find((a) => a.id === id)
    if (!account) return
    Object.assign(account, patch)
    await putAccount(account)
  }

  async function archiveAccount(id: string) {
    await updateAccount(id, { archived: true })
    if (activeAccountId.value === id) activeAccountId.value = 'all'
  }

  async function deleteAccount(id: string) {
    accounts.value = accounts.value.filter((a) => a.id !== id)
    await deleteAccountRecord(id)
    if (activeAccountId.value === id) activeAccountId.value = 'all'
  }

  function setActiveAccount(id: string | 'all') {
    activeAccountId.value = id
  }

  function accountById(id: string): Account | undefined {
    return accounts.value.find((a) => a.id === id)
  }

  return {
    accounts,
    isLoaded,
    activeAccountId,
    visibleAccounts,
    init,
    createAccount,
    updateAccount,
    archiveAccount,
    deleteAccount,
    setActiveAccount,
    accountById,
  }
})

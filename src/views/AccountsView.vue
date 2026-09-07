<script setup lang="ts">
import { ref } from 'vue'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { useRunningBalance } from '@/composables/useRunningBalance'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/composables/useFormat'
import AccountCard from '@/components/accounts/AccountCard.vue'
import AccountForm from '@/components/accounts/AccountForm.vue'
import type { AccountType } from '@/types/Account'

const accounts = useAccountsStore()
const { balances, totalBalance } = useRunningBalance()
const toast = useToast()

const showForm = ref(false)

async function handleSubmit(payload: { name: string; type: AccountType; openingBalance: number; color: string }) {
  await accounts.createAccount(payload)
  toast.success('Account created')
  showForm.value = false
}

async function handleArchive(id: string) {
  await accounts.archiveAccount(id)
  toast.info('Account archived')
}

function handleSelect(id: string) {
  accounts.setActiveAccount(accounts.activeAccountId === id ? 'all' : id)
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-4 lg:p-6">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold">Accounts</h1>
        <p class="text-xs text-muted-foreground">Total balance: {{ formatCurrency(totalBalance) }}</p>
      </div>
      <button class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground" @click="showForm = true">+ Add</button>
    </div>

    <button
      class="mb-3 w-full rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
      :class="{ '!border-primary !text-primary': accounts.activeAccountId === 'all' }"
      @click="accounts.setActiveAccount('all')"
    >
      {{ accounts.activeAccountId === 'all' ? 'Showing all accounts' : 'Show all accounts' }}
    </button>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <AccountCard
        v-for="item in balances"
        :key="item.account.id"
        :item="item"
        :active="accounts.activeAccountId === item.account.id"
        @select="handleSelect"
        @archive="handleArchive"
      />
    </div>

    <AccountForm v-if="showForm" @close="showForm = false" @submit="handleSubmit" />
  </div>
</template>

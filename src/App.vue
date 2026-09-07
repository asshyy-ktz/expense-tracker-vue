<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { useAccountsStore } from '@/stores/useAccountsStore'
import { useTransactionsStore } from '@/stores/useTransactionsStore'
import { useBudgetsStore } from '@/stores/useBudgetsStore'
import { useRecurringRulesStore } from '@/stores/useRecurringRulesStore'
import { useSyncQueueStore } from '@/stores/useSyncQueueStore'
import { useRecurringGenerator } from '@/composables/useRecurringGenerator'
import { seedDatabaseIfEmpty } from '@/data/seed'
import Sidebar from '@/components/layout/Sidebar.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
import ConflictBanner from '@/components/sync/ConflictBanner.vue'
import Toast from '@/components/shared/Toast.vue'

const accounts = useAccountsStore()
const transactions = useTransactionsStore()
const budgets = useBudgetsStore()
const recurringRules = useRecurringRulesStore()
const syncQueue = useSyncQueueStore()
const { runGeneration } = useRecurringGenerator()

const isDesktop = useMediaQuery('(min-width: 1024px)')

onMounted(async () => {
  await seedDatabaseIfEmpty()
  await Promise.all([accounts.init(), transactions.init(), budgets.init(), recurringRules.init(), syncQueue.init()])
  await runGeneration()
})
</script>

<template>
  <div class="flex h-screen flex-col bg-background lg:flex-row">
    <aside v-if="isDesktop" class="sticky top-0 h-screen w-64 shrink-0 border-r border-border bg-card">
      <Sidebar />
    </aside>

    <div class="flex min-h-0 flex-1 flex-col">
      <ConflictBanner />

      <main class="min-h-0 flex-1 overflow-y-auto pb-16 lg:pb-0">
        <RouterView />
      </main>

      <div v-if="!isDesktop" class="sticky bottom-0">
        <BottomNav />
      </div>
    </div>

    <Toast />
  </div>
</template>

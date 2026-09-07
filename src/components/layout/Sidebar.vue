<script setup lang="ts">
const emit = defineEmits<{ navigate: [] }>()

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/transactions', label: 'Transactions', icon: '💸' },
  { to: '/budgets', label: 'Budgets', icon: '🎯' },
  { to: '/recurring', label: 'Recurring', icon: '🔁' },
  { to: '/accounts', label: 'Accounts', icon: '🏦' },
  { to: '/import-export', label: 'Import / Export', icon: '📄' },
]
</script>

<template>
  <nav class="flex h-full flex-col gap-1 p-4">
    <div class="mb-4 flex items-center gap-2 px-2">
      <span class="text-xl">💰</span>
      <span class="text-lg font-semibold">Expense Tracker</span>
    </div>
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      active-class="!bg-primary/10 !text-primary"
      @click="emit('navigate')"
    >
      <span class="text-base">{{ link.icon }}</span>
      {{ link.label }}
    </RouterLink>
  </nav>
</template>

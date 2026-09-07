<script setup lang="ts">
const links = [
  { to: '/', label: 'Home', icon: '📊' },
  { to: '/transactions', label: 'Txns', icon: '💸' },
  { to: '/budgets', label: 'Budgets', icon: '🎯' },
  { to: '/recurring', label: 'Recur', icon: '🔁' },
  { to: '/accounts', label: 'Accts', icon: '🏦' },
]
</script>

<template>
  <nav class="safe-bottom flex items-stretch border-t border-border bg-card">
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      class="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"
      active-class="!text-primary"
    >
      <span class="text-lg leading-none">{{ link.icon }}</span>
      {{ link.label }}
    </RouterLink>
  </nav>
</template>

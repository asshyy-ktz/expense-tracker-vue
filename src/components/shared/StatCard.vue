<script setup lang="ts">
defineProps<{
  label: string
  value: string
  tone?: 'default' | 'success' | 'destructive'
  hint?: string
}>()
</script>

<template>
  <div class="rounded-xl border border-border bg-card p-4">
    <p class="text-xs font-medium text-muted-foreground">{{ label }}</p>
    <p
      class="mt-1 text-2xl font-semibold"
      :class="{
        'text-success': tone === 'success',
        'text-destructive': tone === 'destructive',
      }"
    >
      {{ value }}
    </p>
    <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
  </div>
</template>

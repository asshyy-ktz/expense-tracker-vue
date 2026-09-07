<script setup lang="ts">
const startDate = defineModel<string>('startDate', { required: true })
const endDate = defineModel<string>('endDate', { required: true })

function applyPreset(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  startDate.value = start.toISOString().slice(0, 10)
  endDate.value = end.toISOString().slice(0, 10)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <input v-model="startDate" type="date" class="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs" />
    <span class="text-xs text-muted-foreground">to</span>
    <input v-model="endDate" type="date" class="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs" />
    <div class="flex gap-1">
      <button class="rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary" @click="applyPreset(30)">30d</button>
      <button class="rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary" @click="applyPreset(90)">90d</button>
      <button class="rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary" @click="applyPreset(180)">6mo</button>
    </div>
  </div>
</template>

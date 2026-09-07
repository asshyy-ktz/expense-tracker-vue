<script setup lang="ts">
defineProps<{ title: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 lg:items-center lg:p-4" @click.self="emit('close')">
      <div class="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-card p-5 shadow-xl lg:max-w-lg lg:rounded-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button class="rounded-full p-1 text-muted-foreground hover:bg-secondary" @click="emit('close')">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

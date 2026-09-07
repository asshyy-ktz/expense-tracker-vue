<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AccountType } from '@/types/Account'
import Modal from '@/components/shared/Modal.vue'

const emit = defineEmits<{ close: []; submit: [payload: { name: string; type: AccountType; openingBalance: number; color: string }] }>()

const name = ref('')
const type = ref<AccountType>('bank')
const openingBalance = ref('0')
const colors = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444', '#14b8a6']
const color = ref(colors[0]!)

const isValid = computed(() => name.value.trim() !== '' && !Number.isNaN(Number(openingBalance.value)))

function submit() {
  if (!isValid.value) return
  emit('submit', { name: name.value.trim(), type: type.value, openingBalance: Number(openingBalance.value), color: color.value })
}
</script>

<template>
  <Modal title="New account" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
        <input v-model="name" type="text" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Travel Card" />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
        <select v-model="type" class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="cash">Cash</option>
          <option value="bank">Bank</option>
          <option value="credit">Credit card</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Opening balance</label>
        <input v-model="openingBalance" type="number" step="0.01" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Color</label>
        <div class="flex gap-2">
          <button
            v-for="c in colors"
            :key="c"
            type="button"
            class="h-7 w-7 rounded-full border-2"
            :class="color === c ? 'border-foreground' : 'border-transparent'"
            :style="{ backgroundColor: c }"
            @click="color = c"
          />
        </div>
      </div>
      <button type="submit" :disabled="!isValid" class="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
        Create account
      </button>
    </form>
  </Modal>
</template>

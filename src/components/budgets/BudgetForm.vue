<script setup lang="ts">
import { ref, computed } from 'vue'
import { EXPENSE_CATEGORIES } from '@/types/Transaction'
import Modal from '@/components/shared/Modal.vue'

const props = defineProps<{ month: string }>()
const emit = defineEmits<{ close: []; submit: [payload: { category: string; limit: number; month: string }] }>()

const category = ref('')
const limit = ref('')

const isValid = computed(() => category.value !== '' && Number(limit.value) > 0)

function submit() {
  if (!isValid.value) return
  emit('submit', { category: category.value, limit: Number(limit.value), month: props.month })
}
</script>

<template>
  <Modal title="Set category budget" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="submit">
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
        <select v-model="category" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="" disabled>Select…</option>
          <option v-for="c in EXPENSE_CATEGORIES" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-muted-foreground">Monthly limit</label>
        <input v-model="limit" type="number" min="1" step="1" required class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <button type="submit" :disabled="!isValid" class="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
        Save budget
      </button>
    </form>
  </Modal>
</template>

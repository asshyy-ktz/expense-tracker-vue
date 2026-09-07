import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: string
  message: string
  variant: 'success' | 'error' | 'info'
}

export const useUiStore = defineStore('ui', () => {
  const toasts = ref<Toast[]>([])
  const simulatedOffline = ref(false)

  function pushToast(message: string, variant: Toast['variant'] = 'info') {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    toasts.value.push({ id, message, variant })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 3500)
  }

  function dismissToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function toggleSimulatedOffline() {
    simulatedOffline.value = !simulatedOffline.value
  }

  return { toasts, simulatedOffline, pushToast, dismissToast, toggleSimulatedOffline }
})

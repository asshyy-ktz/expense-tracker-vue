import { useUiStore } from '@/stores/useUiStore'

/** Thin wrapper so components don't need to import the UI store directly for toasts. */
export function useToast() {
  const ui = useUiStore()
  return {
    toasts: ui.toasts,
    success: (message: string) => ui.pushToast(message, 'success'),
    error: (message: string) => ui.pushToast(message, 'error'),
    info: (message: string) => ui.pushToast(message, 'info'),
  }
}

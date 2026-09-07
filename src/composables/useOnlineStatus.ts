import { ref, onMounted, onUnmounted } from 'vue'

/** Tracks navigator.onLine and lets components react to reconnect/disconnect. */
export function useOnlineStatus() {
  const isOnline = ref(navigator.onLine)

  function update() {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  })

  onUnmounted(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return { isOnline }
}

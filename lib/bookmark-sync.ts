const BOOKMARK_SYNC_CHANNEL = 'bookmark-sync'
const BOOKMARK_SYNC_KEY = 'bookmark-sync-event'

export function notifyBookmarksChanged() {
  if (typeof window === 'undefined') return

  const payload = { ts: Date.now() }

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(BOOKMARK_SYNC_CHANNEL)
    channel.postMessage(payload)
    channel.close()
  }

  window.localStorage.setItem(BOOKMARK_SYNC_KEY, JSON.stringify(payload))
}

export function subscribeToBookmarksChanged(onChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  let channel: BroadcastChannel | null = null

  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(BOOKMARK_SYNC_CHANNEL)
    channel.onmessage = () => onChange()
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === BOOKMARK_SYNC_KEY && event.newValue) {
      onChange()
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    if (channel) {
      channel.close()
    }
    window.removeEventListener('storage', handleStorage)
  }
}

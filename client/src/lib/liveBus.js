const listeners = new Map()
const channelName = 'quadra-live-events'
let broadcastChannel = null

function ensureChannel() {
  if (typeof window === 'undefined' || !window.BroadcastChannel) return null
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(channelName)
    broadcastChannel.onmessage = (event) => {
      const { eventName, payload } = event.data || {}
      dispatchLocal(eventName, payload, false)
    }
  }
  return broadcastChannel
}

function getHandlers(eventName) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set())
  }
  return listeners.get(eventName)
}

function dispatchLocal(eventName, payload, broadcast = true) {
  const handlers = getHandlers(eventName)
  handlers.forEach(handler => {
    try {
      handler(payload)
    } catch (error) {
      console.warn(`Live bus handler error for ${eventName}:`, error)
    }
  })

  if (broadcast) {
    const channel = ensureChannel()
    if (channel) {
      channel.postMessage({ eventName, payload })
    }
  }
}

export function publishLiveEvent(eventName, payload) {
  dispatchLocal(eventName, payload, true)
}

export function subscribeLiveEvent(eventName, handler) {
  const handlers = getHandlers(eventName)
  handlers.add(handler)
  return () => handlers.delete(handler)
}

export function createMockSocket() {
  const socket = {
    connected: true,
    auth: { token: null },
    id: `mock-${Date.now()}`,
    on(eventName, handler) {
      return subscribeLiveEvent(eventName, handler)
    },
    once(eventName, handler) {
      const off = subscribeLiveEvent(eventName, (payload) => {
        off()
        handler(payload)
      })
      return off
    },
    off(eventName, handler) {
      const handlers = listeners.get(eventName)
      if (handlers) handlers.delete(handler)
    },
    emit(eventName, payload) {
      if (eventName === 'join-match' || eventName === 'leave-match') return
      publishLiveEvent(eventName, payload)
    },
    disconnect() {
      this.connected = false
      publishLiveEvent('disconnect')
    },
    connect() {
      this.connected = true
      publishLiveEvent('connect')
      return this
    },
    close() {
      this.disconnect()
    },
  }

  return socket
}

// Client-side event bus for live updates

const subscribers = new Map()

export function publishLiveEvent(eventName, payload) {
  if (!subscribers.has(eventName)) {
    subscribers.set(eventName, [])
  }
  const handlers = subscribers.get(eventName)
  handlers.forEach(handler => {
    try {
      handler(payload)
    } catch (error) {
      console.error(`Error in ${eventName} handler:`, error)
    }
  })
  
  // Broadcast to other tabs on same origin
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('quadra-live-events')
      channel.postMessage({ eventName, payload })
      channel.close()
    } catch (e) {
      // BroadcastChannel not available
    }
  }
}

export function subscribeLiveEvent(eventName, handler) {
  if (!subscribers.has(eventName)) {
    subscribers.set(eventName, [])
  }
  subscribers.get(eventName).push(handler)
  
  // Listen for broadcasts from other tabs
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('quadra-live-events')
      channel.onmessage = (event) => {
        if (event.data.eventName === eventName) {
          try {
            handler(event.data.payload)
          } catch (error) {
            console.error(`Error in ${eventName} handler:`, error)
          }
        }
      }
    } catch (e) {
      // BroadcastChannel not available
    }
  }
  
  // Return unsubscribe function
  return () => {
    const handlers = subscribers.get(eventName)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
}

export function createMockSocket() {
  const socket = {
    connected: true,
    listeners: new Map(),

    on(eventName, handler) {
      if (!this.listeners.has(eventName)) {
        this.listeners.set(eventName, [])
      }
      this.listeners.get(eventName).push(handler)
      
      // Subscribe to live events that match socket events
      subscribeLiveEvent(eventName, handler)
      
      return this
    },

    off(eventName, handler) {
      if (this.listeners.has(eventName)) {
        const handlers = this.listeners.get(eventName)
        const index = handlers.indexOf(handler)
        if (index > -1) {
          handlers.splice(index, 1)
        }
      }
      return this
    },

    once(eventName, handler) {
      const wrappedHandler = (data) => {
        handler(data)
        this.off(eventName, wrappedHandler)
      }
      return this.on(eventName, wrappedHandler)
    },

    emit(eventName, data) {
      publishLiveEvent(eventName, data)
      return this
    },

    connect() {
      this.connected = true
      publishLiveEvent('connect', { io: { engine: { transport: { name: 'mock' } } } })
      return this
    },

    disconnect() {
      this.connected = false
      publishLiveEvent('disconnect', 'mock disconnect')
      return this
    },
  }

  return socket
}

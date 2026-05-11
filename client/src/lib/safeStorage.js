const memoryStore = new Map()

function storageWorks(storage) {
  try {
    if (!storage) return false
    const key = '__quadra_test__'
    storage.setItem(key, '1')
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

const canUseLocalStorage = typeof window !== 'undefined' && storageWorks(window.localStorage)

export function getItem(key) {
  if (canUseLocalStorage) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return memoryStore.get(key) || null
    }
  }
  return memoryStore.get(key) || null
}

export function setItem(key, value) {
  if (canUseLocalStorage) {
    try {
      window.localStorage.setItem(key, String(value))
      return
    } catch {
      memoryStore.set(key, String(value))
      return
    }
  }
  memoryStore.set(key, String(value))
}

export function removeItem(key) {
  if (canUseLocalStorage) {
    try {
      window.localStorage.removeItem(key)
      return
    } catch {
      memoryStore.delete(key)
      return
    }
  }
  memoryStore.delete(key)
}

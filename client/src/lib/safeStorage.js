const memoryStore = new Map()

function storageWorks(storage) {
  try {
    if (!storage) return false
    const key = '__quadra_test__'
    storage.setItem(key, '1')
    storage.removeItem(key)
    return true
  } catch (error) {
    console.warn('⚠️ Storage blocked (Tracking Prevention?):', error.message)
    return false
  }
}

const canUseLocalStorage = typeof window !== 'undefined' && storageWorks(window.localStorage)

if (!canUseLocalStorage) {
  console.log('📌 Using memory-only storage (localStorage blocked by browser)')
}

export function getItem(key) {
  if (canUseLocalStorage) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      console.warn('⚠️ localStorage.getItem failed, using memory')
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
      console.warn('⚠️ localStorage.setItem failed, using memory')
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

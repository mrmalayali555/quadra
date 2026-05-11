// JSONBin API service for cloud-based tournament data
const BIN_ID = '6a01c00dc0954111d8089ce6'
const API_KEY = '$2a$10$aVVXJLfwVHRdoYzQmToZeuLlqZAd7PSBab5EuaxfPS3uZxLTxCE3K'
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`

export async function readData() {
  try {
    const res = await fetch(BASE_URL, {
      headers: {
        'X-Master-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.record || {}
  } catch (error) {
    console.error('Error reading from JSONBin:', error)
    throw error
  }
}

export async function writeData(data) {
  try {
    const res = await fetch(BASE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const result = await res.json()
    return result
  } catch (error) {
    console.error('Error writing to JSONBin:', error)
    throw error
  }
}

// Polling manager for keeping data fresh
const subscribers = new Set()
let pollingInterval = null
let lastData = null

export function subscribe(callback) {
  subscribers.add(callback)
  
  // Start polling if not already running
  if (!pollingInterval) {
    startPolling()
  }
  
  // Return unsubscribe function
  return () => {
    subscribers.delete(callback)
    if (subscribers.size === 0) {
      stopPolling()
    }
  }
}

export function startPolling(interval = 5000) {
  if (pollingInterval) return
  
  // Fetch immediately
  readData().then(data => {
    lastData = data
    notifySubscribers(data)
  }).catch(err => console.error('Initial poll failed:', err))
  
  // Then poll every 5 seconds
  pollingInterval = setInterval(() => {
    readData().then(data => {
      // Only notify if data changed
      if (JSON.stringify(lastData) !== JSON.stringify(data)) {
        lastData = data
        notifySubscribers(data)
      }
    }).catch(err => console.error('Polling error:', err))
  }, interval)
}

export function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

function notifySubscribers(data) {
  subscribers.forEach(callback => {
    try {
      callback(data)
    } catch (error) {
      console.error('Subscriber callback error:', error)
    }
  })
}

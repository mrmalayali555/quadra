// JSONBin API service for cloud-based tournament data
// Falls back to public/data.json if JSONBin is unavailable
import { publishLiveEvent } from '../lib/liveBus.js'

const BIN_ID = '6a01c00dc0954111d8089ce6'
const API_KEY = '$2a$10$aVVXJLfwVHRdoYzQmToZeuLlqZAd7PSBab5EuaxfPS3uZxLTxCE3K'
const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`

export async function readDataFromJSONBin() {
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
    console.warn('JSONBin unavailable, falling back to data.json:', error.message)
    return null
  }
}

export async function readDataFromLocal() {
  try {
    const res = await fetch('/data.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Error reading from data.json:', error)
    return null
  }
}

export async function readData() {
  // Try JSONBin first, then fall back to local data.json
  const jsonbinData = await readDataFromJSONBin()
  if (jsonbinData) return jsonbinData
  
  const localData = await readDataFromLocal()
  if (localData) return localData
  
  // If both fail, return empty object (mockAxios will use seedData)
  return {}
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
    return await res.json()
  } catch (error) {
    console.warn('Failed to write to JSONBin (will retry), data cached locally:', error.message)
    // Data is already cached locally in mockAxios, so this is not critical
    return null
  }
}

// Polling manager for keeping data fresh across devices
const subscribers = new Set()
let pollingInterval = null
let lastData = null
let lastDataString = ''

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
  pollOnce()
  
  // Then poll every 5 seconds
  pollingInterval = setInterval(pollOnce, interval)
}

async function pollOnce() {
  try {
    const data = await readData()
    const dataString = JSON.stringify(data)
    
    // Only notify if data changed
    if (dataString !== lastDataString) {
      lastDataString = dataString
      lastData = data
      notifySubscribers(data)
      
      // Broadcast via liveBus so pages re-render
      publishLiveEvent('data-updated', data)
    }
  } catch (error) {
    console.warn('Polling error (will retry):', error.message)
  }
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

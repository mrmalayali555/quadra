// Remote data service for cloud-backed tournament data
// Primary source: Vercel serverless endpoint /api/data
import { publishLiveEvent } from '../lib/liveBus.js'

const DATA_API_URL = '/api/data'

export async function readDataFromRemote() {
  try {
    const res = await fetch(DATA_API_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.warn('Remote API unavailable, falling back to data.json:', error.message)
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
  // Try remote API first, then fall back to local data.json
  const remoteData = await readDataFromRemote()
  if (remoteData) return remoteData
  
  const localData = await readDataFromLocal()
  if (localData) return localData
  
  // If both fail, return empty object (mockAxios will use seedData)
  return {}
}

export async function writeData(data) {
  try {
    console.log('Attempting to write remote data...', { colleges: data.colleges?.length, sports: data.sports?.length, matches: data.matches?.length })
    const res = await fetch(DATA_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`HTTP ${res.status}: ${errorText}`)
    }
    
    return await res.json()
  } catch (error) {
    console.error('Failed to write remote data:', error.message)
    throw error
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

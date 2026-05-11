import { useEffect } from 'react'
import { subscribeLiveEvent } from '../lib/liveBus.js'

/**
 * Hook that triggers a callback when data is updated from polling
 * Used to keep all devices in sync without manual refresh
 */
export function useDataSync(onDataUpdated) {
  useEffect(() => {
    if (!onDataUpdated) return
    
    // Subscribe to data-updated event from polling
    const unsubscribe = subscribeLiveEvent('data-updated', () => {
      onDataUpdated()
    })
    
    return unsubscribe
  }, [onDataUpdated])
}

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

let io = null
try {
  io = require('socket.io-client').io
} catch (e) {
  console.warn('Socket.io-client not available')
}

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  // Return a safe default if context is not available
  return context || { socket: null, isConnected: false, adminToken: null }
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'))
  const socketRef = useRef(null)

  useEffect(() => {
    // Only initialize Socket if io is available 
    if (!io) {
      console.warn('Socket.io-client not available - running in offline mode')
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const newSocket = io(window.location.origin, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 2  // Reduced from 3 to fail faster
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
        setIsConnected(true)
      })

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected')
        setIsConnected(false)
      })

      newSocket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error?.message || error)
        setIsConnected(false)
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      return () => {
        try {
          newSocket.disconnect()
        } catch (e) {
          console.warn('Error disconnecting socket:', e.message)
        }
      }
    } catch (e) {
      console.warn('Failed to initialize Socket.io:', e.message)
      setIsConnected(false)
      // Don't throw - let app continue without socket
    }
  }, []) // run once on mount

  // When adminToken changes, reconnect socket with new auth so server
  // middleware picks up the token and sets socket.isAdmin = true
  useEffect(() => {
    if (!socketRef.current) return
    const s = socketRef.current
    s.auth = { token: adminToken || null }
    // Force reconnect so the server re-runs the auth middleware
    s.disconnect().connect()
  }, [adminToken])

  const authenticateAdmin = useCallback((token) => {
    localStorage.setItem('adminToken', token)
    setAdminToken(token)
  }, [])

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem('adminToken')
    setAdminToken(null)
  }, [])

  const joinMatchRoom = useCallback((matchId) => {
    const s = socketRef.current
    if (!s) return
    if (s.connected) {
      s.emit('join-match', matchId)
    } else {
      // Wait for connection then join
      s.once('connect', () => s.emit('join-match', matchId))
    }
  }, [])

  const leaveMatchRoom = useCallback((matchId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-match', matchId)
    }
  }, [])

  const value = {
    socket,
    isConnected,
    adminToken,
    authenticateAdmin,
    logoutAdmin,
    joinMatchRoom,
    leaveMatchRoom
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
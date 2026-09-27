import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import './App.css'

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
})

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    socket.on('threat_alert', (data) => {
      console.log('[WebSocket] Threat Alert:', data)
      setAlerts(prev => [data, ...prev.slice(0, 4)])
    })

    socket.on('transaction_update', (data) => {
      console.log('[WebSocket] Transaction Update:', data)
    })

    socket.on('connect', () => {
      console.log('[WebSocket] Connected to server')
      if (userId) {
        socket.emit('subscribe_alerts', userId)
      }
    })

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected from server')
    })

    return () => {
      socket.off('threat_alert')
      socket.off('transaction_update')
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [userId])

  const handleLogin = (newToken, newUserId) => {
    setToken(newToken)
    setUserId(newUserId)
    localStorage.setItem('token', newToken)
    localStorage.setItem('userId', newUserId)
    socket.emit('subscribe_alerts', newUserId)
  }

  const handleLogout = () => {
    setToken(null)
    setUserId(null)
    setAlerts([])
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    socket.emit('unsubscribe_alerts', userId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900">
      {token && userId ? (
        <Dashboard 
          token={token} 
          userId={userId} 
          onLogout={handleLogout}
          alerts={alerts}
          socket={socket}
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
import { useState } from 'react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
    const payload = isRegister 
      ? { username, email, password } 
      : { username, password }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred')
      }

      if (!isRegister && data.token) {
        onLogin(data.token, data.userId)
      } else if (isRegister) {
        setError('')
        setUsername('')
        setPassword('')
        setEmail('')
        alert('Registration successful! Please login.')
        setIsRegister(false)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-2xl border border-purple-500">
        <h1 className="text-4xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          VaultCore
        </h1>
        <p className="text-center text-gray-400 mb-6">Banking & AI Fraud Detection</p>

        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-purple-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            required
          />
          {isRegister && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-purple-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-purple-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <button
          onClick={() => {
            setIsRegister(!isRegister)
            setError('')
          }}
          className="w-full mt-4 text-purple-400 hover:text-purple-300 text-sm transition"
        >
          {isRegister ? 'Back to Login' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}

export default Login
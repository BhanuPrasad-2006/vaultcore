import { useState, useEffect } from 'react'
import axios from 'axios'
import './Dashboard.css'

export default function Dashboard() {
  const [assets, setAssets] = useState([])
  const [withdrawalAmount, setWithdrawalAmount] = useState('')
  const [destination, setDestination] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/assets', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAssets(response.data)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    }
  }

  const handleWithdrawal = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        '/api/withdraw/initiate',
        {
          amount: parseFloat(withdrawalAmount),
          destination,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setMessage(`Withdrawal initiated: ${response.data.withdrawalId}`)
      setWithdrawalAmount('')
      setDestination('')
    } catch (error) {
      setMessage(error.response?.data?.error || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.reload()
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>VaultCore Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <section className="assets-section">
          <h2>Your Assets</h2>
          <div className="assets-list">
            {assets.length > 0 ? (
              assets.map((asset) => (
                <div key={asset.id} className="asset-card">
                  <h3>{asset.name}</h3>
                  <p className="asset-amount">${asset.amount}</p>
                  <p className="asset-type">{asset.type}</p>
                </div>
              ))
            ) : (
              <p>No assets found</p>
            )}
          </div>
        </section>

        <section className="withdrawal-section">
          <h2>Initiate Withdrawal</h2>
          <form onSubmit={handleWithdrawal} className="withdrawal-form">
            {message && (
              <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination">Destination Address</label>
              <textarea
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination address"
                rows="3"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

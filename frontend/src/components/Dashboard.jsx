import { useState, useEffect } from 'react'

function Dashboard({ token, userId, onLogout, alerts, socket }) {
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [transactionStatus, setTransactionStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

  useEffect(() => {
    if (accountId) {
      fetchAccount()
      fetchTransactions()
    }
  }, [accountId])

  const fetchAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/account/${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setAccount(data)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError(error.message)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/api/transactions/${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          accountId: parseInt(accountId), 
          amount: parseFloat(amount) 
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Withdrawal failed')
      }

      setTransactionStatus(`${data.status}: ${data.message}`)
      setAmount('')
      fetchAccount()
      fetchTransactions()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'APPROVED': return 'text-green-400'
      case 'REQUIRE_2FA': return 'text-yellow-400'
      case 'FROZEN': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              VaultCore Dashboard
            </h1>
            <p className="text-gray-400 mt-2">User ID: {userId}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-bold transition"
          >
            Logout
          </button>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-2">
            <h2 className="text-xl font-bold text-purple-400">Recent Alerts</h2>
            {alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded border ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-red-900 border-red-500'
                    : 'bg-yellow-900 border-yellow-500'
                }`}
              >
                <p className="font-bold">{alert.type}</p>
                <p className="text-sm">{alert.reason || 'Security alert detected'}</p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-500 rounded text-red-200">
            {error}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Account Selection */}
          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Select Account</h2>
            <input
              type="number"
              placeholder="Account ID"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-purple-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Account Information */}
          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Account Info</h2>
            {account ? (
              <div className="space-y-2 text-gray-300">
                <p>Account ID: <span className="font-bold text-purple-300">{account.account_id}</span></p>
                <p>Balance: <span className="text-2xl font-bold text-green-400">${account.balance.toFixed(2)}</span></p>
                <p>ATM Cash: <span className="font-bold text-blue-400">${account.atm_cash.toFixed(2)}</span></p>
                <p>Status: <span className={account.is_frozen ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                  {account.is_frozen ? 'FROZEN' : 'ACTIVE'}
                </span></p>
              </div>
            ) : (
              <p className="text-gray-400">Select account to view details</p>
            )}
          </div>

          {/* Withdraw Form */}
          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Withdraw Funds</h2>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-purple-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                step="0.01"
                min="0"
              />
              <button
                type="submit"
                disabled={!accountId || !amount || loading}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Withdraw'}
              </button>
            </form>
          </div>
        </div>

        {/* Transaction Status */}
        {transactionStatus && (
          <div className="mb-8 bg-gray-800 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Transaction Status</h2>
            <p className={`text-lg font-bold ${getStatusColor(transactionStatus.split(':')[0])}`}>
              {transactionStatus}
            </p>
          </div>
        )}

        {/* Transactions Table */}
        {transactions.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
            <h2 className="text-xl font-bold text-purple-400 mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-purple-500">
                  <tr>
                    <th className="text-left py-2 text-purple-300">ID</th>
                    <th className="text-left py-2 text-purple-300">Type</th>
                    <th className="text-left py-2 text-purple-300">Amount</th>
                    <th className="text-left py-2 text-purple-300">Risk Score</th>
                    <th className="text-left py-2 text-purple-300">Status</th>
                    <th className="text-left py-2 text-purple-300">Date</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {transactions.map((tx) => (
                    <tr key={tx.transaction_id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                      <td className="py-2 text-gray-300">{tx.transaction_id}</td>
                      <td className="py-2 text-gray-300">{tx.transaction_type}</td>
                      <td className="py-2 text-green-400 font-bold">${tx.amount.toFixed(2)}</td>
                      <td className="py-2 text-gray-300">{tx.risk_score || '-'}</td>
                      <td className={`py-2 font-bold ${
                        tx.status === 'approved' ? 'text-green-400' :
                        tx.status === 'rejected' ? 'text-red-400' :
                        tx.status === 'frozen' ? 'text-red-500' :
                        'text-yellow-400'
                      }`}>
                        {tx.status.toUpperCase()}
                      </td>
                      <td className="py-2 text-gray-400 text-xs">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
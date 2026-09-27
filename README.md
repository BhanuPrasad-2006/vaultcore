# 🏦 VaultCore — Banking with Real-Time AI Fraud Detection

VaultCore is a banking backend that scores every withdrawal for fraud risk in real time. An Isolation Forest model rates each transaction, and the system automatically allows it, asks for 2FA, or freezes the account — while streaming threat alerts to the dashboard over WebSockets.

**Stack:** React + Vite · Node.js / Express · PostgreSQL · MongoDB · Python FastAPI + scikit-learn · Socket.IO · Docker

---

## ✨ How a withdrawal is decided

| Risk score | Action |
|---|---|
| **< 40** | ✅ Allowed — processed immediately |
| **40 – 70** | 🔐 Step-up — requires two-factor verification |
| **> 70** | 🚫 Blocked — account is frozen and a threat event is logged |

The risk score comes from the AI service, using the amount, the device fingerprint (IP + User-Agent) and the account's behaviour.

## 🔒 Security features

- **JWT authentication** with bcrypt password hashing
- **Device fingerprinting** on every sensitive request
- **AES-256-CBC encryption** of account numbers at rest
- **Rate limiting** — global, plus a stricter limiter on withdrawals
- **Helmet** security headers and input validation
- **PostgreSQL functions and a balance-check trigger** so withdrawals can't overdraw an account
- **Audit trail** for every transaction, retrievable per transaction ID
- **Threat event log** in MongoDB with TTL-based expiry

## 🏗️ Architecture

```
React dashboard ──► Express API ──► FastAPI risk service (Isolation Forest)
      ▲                 │
      └── WebSocket ────┤
                        ├──► PostgreSQL  (users, accounts, transactions, audit log)
                        └──► MongoDB     (threat events, sessions)
```

More detail in [ARCHITECTURE.md](ARCHITECTURE.md).

## 🚀 Quick start

Requires Docker and Docker Compose.

```bash
git clone https://github.com/BhanuPrasad-2006/vaultcore.git
cd vaultcore
docker-compose up -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| AI service | http://localhost:5000 |

Full setup and configuration: [SETUP.md](SETUP.md) · Production notes: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)

> **Note:** the secrets in `docker-compose.yml` are development defaults. Replace `JWT_SECRET`, `ENCRYPTION_KEY` and the database passwords before deploying anywhere real.

## 📁 Project structure

```
vaultcore/
├── frontend/     React + Vite dashboard (login, withdrawals, live alerts)
├── backend/      Express API — auth, withdrawals, fingerprinting, encryption
├── ai-service/   FastAPI risk-scoring service (scikit-learn Isolation Forest)
├── database/     PostgreSQL schema and stored procedures
└── docker-compose.yml
```

## 📡 Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` | Create an account / log in (returns a JWT) |
| POST | `/api/withdraw` | Risk-scored withdrawal |
| GET | `/api/account/:accountId` · `/api/transactions/:accountId` | Balance and transaction history |
| GET | `/api/audit-logs/:transactionId` | Audit trail for a transaction |
| POST | `/analyze-risk` (AI service) | Returns a risk score for a transaction |

name=README.md

# VaultCore - Banking + AI Fraud Detection System

A production-grade banking system with real-time fraud detection powered by machine learning.

## Features

✅ **Secure Withdrawal Flow**
- JWT authentication
- Device fingerprinting (IP + User-Agent)
- AI-powered risk scoring
- Real-time WebSocket alerts

✅ **AI Decision Engine**
- Risk Score < 40: Allow transaction
- Risk Score 40-70: Require 2FA
- Risk Score > 70: Freeze account

✅ **MySQL Database**
- ACID-compliant transactions
- Row-level locking to prevent race conditions
- Stored procedures for withdrawal
- Audit logging

✅ **MongoDB Security Logs**
- TTL indexes for auto-expiry
- Threat event tracking
- Session management

✅ **Real-time Alerts**
- WebSocket integration
- Threat notifications
- Transaction updates

✅ **Security Features**
- AES-256-CBC encryption for account numbers
- Helmet middleware
- Rate limiting
- Input validation

## Prerequisites

- Node.js v16+
- MySQL 8.0+
- MongoDB 5.0+
- Python 3.8+

## Setup Instructions

### 1. MySQL Setup

```sql
mysql -u root -p
CREATE DATABASE vaultcore;
USE vaultcore;
source database/mysql_schema.sql;
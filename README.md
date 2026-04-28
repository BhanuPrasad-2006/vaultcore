# VaultCore - Secure Digital Vault

VaultCore is a comprehensive digital asset vault system with multi-layered security, threat detection, and secure withdrawal management.

## 🔐 Features

- **Secure Authentication**: JWT-based authentication with password hashing
- **Threat Detection**: AI-powered threat detection and anomaly analysis
- **Device Fingerprinting**: Track and verify device authenticity
- **Rate Limiting**: Protect against brute force attacks
- **Encryption**: End-to-end encryption for sensitive data
- **Asset Management**: Manage multiple asset types
- **Withdrawal Controls**: Secure withdrawal process with AI verification
- **Audit Logging**: Complete audit trail of all activities
- **Multi-Database**: MySQL for relational data, MongoDB for threat events

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for AI service development)
- Git

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd vaultcore

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev

# AI Service (in another terminal)
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🌐 Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:5000
- **MySQL**: localhost:3306
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 📁 Project Structure

```
vaultcore/
├── backend/           # Node.js backend API
├── frontend/          # React frontend
├── ai-service/        # Python AI service
├── database/          # Database schemas
└── docker-compose.yml # Docker orchestration
```

## 🔑 Environment Variables

See `.env` files in respective directories:
- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration

## 📚 API Documentation

### Authentication

```
POST /api/auth/login
POST /api/auth/register
```

### Withdrawals

```
POST /api/withdraw/initiate
GET /api/withdraw/:withdrawalId
```

### Threat Detection

```
POST /api/detect
POST /api/analyze
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Device fingerprinting
- Rate limiting
- Input validation
- SQL injection prevention
- CORS protection
- Encryption at rest

## 📖 Documentation

- [Setup Guide](SETUP.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Production Deployment](PRODUCTION_DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For support, email support@vaultcore.dev or open an issue on GitHub.

# VaultCore Architecture

## 🏗️ System Overview

VaultCore is a microservices-based digital asset management platform with the following architecture:

```
┌─────────────┐
│  Frontend   │
│  (React)    │
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌─────────────────┐                ┌──────────────────┐
│  Backend API    │                │  AI Service      │
│  (Node.js)      │                │  (Python/Flask)  │
└────────┬────────┘                └────────┬─────────┘
         │                                  │
    ┌────┴──────────────────────────────────┴────┐
    │                                            │
    ▼                    ▼                       ▼
┌─────────┐      ┌──────────────┐      ┌─────────────┐
│ MySQL   │      │  MongoDB     │      │   Redis     │
│ (Users, │      │  (Threats,   │      │  (Cache,    │
│ Assets) │      │   Events)    │      │   Sessions) │
└─────────┘      └──────────────┘      └─────────────┘
```

## 🔌 Components

### Frontend Layer
- **Technology**: React 18 + Vite
- **UI Framework**: Tailwind CSS
- **State Management**: React hooks
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend API Layer
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: JWT + bcryptjs
- **Middleware**: CORS, Rate limiting, Device fingerprinting

### AI Service Layer
- **Runtime**: Python 3.11+
- **Framework**: Flask
- **ML Libraries**: scikit-learn, TensorFlow
- **Purpose**: Threat detection, fraud analysis, anomaly detection

### Data Layer
- **MySQL**: Relational data (users, assets, withdrawals)
- **MongoDB**: NoSQL data (threat events, logs)
- **Redis**: Caching and session management

## 📊 Data Models

### Users
```
{
  id: integer,
  email: string,
  password_hash: string,
  kyc_verified: boolean,
  created_at: timestamp
}
```

### Assets
```
{
  id: integer,
  user_id: integer,
  asset_type: string,
  amount: decimal,
  currency: string,
  locked: boolean
}
```

### Withdrawals
```
{
  id: integer,
  user_id: integer,
  amount: decimal,
  destination: string,
  status: enum('pending', 'approved', 'rejected'),
  threat_level: string
}
```

### ThreatEvents
```
{
  id: objectId,
  userId: string,
  eventType: enum('login_attempt', 'unauthorized_access', 'withdrawal'),
  severity: enum('low', 'medium', 'high', 'critical'),
  timestamp: date,
  resolved: boolean
}
```

## 🔐 Security Architecture

### Authentication Flow
1. User submits email/password
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. All API requests include token in Authorization header

### Device Fingerprinting
- Captures user agent, accept language, encoding
- Used to detect unauthorized access attempts
- Logged in threat event collection

### Encryption
- End-to-end encryption for sensitive data
- AES-256-CBC for data at rest
- TLS 1.3 for data in transit (production)

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable per endpoint
- Prevents brute force attacks

## 🔄 Request Flow

### Login Request Flow
```
1. Frontend: POST /api/auth/login {email, password}
   ↓
2. Backend: Validate credentials
   ↓
3. Backend: Generate JWT token
   ↓
4. Backend: Log authentication attempt
   ↓
5. Backend: Return token to frontend
   ↓
6. Frontend: Store token & redirect to dashboard
```

### Withdrawal Request Flow
```
1. Frontend: POST /api/withdraw/initiate {amount, destination}
   ↓
2. Backend: Validate authorization (JWT)
   ↓
3. Backend: Verify sufficient balance
   ↓
4. Backend: Send to AI Service for fraud analysis
   ↓
5. AI Service: Analyze risk score
   ↓
6. Backend: Create withdrawal record
   ↓
7. Backend: Log threat event (if high risk)
   ↓
8. Backend: Return withdrawal ID
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Assets
- `GET /api/assets` - List user assets
- `POST /api/assets` - Create asset
- `GET /api/assets/:id` - Get asset details
- `DELETE /api/assets/:id` - Delete asset

### Withdrawals
- `POST /api/withdraw/initiate` - Initiate withdrawal
- `GET /api/withdraw/:id` - Get withdrawal status
- `POST /api/withdraw/:id/approve` - Approve withdrawal

### AI Service
- `POST /api/detect` - Detect threats
- `POST /api/analyze` - Analyze withdrawal risk

## 🔧 Deployment Architecture

### Development
- All services run locally
- Database runs in Docker containers
- Frontend dev server with hot reload

### Production
- All services containerized
- Load balancer (nginx)
- Database replication
- CDN for static assets
- Monitoring and logging

## 📈 Scalability

### Horizontal Scaling
- Multiple backend API instances
- Multiple AI service instances
- Load balancer distributes traffic
- Sticky sessions for websocket support

### Vertical Scaling
- Increase container resources
- Database optimization
- Cache optimization

### Database Optimization
- MySQL indexing on frequently queried columns
- MongoDB aggregation pipelines
- Redis caching layer
- Connection pooling

## 🔍 Monitoring & Logging

### Logging Strategy
- Application logs to console
- Audit logs to MySQL
- Threat logs to MongoDB
- System metrics to Redis

### Monitoring Points
- API response times
- Database query performance
- Cache hit rates
- AI model accuracy
- Security alerts

## 🎯 Performance Optimization

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Gzip compression

### Backend
- Query optimization
- Connection pooling
- Response caching
- Compression middleware

### AI Service
- Model caching
- Batch processing
- GPU acceleration (if available)

## 🚀 Deployment Considerations

- Use environment variables for configuration
- Implement health checks
- Set resource limits
- Configure auto-scaling
- Enable logging and monitoring
- Implement backup and recovery
- Regular security audits

## 📚 Related Documentation

- [Setup Guide](SETUP.md)
- [Production Deployment](PRODUCTION_DEPLOYMENT.md)
- API Documentation (see README.md)

# VaultCore Setup Guide

## Prerequisites

- Docker & Docker Compose 2.0+
- 4GB RAM minimum
- 2GB disk space

## 🔧 Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd vaultcore
```

### 2. Environment Configuration

Copy and configure environment files:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Database Setup

The database is automatically initialized when using Docker Compose. The MySQL schema is applied on first run.

### 4. Start Services

```bash
# Using Docker Compose
docker-compose up -d

# Using startup script
chmod +x startup.sh
./startup.sh
```

### 5. Verify Installation

```bash
# Check all services are running
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ai-service

# Test API
curl http://localhost:3001/health
```

## 🔐 Security Configuration

### JWT Configuration

Update `JWT_SECRET` in `backend/.env`:

```env
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=24h
```

### Database Credentials

Change default credentials in `docker-compose.yml`:

```yaml
MYSQL_ROOT_PASSWORD: change_this
MYSQL_PASSWORD: change_this
```

### AI Service Configuration

Configure AI model paths in `ai-service/main.py`

## 📦 Development Setup

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### AI Service Development

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## 🐛 Troubleshooting

### Port Already in Use

If ports are already in use, modify port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3000:80"   # Change 3000 to available port
  - "3001:3001" # Change 3001 to available port
```

### Database Connection Issues

Check MySQL logs:

```bash
docker-compose logs mysql
```

Verify credentials in `docker-compose.yml` match your `backend/.env`

### Container Won't Start

View detailed logs:

```bash
docker-compose logs [service-name]
```

### Memory Issues

If running on limited RAM, consider running services locally:

```bash
# Stop containers
docker-compose down

# Run backend locally
cd backend && npm run dev
```

## 📊 Monitoring

### View Service Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Access Databases

```bash
# MySQL
mysql -h localhost -u vaultuser -p vaultcore
# Password: vaultpass

# MongoDB
mongosh mongodb://admin:mongopass@localhost:27017/vaultcore
```

### Check Redis

```bash
docker exec vaultcore-redis redis-cli ping
```

## 🔄 Updating Services

### Update Code

```bash
git pull origin main
```

### Rebuild Containers

```bash
docker-compose down
docker-compose up -d --build
```

## 📝 Next Steps

1. Configure authentication providers
2. Set up SSL/TLS certificates
3. Configure email notifications
4. Set up monitoring and alerts
5. Run security audit
6. Deploy to production (see PRODUCTION_DEPLOYMENT.md)

## 📞 Support

For setup issues, check the logs or contact the team.

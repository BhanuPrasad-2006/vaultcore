# VaultCore Production Deployment Guide

## 🚀 Pre-Deployment Checklist

- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance testing completed
- [ ] Database backup strategy defined
- [ ] Disaster recovery plan created
- [ ] Monitoring system configured
- [ ] SSL/TLS certificates obtained
- [ ] Environment variables configured
- [ ] Load balancer configured
- [ ] CDN configured

## 🏗️ Infrastructure Setup

### Cloud Provider Options

#### AWS
- **Compute**: ECS with Fargate
- **Database**: RDS (MySQL), DocumentDB (MongoDB)
- **Caching**: ElastiCache (Redis)
- **Load Balancing**: Application Load Balancer (ALB)
- **Monitoring**: CloudWatch
- **CI/CD**: CodePipeline

#### Azure
- **Compute**: Container Instances or App Service
- **Database**: Azure Database for MySQL/MongoDB
- **Caching**: Azure Cache for Redis
- **Load Balancing**: Application Gateway
- **Monitoring**: Azure Monitor
- **CI/CD**: Azure Pipelines

#### GCP
- **Compute**: Cloud Run or GKE
- **Database**: Cloud SQL, Firestore
- **Caching**: Memorystore
- **Load Balancing**: Cloud Load Balancing
- **Monitoring**: Cloud Monitoring
- **CI/CD**: Cloud Build

### Kubernetes Deployment (Recommended)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: vaultcore-config
data:
  NODE_ENV: "production"
  JWT_EXPIRE: "24h"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vaultcore-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vaultcore-backend
  template:
    metadata:
      labels:
        app: vaultcore-backend
    spec:
      containers:
      - name: backend
        image: vaultcore-backend:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: vaultcore-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔐 Security Configuration

### Environment Variables

```bash
# Production environment
NODE_ENV=production
PORT=3001

# Database
MYSQL_HOST=prod-mysql.example.com
MYSQL_USER=produser
MYSQL_PASSWORD=strong_password_here
MYSQL_DATABASE=vaultcore_prod

# JWT
JWT_SECRET=extremely_long_and_random_string_here
JWT_EXPIRE=24h

# AI Service
AI_SERVICE_URL=https://ai-service.internal

# Redis
REDIS_URL=redis://prod-redis.example.com:6379

# SSL/TLS
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### SSL/TLS Configuration

```nginx
server {
  listen 443 ssl http2;
  server_name api.vaultcore.com;

  ssl_certificate /etc/ssl/certs/api.vaultcore.com.crt;
  ssl_certificate_key /etc/ssl/private/api.vaultcore.com.key;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass http://backend:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 🗄️ Database Configuration

### MySQL Production Setup

```sql
-- Create production database
CREATE DATABASE vaultcore_prod;

-- Create backup user
CREATE USER 'backup_user'@'%' IDENTIFIED BY 'backup_password';
GRANT SELECT, LOCK TABLES ON vaultcore_prod.* TO 'backup_user'@'%';

-- Enable binary logging for replication
SET GLOBAL binlog_format='ROW';

-- Create read replica
CHANGE MASTER TO
  MASTER_HOST='primary.example.com',
  MASTER_USER='replication_user',
  MASTER_PASSWORD='replication_password';

START SLAVE;
```

### MongoDB Production Setup

```javascript
// Connect to replica set
db.adminCommand({
  replSetInitiate: {
    _id: "rs0",
    members: [
      { _id: 0, host: "mongo1:27017" },
      { _id: 1, host: "mongo2:27017" },
      { _id: 2, host: "mongo3:27017" }
    ]
  }
});

// Enable authentication
db.createUser({
  user: "admin",
  pwd: "strong_password",
  roles: [{role: "root", db: "admin"}]
});
```

## 📊 Monitoring & Logging

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'vaultcore-backend'
    static_configs:
      - targets: ['backend:3001']
    metrics_path: '/metrics'

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql_exporter:9104']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis_exporter:9121']
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

```json
{
  "index_patterns": ["vaultcore-*"],
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 2,
    "index.lifecycle.name": "vaultcore-policy"
  },
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "message": { "type": "text" },
      "user_id": { "type": "keyword" },
      "ip_address": { "type": "ip" }
    }
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: Production Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Security scan
        run: npm audit

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t vaultcore-backend:${{ github.sha }} .
      - name: Push to registry
        run: docker push vaultcore-backend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: kubectl set image deployment/vaultcore-backend backend=vaultcore-backend:${{ github.sha }}
```

## 🔍 Health Checks & Probes

### Liveness Probe
```bash
curl -f http://localhost:3001/health || exit 1
```

### Readiness Probe
```bash
curl -f http://localhost:3001/ready || exit 1
```

### Startup Probe
```bash
curl -f http://localhost:3001/startup || exit 1
```

## 📈 Auto-Scaling Configuration

### Kubernetes HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vaultcore-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vaultcore-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 💾 Backup & Disaster Recovery

### Automated Backups

```bash
# MySQL daily backup
0 2 * * * mysqldump -u root -p$MYSQL_PASSWORD --all-databases | gzip > /backups/mysql_$(date +\%Y\%m\%d).sql.gz

# MongoDB daily backup
0 3 * * * mongodump --uri="mongodb://user:pass@localhost:27017/vaultcore" --archive=/backups/mongo_$(date +\%Y\%m\%d).archive

# S3 upload
0 4 * * * aws s3 cp /backups/ s3://vaultcore-backups/ --recursive
```

### Recovery Procedure

```bash
# MySQL restore
mysql -u root -p$MYSQL_PASSWORD < /backups/mysql_backup.sql

# MongoDB restore
mongorestore --archive=/backups/mongo_backup.archive
```

## 🔔 Alert Configuration

### Critical Alerts

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  annotations:
    summary: "High error rate detected"
    description: "Error rate above 5%"

- alert: DatabaseDown
  expr: pg_up == 0
  for: 1m
  annotations:
    summary: "Database is down"
    description: "PostgreSQL instance is unreachable"

- alert: DiskSpaceLow
  expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
  for: 5m
  annotations:
    summary: "Disk space low"
    description: "Less than 10% disk space available"
```

## 📋 Maintenance Windows

### Scheduled Maintenance
- **Day**: Sunday
- **Time**: 02:00 - 04:00 UTC
- **Duration**: 2 hours
- **Notification**: 72 hours in advance

### Update Procedure
1. Backup all databases
2. Deploy to staging environment
3. Run smoke tests
4. Schedule maintenance window
5. Update production
6. Monitor for issues
7. Rollback if needed

## 🚨 Incident Response

### On-Call Rotation
- Primary: 24/7 support
- Secondary: Escalation
- Communication: PagerDuty

### Escalation Procedure
1. Detect issue (automated or manual)
2. Alert on-call engineer
3. Assess severity
4. Execute recovery plan
5. Document incident
6. Post-mortem within 24 hours

## 📞 Support & Contacts

- **On-Call Engineer**: [contact info]
- **Database Admin**: [contact info]
- **DevOps Lead**: [contact info]
- **Security Team**: [contact info]

---

**Last Updated**: 2024
**Version**: 1.0

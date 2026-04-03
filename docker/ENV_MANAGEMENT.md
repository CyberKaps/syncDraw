# Environment Variables Management for Docker

## 📋 Overview

This guide explains how to manage environment variables for the Draw-app Docker containers.

## 🎯 Three Approaches

### **1. Docker Compose (Recommended) ✅**

**Use when:** Running locally or deploying with Docker Compose

**Setup:**
```bash
# 1. Copy the example env file
cp .env.example .env

# 2. Edit .env with your actual values
nano .env

# 3. Run with docker compose
docker-compose up --build
```

**Advantages:**
- ✅ Easy to manage all services
- ✅ Automatic networking between containers
- ✅ Environment variables centralized
- ✅ Can use `.env` file automatically

---

### **2. Runtime Environment Variables**

**Use when:** Running individual containers

**Backend:**
```bash
docker build -f docker/Dockerfile.backend -t http-backend .
docker run -p 3001:3001 \
  -e DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/postgres?schema=public" \
  -e JWT_SECRET="your-secret-key" \
  http-backend
```

**WebSocket:**
```bash
docker build -f docker/Dockerfile.ws -t ws-backend .
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/postgres?schema=public" \
  -e JWT_SECRET="your-secret-key" \
  ws-backend
```

**Using env file:**
```bash
docker run -p 3001:3001 --env-file .env http-backend
docker run -p 8080:8080 --env-file .env ws-backend
```

---

### **3. Kubernetes ConfigMaps/Secrets**

**Use when:** Deploying to Kubernetes

**Example ConfigMap:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  NODE_ENV: "production"
  
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@postgres:5432/db"
  JWT_SECRET: "your-secret-key"
```

---

## 🔐 Required Environment Variables

### **Both Backends:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `NODE_ENV` - Environment (development/production)

### **Frontend (if needed):**
- `NEXT_PUBLIC_HTTP_BACKEND_URL` - HTTP backend URL
- `NEXT_PUBLIC_WS_BACKEND_URL` - WebSocket backend URL

---

## 📝 Usage Examples

### **Development (Docker Compose):**
```bash
# Start all services
docker-compose up

# Rebuild and start
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Production (Individual Containers):**
```bash
# 1. Start PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Start HTTP Backend
docker run -d --name http-backend \
  -p 3001:3001 \
  --env-file .env \
  --link postgres:postgres \
  http-backend

# 3. Start WebSocket Backend
docker run -d --name ws-backend \
  -p 8080:8080 \
  --env-file .env \
  --link postgres:postgres \
  ws-backend
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
3. **Different secrets per environment** - Dev, staging, production should have different secrets
4. **Use Docker secrets in production** - For sensitive data in Docker Swarm
5. **Rotate secrets regularly** - Change JWT_SECRET periodically

---

## 🐛 Troubleshooting

**Issue:** Can't connect to database from container

**Solution:** Use `host.docker.internal` instead of `localhost` for database on host:
```bash
DATABASE_URL="postgresql://postgres:password@host.docker.internal:5432/postgres"
```

Or use Docker Compose with service names:
```bash
DATABASE_URL="postgresql://postgres:password@postgres:5432/postgres"
```

**Issue:** Environment variables not loading

**Solution:** Check that:
- `.env` file exists
- Variables are properly formatted (`KEY=value`, no spaces around `=`)
- Using `--env-file .env` flag if running docker run
- Variables are declared in `docker-compose.yml`

---

## 📚 Additional Resources

- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)

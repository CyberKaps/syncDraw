# Fix 405 Error - Deployment Guide

## Problem
The frontend is trying to access `https://syncdraw.cyberkaps.me/signup` but the backend API is not properly routed, causing a 405 Method Not Allowed error.

## Solution
Set up Nginx reverse proxy to route `/api/*` to the backend and `/ws/*` to the WebSocket server.

## Deployment Steps

### 1. SSH into your EC2 server
```bash
ssh -i ~/.ssh/your-key.pem ubuntu@18.207.131.147
```

### 2. Install Nginx (if not already installed)
```bash
sudo apt update
sudo apt install nginx -y
```

### 3. Copy the Nginx configuration
On your local machine, copy the config to the server:
```bash
scp -i ~/.ssh/your-key.pem deploy/nginx-syncdraw.conf ubuntu@18.207.131.147:~/
```

Or on the server, create the file manually:
```bash
sudo nano /etc/nginx/sites-available/syncdraw
```
Paste the contents from `deploy/nginx-syncdraw.conf`

### 4. Create symbolic link to enable the site
```bash
sudo ln -sf /etc/nginx/sites-available/syncdraw /etc/nginx/sites-enabled/
```

### 5. Remove default Nginx config (if it conflicts)
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 6. Test Nginx configuration
```bash
sudo nginx -t
```

### 7. Set up SSL with Let's Encrypt (if not already done)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d syncdraw.cyberkaps.me
```

### 8. Reload Nginx
```bash
sudo systemctl reload nginx
```

### 9. Verify Docker containers are running
```bash
docker ps
```
You should see:
- `sync-frontend` on port 3000
- `sync-backend` on port 3001
- `sync-ws` on port 8080
- `postgres-db` on port 5432

### 10. Test the endpoints
```bash
# Test backend API
curl http://localhost:3001/signup -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test","name":"test"}'

# Test through Nginx
curl https://syncdraw.cyberkaps.me/api/signup -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test","name":"test"}'
```

## What Changed

### 1. `apps/draw-app-fe/config.ts`
- Updated to use `/api` and `/ws` paths instead of full URLs
- Now uses: `https://syncdraw.cyberkaps.me/api` for backend
- Now uses: `wss://syncdraw.cyberkaps.me/ws` for WebSocket

### 2. `.github/workflows/cd_frontend.yml`
- Removed hardcoded environment variables
- Frontend now uses path-based routing automatically

### 3. `deploy/nginx-syncdraw.conf` (NEW)
- Routes `/api/*` → `http://localhost:3001/`
- Routes `/ws/*` → `http://localhost:8080/`
- Routes `/*` → `http://localhost:3000/` (Next.js frontend)

## After Deployment

1. Commit and push your changes:
```bash
git add .
git commit -m "fix: Update API routing to use Nginx reverse proxy"
git push origin prod
```

2. Wait for GitHub Actions to complete deployment

3. Test the signup page at https://syncdraw.cyberkaps.me/signup

## Troubleshooting

### Check Nginx logs
```bash
sudo tail -f /var/log/nginx/syncdraw_error.log
sudo tail -f /var/log/nginx/syncdraw_access.log
```

### Check Docker logs
```bash
docker logs sync-frontend
docker logs sync-backend
docker logs sync-ws
```

### Check if ports are listening
```bash
sudo netstat -tlnp | grep -E '3000|3001|8080'
```

### Restart services if needed
```bash
sudo systemctl restart nginx
docker restart sync-frontend sync-backend sync-ws
```

## Expected Result

After these changes, your API calls will work as follows:

- `https://syncdraw.cyberkaps.me/api/signup` → Backend container
- `https://syncdraw.cyberkaps.me/api/signin` → Backend container
- `wss://syncdraw.cyberkaps.me/ws?token=...` → WebSocket container
- `https://syncdraw.cyberkaps.me/` → Frontend (Next.js)

# OPENBO Deployment Guide

## 🚀 Server Deployment Instructions

### Prerequisites
- Docker and Docker Compose installed on server
- Ports available: 3001 (frontend), 5001 (backend), 3306 (database)
- Domain: seminar.devmosel.com

---

## ⚠️ Important: Which docker-compose to use?

**USE ONLY:** `/docker-compose.yml` (root directory)

**DO NOT USE:**
- ❌ `/backend/docker-compose.yaml` (for backend development only)
- ❌ `/frontend/docker-compose.yml` (for frontend development only)

The root `docker-compose.yml` orchestrates ALL services together:
- Database (MariaDB)
- Backend (Flask)
- Frontend (Next.js)

---

## 📋 Deployment Steps

### 1. Clone Repository on Server
```bash
git clone https://github.com/devmosel/Internet-tech.git
cd Internet-tech
```

### 2. Configure Environment (Optional)
Edit `docker-compose.yml` if needed:
- Change database passwords
- Update SECRET_KEY
- Modify ports if there are conflicts

### 3. Stop Any Running Containers
```bash
docker-compose down
```

### 4. Build and Start Services
```bash
# Build images and start all services
docker-compose up -d --build
```

### 5. Check Service Status
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

---

## 🔧 Troubleshooting

### Port Already Allocated Error

**Symptom:** `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Solutions:**

1. **Check what's using the port:**
```bash
# On Linux/Mac
sudo lsof -i :3001
sudo lsof -i :5001
sudo lsof -i :3306

# On Linux alternative
sudo netstat -tulpn | grep :3001
```

2. **Stop conflicting containers:**
```bash
# List all containers (including stopped)
docker ps -a

# Stop specific container
docker stop <container_name>

# Remove container
docker rm <container_name>

# Or stop all containers from all docker-compose files
docker-compose down
cd backend && docker-compose down
cd ../frontend && docker-compose down
cd ..
```

3. **Change ports in docker-compose.yml:**
```yaml
ports:
  - "3002:3000"  # Changed from 3001 to 3002
```

### Database Connection Issues

**Check if database is healthy:**
```bash
docker-compose logs db
docker exec -it openbo_db mysql -u openbo_user -popenbo_pass openbo_db
```

### Backend Not Starting

**Check backend logs:**
```bash
docker-compose logs backend

# Enter backend container
docker exec -it openbo_backend sh
```

### Frontend Build Errors

**Rebuild without cache:**
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

---

## 🌐 Access Your Application

After successful deployment:

- **Frontend:** http://seminar.devmosel.com:3001
- **Backend API:** http://seminar.devmosel.com:5001
- **Health Check:** http://seminar.devmosel.com:5001/api/health

---

## 🔄 Update Deployment

When you push changes to GitHub:

```bash
# On server
cd Internet-tech
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

---

## 📊 Service Ports

| Service  | Internal Port | External Port | Access                              |
|----------|---------------|---------------|-------------------------------------|
| Frontend | 3000          | 3001          | http://seminar.devmosel.com:3001   |
| Backend  | 5000          | 5001          | http://seminar.devmosel.com:5001   |
| Database | 3306          | 3306          | localhost:3306 (not public)        |

---

## 🔐 Production Checklist

Before deploying to production:

- [ ] Change `MYSQL_ROOT_PASSWORD` in docker-compose.yml
- [ ] Change `MYSQL_PASSWORD` in docker-compose.yml
- [ ] Change `SECRET_KEY` in docker-compose.yml
- [ ] Set up reverse proxy (Nginx/Caddy) for HTTPS
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure domain DNS records
- [ ] Enable Docker restart policies (already set to `unless-stopped`)

---

## 📝 Nginx Reverse Proxy (Optional)

For production, use Nginx to handle HTTPS:

```nginx
# /etc/nginx/sites-available/openbo
server {
    listen 80;
    server_name seminar.devmosel.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable with:
```bash
sudo ln -s /etc/nginx/sites-available/openbo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

For HTTPS, use Certbot:
```bash
sudo certbot --nginx -d seminar.devmosel.com
```

---

## 🎯 Quick Reference

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart frontend

# Rebuild a service
docker-compose up -d --build frontend

# Check status
docker-compose ps
```

---

**Need help?** Check logs first: `docker-compose logs -f`

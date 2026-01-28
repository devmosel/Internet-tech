# Deploying OPENBO on Coolify

## 🎯 Key Differences: Coolify vs Standard Docker

| Aspect | Standard Docker | Coolify |
|--------|----------------|---------|
| **Port Mapping** | Explicit (`"3001:3000"`) | Auto-managed by Coolify |
| **Configuration** | `docker-compose.yml` | `.coolify.yml` or compose |
| **Networking** | Manual network setup | Auto-proxy with Traefik/Caddy |
| **SSL/HTTPS** | Manual (Nginx/Certbot) | Automatic via Coolify |
| **Domains** | Manual DNS + reverse proxy | Configure in Coolify UI |

---

## 🚨 Your Error Explained

**Error:** `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Cause:**
- Your `docker-compose.yml` has explicit port mapping: `"3001:3000"`
- Coolify manages ports automatically via its reverse proxy
- When Coolify tries to deploy, the port is either:
  1. Already used by another Coolify service
  2. Conflicting with Coolify's auto-port assignment
  3. Previous deployment containers still running

---

## ✅ Solution: Deploy with Coolify

### Option A: Use Coolify UI (Recommended)

1. **In Coolify Dashboard:**
   - Create New Resource → Service
   - Select "Docker Compose" or "Dockerfile"
   - Connect your GitHub repo: `devmosel/Internet-tech`

2. **Configure Services:**

   **Frontend Service:**
   - Name: `openbo-frontend`
   - Dockerfile: `frontend/Dockerfile`
   - Build Context: `frontend/`
   - Port: `3000` (internal only)
   - Domain: `seminar.devmosel.com` or your custom domain
   - Environment Variables:
     ```
     NODE_ENV=production
     NEXT_PUBLIC_API_URL=https://api.seminar.devmosel.com
     ```

   **Backend Service:**
   - Name: `openbo-backend`
   - Dockerfile: `backend/Dockerfile`
   - Build Context: `backend/`
   - Port: `5000` (internal only)
   - Domain: `api.seminar.devmosel.com`
   - Environment Variables:
     ```
     FLASK_ENV=production
     SECRET_KEY=your-secure-secret-key
     DB_HOST=db
     DB_PORT=3306
     DB_NAME=openbo_db
     DB_USER=openbo_user
     DB_PASSWORD=secure-password
     DATABASE_URL=mysql+pymysql://openbo_user:secure-password@db:3306/openbo_db
     ```

   **Database Service:**
   - Name: `openbo-db`
   - Type: MariaDB 11.2
   - Database Name: `openbo_db`
   - Username: `openbo_user`
   - Password: `secure-password`
   - Root Password: `secure-root-password`

3. **Deploy:**
   - Click "Deploy" for each service
   - Coolify will handle ports, SSL, and networking automatically

---

### Option B: Use docker-compose.coolify.yml

1. **In your repository root, use:**
   ```bash
   docker-compose.coolify.yml
   ```

2. **In Coolify UI:**
   - Create New Resource → Docker Compose
   - Point to: `docker-compose.coolify.yml`
   - Set environment variables in Coolify UI

3. **Key changes in coolify compose:**
   ```yaml
   # ❌ DON'T use explicit port mappings
   ports:
     - "3001:3000"
   
   # ✅ USE expose instead
   expose:
     - "3000"
   ```

---

### Option C: Use .coolify.yml (Native Coolify Config)

1. **Use the `.coolify.yml` file in repo root**

2. **In Coolify:**
   - Coolify auto-detects `.coolify.yml`
   - Automatically configures services
   - Manages ports and networking

3. **Set Environment Variables in Coolify UI:**
   ```
   BACKEND_URL=https://api.seminar.devmosel.com
   DB_HOST=openbo_db
   DB_PORT=3306
   DB_NAME=openbo_db
   DB_USER=openbo_user
   DB_PASSWORD=your-secure-password
   SECRET_KEY=your-secret-key
   MYSQL_ROOT_PASSWORD=your-root-password
   DATABASE_URL=mysql+pymysql://openbo_user:password@db:3306/openbo_db
   ```

---

## 🔧 Troubleshooting

### 1. Port Already Allocated

**Check for existing containers:**
```bash
# In Coolify server via SSH
docker ps -a | grep openbo
docker ps -a | grep 3001
```

**Stop old deployments:**
- In Coolify UI: Stop/Delete old services
- Or via SSH: `docker stop <container_id>`

### 2. Services Can't Communicate

**Ensure all services in same Coolify project:**
- All services should be in the same "Resource" or "Stack"
- Coolify creates a shared network automatically

### 3. Database Connection Failed

**Verify DB_HOST:**
- If separate services: Use Coolify-assigned hostname
- If docker-compose: Use service name (`db`)

**Check in Coolify UI:**
- Service → Logs
- Look for connection errors

### 4. Frontend Can't Reach Backend

**Check NEXT_PUBLIC_API_URL:**
```bash
# Should be the FULL URL including protocol
NEXT_PUBLIC_API_URL=https://api.seminar.devmosel.com

# NOT just:
NEXT_PUBLIC_API_URL=api.seminar.devmosel.com  # ❌ Missing https://
```

---

## 📝 Coolify Best Practices

1. **Use Environment Variables**
   - Don't hardcode secrets in compose files
   - Set them in Coolify UI → Service → Environment

2. **Use `expose` not `ports`**
   ```yaml
   # ✅ Good for Coolify
   expose:
     - "3000"
   
   # ❌ Bad for Coolify (causes port conflicts)
   ports:
     - "3001:3000"
   ```

3. **Let Coolify Handle Domains**
   - Set domains in Coolify UI
   - Coolify auto-configures SSL via Let's Encrypt
   - No need for Nginx/Caddy configs

4. **Use Coolify Labels**
   ```yaml
   labels:
     - "coolify.managed=true"
   ```

5. **Health Checks**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:3000"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

---

## 🎯 Quick Fix for Your Current Issue

**Immediate Steps:**

1. **Stop all running deployments in Coolify UI**

2. **Delete old containers (in Coolify server SSH):**
   ```bash
   docker ps -a | grep frontend
   docker stop <container_id>
   docker rm <container_id>
   ```

3. **Update deployment to use one of:**
   - `.coolify.yml` (in repo root)
   - `docker-compose.coolify.yml`
   - Or configure individual services in Coolify UI

4. **Remove port mappings from your current setup**

5. **Redeploy in Coolify**

---

## 📊 Recommended Coolify Setup

**Project Structure in Coolify:**

```
OPENBO Project
├── openbo-frontend (Service)
│   ├── Domain: seminar.devmosel.com
│   ├── Port: 3000 (internal)
│   └── SSL: Auto (Let's Encrypt)
│
├── openbo-backend (Service)
│   ├── Domain: api.seminar.devmosel.com
│   ├── Port: 5000 (internal)
│   └── SSL: Auto (Let's Encrypt)
│
└── openbo-db (Database)
    ├── Type: MariaDB 11.2
    ├── Port: 3306 (internal only)
    └── Volume: Persistent storage
```

**URLs After Deployment:**
- Frontend: `https://seminar.devmosel.com`
- Backend API: `https://api.seminar.devmosel.com`
- Database: Internal only (not publicly accessible)

---

## ✅ Files to Use

| File | Purpose | Use with Coolify? |
|------|---------|-------------------|
| `docker-compose.yml` | Local/Standard deployment | ❌ No (has port conflicts) |
| `docker-compose.coolify.yml` | Coolify deployment | ✅ Yes |
| `.coolify.yml` | Native Coolify config | ✅ Yes (Recommended) |

---

## 🚀 Next Steps

1. Push these changes to GitHub
2. In Coolify, point to `.coolify.yml` or `docker-compose.coolify.yml`
3. Configure environment variables in Coolify UI
4. Deploy!

Your app will be live with automatic HTTPS at your configured domain! 🎉

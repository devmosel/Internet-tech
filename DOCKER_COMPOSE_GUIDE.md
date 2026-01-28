# Docker Compose Files Explanation

## 📁 Structure Overview

This project has **3 docker-compose files** for different purposes:

```
OPENBO_FINALE/
├── docker-compose.yml           ← 🎯 PRODUCTION (Use this for deployment)
├── backend/
│   └── docker-compose.yaml      ← 🔧 BACKEND DEVELOPMENT ONLY
└── frontend/
    └── docker-compose.yml       ← 🔧 FRONTEND DEVELOPMENT ONLY
```

---

## 🎯 Root: `/docker-compose.yml` (PRODUCTION)

**Purpose:** Full-stack deployment with all services

**Services:**
- ✅ Database (MariaDB)
- ✅ Backend (Flask API)
- ✅ Frontend (Next.js)

**When to use:**
- ✅ Server deployment
- ✅ Production environment
- ✅ Testing full-stack integration
- ✅ Demo/staging environments

**Ports:**
- Frontend: `3001:3000`
- Backend: `5001:5000`
- Database: `3306:3306`

**Command:**
```bash
docker-compose up -d --build
```

---

## 🔧 Backend: `/backend/docker-compose.yaml` (DEV ONLY)

**Purpose:** Backend development in isolation

**Services:**
- ✅ Database (MariaDB)
- ✅ Backend (Flask API)
- ❌ No Frontend

**When to use:**
- ✅ Backend development
- ✅ Testing API endpoints
- ✅ Database migrations

**Ports:**
- Backend: `5000:5000`
- Database: `3306:3306`

**Command:**
```bash
cd backend
docker-compose up -d
```

---

## 🔧 Frontend: `/frontend/docker-compose.yml` (DEV ONLY)

**Purpose:** Frontend development in isolation

**Services:**
- ✅ Frontend (Next.js)
- ❌ No Backend
- ❌ No Database

**When to use:**
- ✅ Frontend development (requires backend running separately)
- ✅ UI/UX testing

**Ports:**
- Frontend: `3001:3000`

**Command:**
```bash
cd frontend
docker-compose up -d
```

---

## ⚠️ Common Issues

### Issue: Port Already Allocated

**Cause:** Running multiple docker-compose files simultaneously

**Solution:**
```bash
# Stop all containers
docker-compose down
cd backend && docker-compose down
cd ../frontend && docker-compose down
cd ..

# Start only the one you need
docker-compose up -d  # For production/full-stack
```

### Issue: Services Can't Communicate

**Cause:** Different docker-compose files create different networks

**Solution:** Use root `docker-compose.yml` which puts all services on the same network

---

## 🚀 Recommended Workflows

### For Server Deployment:
```bash
# Use root docker-compose.yml ONLY
docker-compose up -d --build
```

### For Local Development (Full-stack):
```bash
# Option 1: Use Docker for everything
docker-compose up -d --build

# Option 2: Run locally (recommended for faster development)
# Terminal 1: Backend
cd backend
python run.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### For Backend-Only Development:
```bash
cd backend
docker-compose up -d
# Backend API available at http://localhost:5000
```

### For Frontend-Only Development:
```bash
# Start backend separately first, then:
cd frontend
npm run dev
# Frontend available at http://localhost:3000
```

---

## 🎯 Quick Decision Guide

**Q: I want to deploy to a server**
→ Use: Root `/docker-compose.yml`

**Q: I want to develop backend API**
→ Use: `/backend/docker-compose.yaml` OR run `python run.py` locally

**Q: I want to develop frontend**
→ Use: Local `npm run dev` (backend must be running separately)

**Q: I want to test everything together**
→ Use: Root `/docker-compose.yml`

**Q: I got port conflicts**
→ Solution: Stop all compose files, use only one at a time

---

## 📝 Network Architecture

### Root docker-compose.yml:
```
openbo_network
├── openbo_db (database)
├── openbo_backend (can connect to db)
└── openbo_frontend (can connect to backend)
```

### Separate docker-compose files:
```
backend_network
├── openbo_db
└── openbo_backend

frontend_network (separate)
└── frontend (⚠️ cannot reach backend)
```

This is why you should use the root docker-compose.yml for deployment!

---

## ✅ Summary

| File | Services | Purpose | Deploy? |
|------|----------|---------|---------|
| `/docker-compose.yml` | DB + Backend + Frontend | Production | ✅ YES |
| `/backend/docker-compose.yaml` | DB + Backend | Dev Only | ❌ NO |
| `/frontend/docker-compose.yml` | Frontend | Dev Only | ❌ NO |

**Remember:** For server deployment, always use the root `docker-compose.yml`!

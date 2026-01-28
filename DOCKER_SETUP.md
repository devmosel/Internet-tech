# Docker Compose Setup

This docker-compose.yml orchestrates the entire OPENBO application with three services:

## Services

### 1. Database (MariaDB)
- Image: mariadb:11.2
- Port: 3306
- Credentials:
  - Database: openbo_db
  - User: openbo_user
  - Password: openbo_pass
  - Root Password: rootpassword

### 2. Backend (Flask)
- Port: 5000
- Depends on: Database
- Auto-runs migrations and seeding on startup

### 3. Frontend (Next.js)
- Port: 3000
- Depends on: Backend
- Configured to communicate with backend

## Usage

### Start all services:
```bash
docker-compose up -d
```

### Start with rebuild:
```bash
docker-compose up -d --build
```

### View logs:
```bash
docker-compose logs -f
```

### Stop all services:
```bash
docker-compose down
```

### Stop and remove volumes:
```bash
docker-compose down -v
```

## Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:3306

## Environment Variables

You can customize the setup by editing the environment variables in docker-compose.yml:

- Database credentials (DB_HOST, DB_USER, DB_PASSWORD, etc.)
- Flask SECRET_KEY
- NEXT_PUBLIC_API_URL for frontend

## Development Mode

For development, you can override specific services:

```bash
# Run only database
docker-compose up db

# Run backend locally, but use containerized database
docker-compose up db
cd backend && python run.py
```

## Production

For production deployment, consider:
1. Change all default passwords
2. Use environment variables from a .env file
3. Configure proper secrets management
4. Set up SSL/TLS with a reverse proxy (nginx)
5. Use production Dockerfile variants

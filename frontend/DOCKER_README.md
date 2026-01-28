# Frontend Docker Setup

This Next.js application can be run using Docker for easy deployment on any PC.

## Prerequisites

- Docker installed on your system ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose (included with Docker Desktop)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. Clone or copy this project to your PC
2. Navigate to the project directory:
   ```bash
   cd frontend
   ```

3. Build and run the container:
   ```bash
   docker-compose up -d
   ```

4. Access the application at: `http://localhost:3000`

5. To stop the application:
   ```bash
   docker-compose down
   ```

### Option 2: Using Docker Commands

1. Build the Docker image:
   ```bash
   docker build -t frontend-app .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 frontend-app
   ```

3. Access the application at: `http://localhost:3000`

## Configuration

### Environment Variables

You can configure the API endpoint and other environment variables:

**Using docker-compose.yml:**
Edit the `docker-compose.yml` file and add your environment variables:
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://your-backend-url:5000
```

**Using docker run:**
```bash
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://your-backend-url:5000 frontend-app
```

### Custom Port

To run on a different port (e.g., 8080):

**Docker Compose:**
Edit `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"
```

**Docker run:**
```bash
docker run -p 8080:3000 frontend-app
```

Then access at: `http://localhost:8080`

## Useful Commands

### View Logs
```bash
docker-compose logs -f
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

### Stop and Remove Containers
```bash
docker-compose down
```

### List Running Containers
```bash
docker ps
```

## Production Notes

- The application runs in production mode for optimal performance
- Static files are served efficiently
- The container uses a non-root user for security
- Health checks and resource limits can be added as needed

## Troubleshooting

### Container won't start
- Check if port 3000 is already in use: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)
- View container logs: `docker-compose logs`

### Build fails
- Clear Docker cache and rebuild: `docker-compose build --no-cache`
- Ensure you have enough disk space

### Can't connect to backend API
- Update the API URL in docker-compose.yml
- Ensure the backend is accessible from the Docker container
- Check firewall settings

## System Requirements

- **RAM:** Minimum 2GB recommended
- **Disk Space:** ~500MB for the image
- **OS:** Windows 10/11, macOS 10.15+, or Linux with Docker support

#!/usr/bin/env bash

# ==============================================================================
# Million Mint AI Terminal — VPS Deployment Automation Script
# Target OS: Ubuntu / Debian (GoDaddy Linux VPS)
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Million Mint AI Terminal VPS Deployment ===${NC}"

# 1. Update Packages & Dependencies
echo -e "${BLUE}[1/7] Updating system packages...${NC}"
sudo apt-get update && sudo apt-get upgrade -y

# Install git, curl, build-essential
sudo apt-get install -y git curl build-essential software-properties-common

# 2. Install Docker & Redis (If not already running via docker-compose)
if ! [ -x "$(command -v docker)" ]; then
    echo -e "${YELLOW}Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

if ! [ -x "$(command -v docker-compose)" ]; then
    echo -e "${YELLOW}docker-compose is not installed. Installing...${NC}"
    sudo apt-get install -y docker-compose
fi

# Start Redis via docker-compose
echo -e "${BLUE}[2/7] Starting Redis container...${NC}"
sudo docker-compose up -d

# 3. Install Python 3.11 & Backend Requirements
echo -e "${BLUE}[3/7] Setting up Python Environment for Backend & Worker...${NC}"
sudo apt-get install -y python3-pip python3-venv python3-dev

# Setup virtual environment for backend
if [ ! -d "backend/venv" ]; then
    python3 -m venv backend/venv
fi
backend/venv/bin/pip install --upgrade pip
backend/venv/bin/pip install -r backend/requirements.txt

# Setup virtual environment for worker
if [ ! -d "worker/venv" ]; then
    python3 -m venv worker/venv
fi
worker/venv/bin/pip install --upgrade pip
worker/venv/bin/pip install -r worker/requirements.txt

# 4. Install Node.js & PM2 (Process Manager)
echo -e "${BLUE}[4/7] Installing Node.js & PM2...${NC}"
if ! [ -x "$(command -v node)" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install pm2 globally
if ! [ -x "$(command -v pm2)" ]; then
    sudo npm install -g pm2
fi

# 5. Build Frontend
echo -e "${BLUE}[5/7] Building Frontend...${NC}"
cd frontend
if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}Created default frontend/.env.local. Please update it with correct server endpoints.${NC}"
fi
npm install
npm run build
cd ..

# 6. Configure Environment Variables (.env)
echo -e "${BLUE}[6/7] Checking environment configurations...${NC}"
for dir in backend worker; do
    if [ ! -f "$dir/.env" ] && [ -f "$dir/.env.example" ]; then
        cp "$dir/.env.example" "$dir/.env"
        echo -e "${YELLOW}Created default $dir/.env. Please configure API keys/secrets before starting.${NC}"
    fi
done

# 7. Start Services via PM2
echo -e "${BLUE}[7/7] Starting Services with PM2...${NC}"

# Create PM2 ecosystem config
cat <<EOF > ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "mm-backend",
      script: "backend/venv/bin/uvicorn",
      args: "main:app --host 0.0.0.0 --port 8000",
      cwd: "./backend",
      interpreter: "none",
      env: {
        PYTHONPATH: "."
      }
    },
    {
      name: "mm-worker",
      script: "worker/venv/bin/python",
      args: "worker.py",
      cwd: "./worker",
      interpreter: "none"
    },
    {
      name: "mm-frontend",
      script: "npm",
      args: "run start",
      cwd: "./frontend"
    }
  ]
};
EOF

pm2 start ecosystem.config.js
pm2 save
sudo pm2 startup || true

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${GREEN}Services are managed by PM2. Use 'pm2 status' to verify.${NC}"
echo -e "${YELLOW}Important: Configure Nginx as a reverse proxy for ports 3000 (frontend) and 8000 (backend).${NC}"

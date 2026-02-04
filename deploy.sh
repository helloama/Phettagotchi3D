#!/bin/bash
# Phettagotchi3D Deployment Script for DigitalOcean

set -e

echo "========================================="
echo "  Phettagotchi3D Server Setup Script"
echo "========================================="

# Update system
echo "[1/8] Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install build essentials (needed for native modules)
echo "[3/8] Installing build tools..."
apt install -y build-essential git

# Install PM2 globally
echo "[4/8] Installing PM2..."
npm install -g pm2

# Install nginx
echo "[5/8] Installing nginx..."
apt install -y nginx

# Create app directory
echo "[6/8] Creating application directory..."
mkdir -p /var/www/phettagotchi
cd /var/www/phettagotchi

# Clone or pull the repository (we'll upload manually for now)
echo "[7/8] Ready for code upload..."

# Configure firewall
echo "[8/8] Configuring firewall..."
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 8001/tcp  # Game server 1
ufw allow 8002/tcp  # Game server 2
ufw allow 8003/tcp  # Game server 3
ufw allow 8004/tcp  # Game server 4
ufw --force enable

echo "========================================="
echo "  Base setup complete!"
echo "  Node.js version: $(node -v)"
echo "  npm version: $(npm -v)"
echo "========================================="

#!/bin/bash
# Deployment script for Notblox game servers
# Run this on the DigitalOcean server

set -e

echo "=== Notblox Server Deployment ==="

# Navigate to backend directory
cd /path/to/Notblox/back

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
npm install

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Restart all PM2 processes using ecosystem config
echo "Restarting PM2 processes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

echo "=== Deployment Complete ==="
echo ""
echo "Server status:"
pm2 status

echo ""
echo "To view logs:"
echo "  pm2 logs notblox-test     # Test server (8001)"
echo "  pm2 logs notblox-obby     # Obby/Parkour (8002)"
echo "  pm2 logs notblox-football # Football (8003)"
echo "  pm2 logs notblox-petsim   # Pet Simulator (8004)"

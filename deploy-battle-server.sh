#!/bin/bash

# Server deployment script for VRM Battle System
# Run this on your Ubuntu server after git pull

echo "⚔️  Deploying VRM Battle System..."
echo ""

# Step 1: Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Not in the Phettagotchi3D root directory"
  echo "   Please run this script from /var/www/phettagotchi"
  exit 1
fi

# Step 2: Create assets directory
echo "📁 Creating assets directory..."
mkdir -p front/public/assets/pets
echo "✅ Assets directory ready"
echo ""

# Step 3: Copy VRM models (if you have them on the server)
echo "🐾 VRM Models Setup:"
echo "   You need to copy 7 VRM files to: front/public/assets/pets/"
echo "   Required files:"
echo "     - alienfella_1.vrm"
echo "     - blufella_1.vrm"
echo "     - lovebug_1.vrm"
echo "     - meep_1.vrm"
echo "     - pizzalotl_1.vrm"
echo "     - redfox_1.vrm"
echo "     - sparky_1.vrm"
echo ""
echo "   Options to get VRM files:"
echo "     1. scp from local machine:"
echo "        scp *.vrm root@your-server:/var/www/phettagotchi/front/public/assets/pets/"
echo ""
echo "     2. Download from your 2D game server (if hosted):"
echo "        cd front/public/assets/pets"
echo "        wget https://yourdomain.com/vrm/alienfella_1.vrm"
echo "        # ... repeat for other files"
echo ""
echo "     3. Copy from another location on this server:"
echo "        cp /path/to/vrm/*.vrm front/public/assets/pets/"
echo ""

read -p "Have you copied the VRM files? (y/n): " vrm_ready
if [ "$vrm_ready" != "y" ]; then
  echo "⚠️  Please copy VRM files first, then run this script again"
  exit 0
fi

# Step 4: Build the backend
echo ""
echo "🔨 Building backend..."
cd back
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed! Check errors above"
  exit 1
fi
echo "✅ Backend build successful"
cd ..

# Step 5: Check PM2 status
echo ""
echo "📊 Checking PM2 status..."
pm2 list

# Step 6: Start battle server
echo ""
echo "🚀 Starting battle server..."
cd back
pm2 start ecosystem.config.cjs --only notblox-battle

if [ $? -eq 0 ]; then
  echo "✅ Battle server started on port 8005"
else
  echo "⚠️  Server may already be running. Restarting..."
  pm2 restart notblox-battle
fi

# Step 7: Save PM2 config
pm2 save

# Step 8: Show logs
echo ""
echo "📋 Showing battle server logs (Ctrl+C to exit)..."
sleep 2
pm2 logs notblox-battle --lines 20

echo ""
echo "🎮 Deployment complete!"
echo ""
echo "Test the battle system:"
echo "  1. Navigate to: https://3d.phetta.lol/play/battle"
echo "  2. Type in chat: /battle"
echo "  3. Type in chat: /attack"
echo "  4. Type in chat: /hp"
echo ""
echo "Useful commands:"
echo "  pm2 logs notblox-battle    - View live logs"
echo "  pm2 restart notblox-battle - Restart server"
echo "  pm2 stop notblox-battle    - Stop server"

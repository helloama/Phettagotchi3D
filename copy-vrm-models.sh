#!/bin/bash

# Script to copy VRM pet models from 2D Phettagotchi game to 3D game
# Run this after git pull to set up the battle system assets

echo "🐾 Copying VRM pet models for battle system..."

# Source directory (2D game VRM files)
SOURCE_DIR="$HOME/OneDrive/Documents/PhettaverseMint3d/pet/public/vrm"

# Destination directory (3D game assets)
DEST_DIR="$(dirname "$0")/front/public/assets/pets"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# List of VRM files needed for battle system
VRM_FILES=(
  "alienfella_1.vrm"
  "blufella_1.vrm"
  "lovebug_1.vrm"
  "meep_1.vrm"
  "pizzalotl_1.vrm"
  "redfox_1.vrm"
  "sparky_1.vrm"
)

# Copy each VRM file
COPIED=0
SKIPPED=0
MISSING=0

for vrm in "${VRM_FILES[@]}"; do
  if [ -f "$SOURCE_DIR/$vrm" ]; then
    cp "$SOURCE_DIR/$vrm" "$DEST_DIR/"
    if [ $? -eq 0 ]; then
      echo "✅ Copied: $vrm"
      ((COPIED++))
    else
      echo "❌ Failed to copy: $vrm"
      ((MISSING++))
    fi
  else
    echo "⚠️  Not found: $vrm (skipping)"
    ((MISSING++))
  fi
done

echo ""
echo "📊 Summary:"
echo "   ✅ Copied: $COPIED files"
echo "   ⚠️  Missing: $MISSING files"
echo ""

if [ $COPIED -gt 0 ]; then
  echo "🎮 VRM models ready! Total size:"
  du -sh "$DEST_DIR" 2>/dev/null || echo "   (size calculation unavailable)"
  echo ""
  echo "Next steps:"
  echo "  1. cd back && npm run build"
  echo "  2. pm2 start ecosystem.config.cjs --only notblox-battle"
  echo "  3. Navigate to https://3d.phetta.lol/play/battle"
else
  echo "⚠️  No VRM files were copied. Check the SOURCE_DIR path:"
  echo "   $SOURCE_DIR"
  echo ""
  echo "You may need to update the SOURCE_DIR variable in this script"
  echo "to match your system's path to the 2D game VRM files."
fi

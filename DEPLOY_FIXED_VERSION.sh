#!/bin/bash

echo "🚀 DEPLOYING FIXED VERSION - Dynamic Periods + No Demo Data"
echo "============================================================"

cd /var/www/western-anatolia/expo

echo ""
echo "📦 Step 1: Building Expo web..."
npx expo export --platform web

if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed! dist/index.html not found"
    exit 1
fi

echo ""
echo "✅ Build successful!"

echo ""
echo "📋 Step 2: Copying dist to web root..."
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/

echo ""
echo "🔄 Step 3: Restarting PM2 process..."
pm2 restart western-anatolia

echo ""
echo "⏳ Waiting for server to start..."
sleep 3

echo ""
echo "📊 Step 4: Checking PM2 status..."
pm2 list

echo ""
echo "📝 Step 5: Checking recent logs..."
pm2 logs western-anatolia --lines 20 --nostream

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Site: https://anatoliarchieve.info"
echo "🔄 Press Ctrl+Shift+R in browser to clear cache!"

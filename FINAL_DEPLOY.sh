#!/bin/bash

echo "🚀 FINAL DEPLOYMENT - Dynamic Periods + Clean Database"
echo "========================================================"

cd /var/www/western-anatolia/expo

echo ""
echo "🧹 Step 1: Cleaning old build..."
rm -rf dist .expo/web

echo ""
echo "📦 Step 2: Building Expo web..."
npx expo export --platform web 2>&1 | tee /tmp/build.log

if [ ! -f "dist/index.html" ]; then
    echo ""
    echo "❌ BUILD FAILED!"
    echo "Last 30 lines of build log:"
    tail -30 /tmp/build.log
    exit 1
fi

echo ""
echo "✅ Build successful!"

echo ""
echo "📋 Step 3: Copying dist to web root..."
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/
chmod -R 755 /var/www/western-anatolia/dist

echo ""
echo "🔄 Step 4: Restarting PM2 western-anatolia process..."
pm2 restart western-anatolia

echo ""
echo "⏳ Waiting 3 seconds for server to start..."
sleep 3

echo ""
echo "📊 Step 5: PM2 Status..."
pm2 list

echo ""
echo "📝 Step 6: Checking logs for errors..."
pm2 logs western-anatolia --lines 15 --nostream

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Site URL: https://anatoliarchieve.info"
echo "🔄 IMPORTANT: Press Ctrl+Shift+R in your browser to clear cache!"

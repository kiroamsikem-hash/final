#!/bin/bash

# VPS Deployment Commands for Anatolia Timeline
# Run these commands on VPS (31.42.127.82) as root

echo "📦 Step 1: Navigate to expo directory"
cd /var/www/western-anatolia/expo

echo "🔍 Step 2: Check current files"
ls -la components/InspectorPanel.tsx
ls -la types/index.ts
ls -la context/TimelineContext.tsx

echo "🏗️ Step 3: Build the app"
npx expo export --platform web

echo "🗑️ Step 4: Remove old dist"
rm -rf /var/www/western-anatolia/dist

echo "📋 Step 5: Copy new dist"
cp -r dist /var/www/western-anatolia/

echo "🔄 Step 6: Restart PM2"
pm2 restart western-anatolia

echo "📊 Step 7: Check PM2 status"
pm2 status

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🌐 Test at: https://anatoliarchieve.info"
echo "🔑 Login: admin / melih.Berat2009"
echo "⚠️  Remember to press Ctrl+Shift+R in browser to clear cache!"
echo ""
echo "📝 Check logs if needed:"
echo "   pm2 logs western-anatolia --lines 50"

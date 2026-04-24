#!/bin/bash

echo "🔧 Fixing Real-Time Synchronization..."

cd /var/www/western-anatolia/expo

# Install socket.io-client
echo "📦 Installing socket.io-client..."
npm install --legacy-peer-deps socket.io-client

# Rebuild the frontend
echo "🏗️ Building frontend..."
npx expo export:web --output-dir dist

# Restart PM2 processes
echo "🔄 Restarting services..."
pm2 restart western-anatolia

echo "✅ Done! Real-time sync should now work."
echo ""
echo "📋 To verify:"
echo "1. Open https://anatoliarchieve.info in two browsers"
echo "2. Add a civilization in one browser"
echo "3. It should appear instantly in the other browser"
echo ""
echo "📊 Check logs with: pm2 logs timeline-api --lines 50"

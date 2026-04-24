#!/bin/bash

echo "🔍 Checking timeline-api error..."
echo ""

# Check PM2 logs
echo "📝 PM2 Error Logs:"
pm2 logs timeline-api --err --lines 50 --nostream

echo ""
echo "📝 PM2 Out Logs:"
pm2 logs timeline-api --out --lines 30 --nostream

echo ""
echo "📊 PM2 Describe:"
pm2 describe timeline-api

echo ""
echo "📁 API Server File:"
ls -la /var/www/western-anatolia/api-server.js

echo ""
echo "🔍 Check if file exists and has content:"
head -20 /var/www/western-anatolia/api-server.js

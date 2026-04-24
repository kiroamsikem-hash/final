#!/bin/bash

# Deploy fixed version to VPS
echo "🚀 Deploying to VPS..."

# Remove old dist
rm -rf /var/www/western-anatolia/dist

# Copy new dist
cp -r dist /var/www/western-anatolia/

# Restart PM2
pm2 restart western-anatolia

echo "✅ Deployment complete!"
echo "🌐 Test at: https://anatoliarchieve.info"
echo "🔄 Press Ctrl+Shift+R in browser to clear cache"

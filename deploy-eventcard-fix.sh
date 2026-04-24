#!/bin/bash

echo "🔧 Deploying EventCard fix to VPS..."

# VPS'te rebuild ve deploy
ssh root@31.42.127.82 << 'ENDSSH'

cd /var/www/western-anatolia/expo

# Rebuild
npx expo export --platform web

# Deploy
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/

# Restart
pm2 restart western-anatolia

echo ""
echo "✅ EventCard güncellendi!"
echo "Şimdi browser'da:"
echo "1. Hard refresh: Ctrl+Shift+R"
echo "2. Event title'lar artık daha büyük ve görünür!"

ENDSSH

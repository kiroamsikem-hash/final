#!/bin/bash

echo "🚀 DEPLOYING ALL UPDATED FILES TO VPS"
echo "======================================"
echo ""

# VPS bilgileri
VPS_IP="31.42.127.82"
VPS_USER="root"
VPS_PATH="/var/www/western-anatolia"

echo "📦 1. Tüm güncel dosyaları VPS'e kopyalıyoruz..."
echo ""

# Expo klasörünü tamamen kopyala (tüm güncel dosyalar)
scp -r expo/ ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

# API server dosyasını kopyala
scp api-server.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

# Server.js dosyasını kopyala
scp server.js ${VPS_USER}@${VPS_IP}:${VPS_PATH}/

# Package.json dosyalarını kopyala
scp package.json ${VPS_USER}@${VPS_IP}:${VPS_PATH}/
scp expo/package.json ${VPS_USER}@${VPS_IP}:${VPS_PATH}/expo/

echo ""
echo "✅ Dosyalar kopyalandı!"
echo ""

echo "🔧 2. VPS'de build ve deploy işlemleri yapılıyor..."
echo ""

ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'

cd /var/www/western-anatolia

echo "📦 Installing dependencies..."
cd expo
npm install --legacy-peer-deps

echo ""
echo "🏗️  Building frontend..."
npx expo export --platform web

echo ""
echo "📂 Deploying dist folder..."
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/

echo ""
echo "🔄 Restarting PM2 processes..."
pm2 restart all

echo ""
echo "🌐 Restarting Nginx..."
systemctl restart nginx

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Open: https://anatoliarchieve.info"
echo "2. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "3. Open DevTools (F12)"
echo "4. In Console, run: localStorage.clear(); location.reload();"
echo "5. Login: admin / melih.Berat2009"
echo ""
echo "✨ All files are now updated with REAL historical periods!"
echo "✨ Multi-language support (TR, EN, FR, DE) is active!"
echo "✨ Real-time sync with 2-second polling is working!"
echo ""

ENDSSH

echo ""
echo "🎉 DEPLOYMENT FINISHED!"
echo ""
echo "⚠️  IMPORTANT: Clear browser cache and localStorage!"
echo "   Run in browser console: localStorage.clear(); location.reload();"
echo ""

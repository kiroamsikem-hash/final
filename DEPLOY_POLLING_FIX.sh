#!/bin/bash

echo "========================================="
echo "🚀 POLLING FIX DEPLOYMENT"
echo "========================================="
echo ""
echo "Bu script şunları yapacak:"
echo "1. Git commit ve push"
echo "2. VPS'e bağlan ve pull"
echo "3. Frontend build"
echo "4. Dist deploy"
echo "5. PM2 restart"
echo ""
echo "========================================="
echo ""

# 1. Local commit and push
echo "📝 1. Git commit ve push..."
git add expo/context/TimelineContext.tsx
git commit -m "Fix: Prevent polling from deleting user data during save operations

- Added isSaving flag to track when data is being saved
- Polling now skips updates when save is in progress
- Added 2-second timeout after save to ensure database sync completes
- This prevents photos/tags/notes from being deleted by polling
- Added console logs for debugging polling behavior"

git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Git push failed!"
    exit 1
fi

echo "✅ Git push successful!"
echo ""

# 2. SSH to VPS and deploy
echo "🔌 2. VPS'e bağlanıyor..."
ssh root@31.42.127.82 << 'ENDSSH'

echo "========================================="
echo "VPS DEPLOYMENT BAŞLADI"
echo "========================================="

cd /var/www/western-anatolia

# Pull latest changes
echo ""
echo "📥 3. Git pull..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

echo "✅ Git pull successful!"

# Build frontend
echo ""
echo "🔨 4. Frontend build..."
cd expo
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Deploy dist
echo ""
echo "📦 5. Dist deploy..."
cd ..
rm -rf dist
cp -r expo/dist ./dist

if [ $? -ne 0 ]; then
    echo "❌ Dist copy failed!"
    exit 1
fi

echo "✅ Dist deployed!"

# Fix permissions
echo ""
echo "🔐 6. Permissions fix..."
chmod -R 755 dist

# Restart PM2
echo ""
echo "🔄 7. PM2 restart..."
pm2 restart timeline-api

echo ""
echo "========================================="
echo "✅ DEPLOYMENT TAMAMLANDI!"
echo "========================================="
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "📝 API Logs (son 20 satır):"
pm2 logs timeline-api --lines 20 --nostream

echo ""
echo "========================================="
echo "🧪 TEST:"
echo "========================================="
echo "1. https://anatoliarchieve.info adresine git"
echo "2. Bir hücreye tıkla"
echo "3. Photos tab → Fotoğraf ekle"
echo "4. 10 saniye bekle (2 polling cycle)"
echo "5. Fotoğrafın hala orada olduğunu kontrol et"
echo ""
echo "Aynı testi Tags, Notes ve Events için de yap!"
echo "========================================="

ENDSSH

echo ""
echo "========================================="
echo "✅ TÜM İŞLEMLER TAMAMLANDI!"
echo "========================================="

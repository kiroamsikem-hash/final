#!/bin/bash

echo "🔧 GIT CONFLICT FIX"
echo "==================="
echo ""

cd /var/www/western-anatolia

# 1. Local değişiklikleri yedekle
echo "📦 1. Local değişiklikler yedekleniyor..."
git stash push -m "VPS local changes backup"

echo "✅ Local değişiklikler stash'lendi!"
echo ""

# 2. Untracked dosyaları temizle (api-server.js, package.json, package-lock.json)
echo "🧹 2. Untracked dosyalar temizleniyor..."
rm -f api-server.js package.json package-lock.json

echo "✅ Untracked dosyalar temizlendi!"
echo ""

# 3. GitHub'dan çek
echo "📥 3. GitHub'dan çekiliyor..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull başarısız!"
    exit 1
fi

echo "✅ GitHub'dan çekildi!"
echo ""

# 4. Frontend build
echo "🔨 4. Frontend build ediliyor..."
cd /var/www/western-anatolia/expo
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

echo "✅ Build tamamlandı!"
echo ""

# 5. Dist deploy
echo "📂 5. Dist deploy ediliyor..."
rm -rf /var/www/western-anatolia/dist
cp -r /var/www/western-anatolia/expo/dist /var/www/western-anatolia/

echo "✅ Dist deploy edildi!"
echo ""

# 6. PM2 restart
echo "🔄 6. PM2 restart ediliyor..."
pm2 restart western-anatolia
pm2 restart timeline-api

echo "✅ PM2 restart edildi!"
echo ""

# 7. Nginx restart
echo "🌐 7. Nginx restart ediliyor..."
systemctl restart nginx

echo "✅ Nginx restart edildi!"
echo ""

# 8. Durum kontrolü
echo "📊 8. Durum kontrol ediliyor..."
pm2 list

echo ""
echo "================================"
echo "✅ DEPLOY TAMAMLANDI!"
echo "================================"
echo ""
echo "🔍 Test için:"
echo "1. Aç: https://anatoliarchieve.info"
echo "2. Hard refresh: Ctrl+Shift+R"
echo "3. Console: localStorage.clear(); location.reload();"
echo "4. Login: admin / melih.Berat2009"
echo ""
echo "📝 Logları görmek için:"
echo "   pm2 logs western-anatolia --lines 20"
echo "   pm2 logs timeline-api --lines 20"
echo ""
echo "💾 Stash'lenmiş değişiklikleri görmek için:"
echo "   git stash list"
echo "   git stash show"
echo ""

#!/bin/bash

echo "🚀 GITHUB'DAN ÇEK VE DEPLOY ET"
echo "================================"
echo ""

# 1. GitHub'dan çek
echo "📥 1. GitHub'dan çekiliyor..."
cd /var/www/western-anatolia
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull başarısız!"
    exit 1
fi

echo "✅ GitHub'dan çekildi!"
echo ""

# 2. Dependencies kontrol (opsiyonel - sadece gerekirse)
echo "📦 2. Dependencies kontrol ediliyor..."
cd /var/www/western-anatolia/expo
# npm install --legacy-peer-deps  # Sadece gerekirse aç

echo "✅ Dependencies hazır!"
echo ""

# 3. Frontend build
echo "🔨 3. Frontend build ediliyor..."
cd /var/www/western-anatolia/expo
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

echo "✅ Build tamamlandı!"
echo ""

# 4. Dist deploy
echo "📂 4. Dist deploy ediliyor..."
rm -rf /var/www/western-anatolia/dist
cp -r /var/www/western-anatolia/expo/dist /var/www/western-anatolia/

echo "✅ Dist deploy edildi!"
echo ""

# 5. PM2 restart
echo "🔄 5. PM2 restart ediliyor..."
pm2 restart western-anatolia
pm2 restart timeline-api

echo "✅ PM2 restart edildi!"
echo ""

# 6. Nginx restart (opsiyonel)
echo "🌐 6. Nginx restart ediliyor..."
systemctl restart nginx

echo "✅ Nginx restart edildi!"
echo ""

# 7. Durum kontrolü
echo "📊 7. Durum kontrol ediliyor..."
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

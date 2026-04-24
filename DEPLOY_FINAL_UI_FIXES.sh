#!/bin/bash

echo "🎨 FINAL UI FIXES DEPLOYMENT"
echo "============================"
echo ""

# 1. GitHub'dan çek
echo "📥 1. GitHub'dan çekiliyor..."
cd /var/www/western-anatolia
git pull origin main

# 2. Database'e display_order column ekle
echo "🗄️  2. Database güncelleniyor..."
mysql -u timeline_user -pTimeline2024\!Strong timeline_db < ADD_DISPLAY_ORDER.sql

if [ $? -eq 0 ]; then
    echo "✅ Database güncellendi!"
else
    echo "⚠️  Database güncellenemedi (belki zaten var)"
fi

# 3. API restart
echo "🔄 3. API restart ediliyor..."
pm2 restart timeline-api

# 4. Frontend build
echo "🔨 4. Frontend build ediliyor..."
cd /var/www/western-anatolia/expo
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

# 5. Dist deploy
echo "📂 5. Dist deploy ediliyor..."
rm -rf /var/www/western-anatolia/dist
cp -r /var/www/western-anatolia/expo/dist /var/www/western-anatolia/

# 6. Frontend restart
echo "🔄 6. Frontend restart ediliyor..."
pm2 restart western-anatolia

# 7. Nginx restart
echo "🌐 7. Nginx restart ediliyor..."
systemctl restart nginx

# 8. Durum
echo "📊 8. Durum:"
pm2 list

echo ""
echo "============================"
echo "✅ DEPLOYMENT TAMAMLANDI!"
echo "============================"
echo ""
echo "🎉 Yeni Özellikler:"
echo "  ✅ Event renk paleti (tek seçici)"
echo "  ✅ Historical period (database'den dinamik)"
echo "  ✅ Civilization yer değiştirme (display_order)"
echo "  ✅ Event title görünürlüğü"
echo ""
echo "🔍 Test için:"
echo "1. Aç: https://anatoliarchieve.info"
echo "2. Hard refresh: Ctrl+Shift+R"
echo "3. Console: localStorage.clear(); location.reload();"
echo "4. Login: admin / melih.Berat2009"
echo ""
echo "📝 Test adımları:"
echo "  - Event ekle → Renk seç (tek palet)"
echo "  - Period dropdown → Sadece senin eklediğin periodlar"
echo "  - Civilization → Yukarı/aşağı ok ile sırala"
echo "  - Event title → Görünüyor mu kontrol et"
echo ""

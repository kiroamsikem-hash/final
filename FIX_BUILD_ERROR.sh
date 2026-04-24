#!/bin/bash

echo "🔧 BUILD ERROR FIX"
echo "=================="
echo ""

cd /var/www/western-anatolia/expo

# 1. Zod'u yükle
echo "📦 1. Zod dependency yükleniyor..."
npm install zod@latest --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Zod yüklenemedi!"
    exit 1
fi

echo "✅ Zod yüklendi!"
echo ""

# 2. Frontend build
echo "🔨 2. Frontend build ediliyor..."
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

echo "✅ Build tamamlandı!"
echo ""

# 3. Dist'i doğru yere kopyala
echo "📂 3. Dist kopyalanıyor..."
rm -rf /var/www/western-anatolia/dist
cp -r /var/www/western-anatolia/expo/dist /var/www/western-anatolia/

# Dist içeriğini kontrol et
if [ -f /var/www/western-anatolia/dist/index.html ]; then
    echo "✅ index.html bulundu!"
else
    echo "❌ index.html bulunamadı!"
    exit 1
fi

echo "✅ Dist kopyalandı!"
echo ""

# 4. Database şifresini düzelt
echo "🔐 4. Database şifresi düzeltiliyor..."
mysql -u timeline_user -pTimeline2024\!Strong timeline_db << 'EOF'
-- Admin şifresini güncelle (plain text)
UPDATE users SET password = 'melih.Berat2009' WHERE username = 'admin';

-- Demo kullanıcısını sil
DELETE FROM users WHERE username = 'demo';

-- Kontrol et
SELECT username, password FROM users;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database güncellendi!"
else
    echo "⚠️  Database güncellenemedi, manuel kontrol gerekli"
fi

echo ""

# 5. PM2'yi başlat
echo "🚀 5. PM2 başlatılıyor..."
pm2 start all

echo "✅ PM2 başlatıldı!"
echo ""

# 6. Nginx restart
echo "🌐 6. Nginx restart ediliyor..."
systemctl restart nginx

echo "✅ Nginx restart edildi!"
echo ""

# 7. Durum kontrolü
echo "📊 7. Durum kontrol ediliyor..."
pm2 list

echo ""
echo "================================"
echo "✅ BUILD FIX TAMAMLANDI!"
echo "================================"
echo ""
echo "🔍 Test için:"
echo "1. Aç: https://anatoliarchieve.info"
echo "2. Hard refresh: Ctrl+Shift+R"
echo "3. Console: localStorage.clear(); location.reload();"
echo "4. Login: admin / melih.Berat2009"
echo ""
echo "📝 Logları kontrol et:"
echo "   pm2 logs western-anatolia --lines 20"
echo "   pm2 logs timeline-api --lines 20"
echo ""
echo "🔍 API test et:"
echo "   curl http://localhost:8084/api/mysql -X POST -H \"Content-Type: application/json\" -d '{\"action\":\"getCivilizations\"}'"
echo ""

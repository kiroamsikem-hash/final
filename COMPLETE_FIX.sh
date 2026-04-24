#!/bin/bash

echo "🔧 COMPLETE FIX - API + PASSWORD"
echo "================================="
echo ""

# 1. PM2 durumunu kontrol et
echo "📊 1. PM2 durumu kontrol ediliyor..."
pm2 list

echo ""

# 2. API server'ı kontrol et ve başlat
echo "🔍 2. API server kontrol ediliyor..."

# timeline-api process'ini sil
pm2 delete timeline-api 2>/dev/null || true

# api-server.js'i başlat
cd /var/www/western-anatolia
pm2 start api-server.js --name timeline-api

echo "✅ API server başlatıldı!"
echo ""

# 3. Database şifresini manuel olarak düzelt
echo "🔐 3. Database şifresi düzeltiliyor..."

# Önce mevcut kullanıcıları göster
echo "📋 Mevcut kullanıcılar:"
mysql -u timeline_user -pTimeline2024\!Strong timeline_db -e "SELECT id, username, password FROM users;"

echo ""
echo "🔄 Admin şifresi güncelleniyor..."

# Admin şifresini güncelle
mysql -u timeline_user -pTimeline2024\!Strong timeline_db << 'EOF'
-- Önce admin kullanıcısını sil
DELETE FROM users WHERE username = 'admin';

-- Yeni admin kullanıcısı ekle (plain text password)
INSERT INTO users (username, password) VALUES ('admin', 'melih.Berat2009');

-- Demo kullanıcısını sil
DELETE FROM users WHERE username = 'demo';

-- Kontrol et
SELECT id, username, password FROM users;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database güncellendi!"
else
    echo "❌ Database güncellenemedi!"
    exit 1
fi

echo ""

# 4. API'yi test et
echo "🧪 4. API test ediliyor..."
sleep 2

curl -s http://localhost:8084/api/mysql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"getCivilizations"}' | head -c 200

echo ""
echo ""

# 5. Login test et
echo "🔑 5. Login test ediliyor..."
curl -s http://localhost:8084/api/mysql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"action":"login","data":{"username":"admin","password":"melih.Berat2009"}}'

echo ""
echo ""

# 6. PM2 durumunu göster
echo "📊 6. Final PM2 durumu:"
pm2 list

echo ""

# 7. PM2 loglarını göster
echo "📝 7. API logları (son 10 satır):"
pm2 logs timeline-api --lines 10 --nostream

echo ""
echo "================================"
echo "✅ COMPLETE FIX TAMAMLANDI!"
echo "================================"
echo ""
echo "🔍 Test için:"
echo "1. Aç: https://anatoliarchieve.info"
echo "2. Hard refresh: Ctrl+Shift+R"
echo "3. Console: localStorage.clear(); location.reload();"
echo "4. Login: admin / melih.Berat2009"
echo ""
echo "📝 Eğer hala sorun varsa:"
echo "   pm2 logs timeline-api --lines 50"
echo "   pm2 logs western-anatolia --lines 50"
echo ""
echo "🔍 Database'i manuel kontrol et:"
echo "   mysql -u timeline_user -pTimeline2024\!Strong timeline_db -e \"SELECT * FROM users;\""
echo ""

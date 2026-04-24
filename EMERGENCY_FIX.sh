#!/bin/bash

echo "🚨 EMERGENCY FIX"
echo "================"
echo ""

# 1. PM2'yi durdur
echo "⏸️  1. PM2 processlerini durduruyor..."
pm2 stop all

echo "✅ PM2 durduruldu!"
echo ""

# 2. Dist klasörünü temizle
echo "🧹 2. Eski dist temizleniyor..."
rm -rf /var/www/western-anatolia/dist
rm -rf /var/www/western-anatolia/expo/dist

echo "✅ Eski dist temizlendi!"
echo ""

# 3. Node modules temizle ve yeniden yükle
echo "📦 3. Node modules yeniden yükleniyor..."
cd /var/www/western-anatolia/expo
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ npm install başarısız!"
    exit 1
fi

echo "✅ Node modules yüklendi!"
echo ""

# 4. .env dosyasını kontrol et
echo "🔍 4. .env dosyası kontrol ediliyor..."
cd /var/www/western-anatolia/expo

if [ ! -f .env ]; then
    echo "⚠️  .env dosyası yok, oluşturuluyor..."
    cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=timeline_user
DB_PASSWORD=Timeline2024!Strong
DB_NAME=timeline_db
EOF
    echo "✅ .env dosyası oluşturuldu!"
else
    echo "✅ .env dosyası mevcut!"
fi

echo ""

# 5. Frontend build
echo "🔨 5. Frontend build ediliyor..."
cd /var/www/western-anatolia/expo
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

echo "✅ Build tamamlandı!"
echo ""

# 6. Dist'i doğru yere kopyala
echo "📂 6. Dist kopyalanıyor..."
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

# 7. Database şifresini düzelt
echo "🔐 7. Database şifresi düzeltiliyor..."
mysql -u timeline_user -pTimeline2024\!Strong timeline_db << 'EOF'
-- Admin şifresini güncelle (plain text)
UPDATE users SET password = 'melih.Berat2009' WHERE username = 'admin';

-- Kontrol et
SELECT username, password FROM users WHERE username = 'admin';
EOF

if [ $? -eq 0 ]; then
    echo "✅ Şifre güncellendi!"
else
    echo "⚠️  Şifre güncellenemedi, manuel kontrol gerekli"
fi

echo ""

# 8. PM2'yi başlat
echo "🚀 8. PM2 başlatılıyor..."
pm2 start all

echo "✅ PM2 başlatıldı!"
echo ""

# 9. Nginx restart
echo "🌐 9. Nginx restart ediliyor..."
systemctl restart nginx

echo "✅ Nginx restart edildi!"
echo ""

# 10. Durum kontrolü
echo "📊 10. Durum kontrol ediliyor..."
pm2 list

echo ""
echo "================================"
echo "✅ EMERGENCY FIX TAMAMLANDI!"
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
echo "🔍 Dist kontrolü:"
echo "   ls -la /var/www/western-anatolia/dist/"
echo ""
echo "🔍 Database kontrolü:"
echo "   mysql -u timeline_user -pTimeline2024\!Strong timeline_db -e \"SELECT username, password FROM users;\""
echo ""

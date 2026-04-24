#!/bin/bash

echo "🚨 FINAL COMPLETE FIX - HER ŞEYİ DÜZELT"
echo "========================================"
echo ""

# 1. PM2'yi durdur
echo "⏸️  1. PM2 durduriliyor..."
pm2 stop all
pm2 delete all

# 2. Eski dosyaları temizle
echo "🧹 2. Eski dosyalar temizleniyor..."
cd /var/www/western-anatolia
rm -rf expo/node_modules
rm -rf expo/dist
rm -rf dist

# 3. GitHub'dan temiz çek
echo "📥 3. GitHub'dan temiz çekiliyor..."
git fetch origin
git reset --hard origin/main
git clean -fd

# 4. Node modules yükle
echo "📦 4. Node modules yükleniyor..."
cd /var/www/western-anatolia/expo
npm install --legacy-peer-deps

# 5. Zod'u ekle
echo "📦 5. Zod yükleniyor..."
npm install zod@latest --legacy-peer-deps

# 6. .env dosyasını kontrol et
echo "🔍 6. .env kontrol ediliyor..."
if [ ! -f .env ]; then
    cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=timeline_user
DB_PASSWORD=Timeline2024!Strong
DB_NAME=timeline_db
EOF
fi

# 7. Database'i temizle ve yeniden oluştur
echo "🗄️  7. Database temizleniyor..."
mysql -u timeline_user -pTimeline2024\!Strong timeline_db << 'EOF'
-- Tabloları sil
DROP TABLE IF EXISTS cell_data;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS civilizations;
DROP TABLE IF EXISTS users;

-- Yeniden oluştur
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE civilizations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  start_year INT,
  end_year INT,
  description TEXT,
  color VARCHAR(7),
  tags JSON,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_year INT,
  end_year INT,
  period VARCHAR(50),
  civilization_id VARCHAR(50),
  tags JSON,
  photo_url VARCHAR(500),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
);

CREATE TABLE cell_data (
  id VARCHAR(100) PRIMARY KEY,
  year INT NOT NULL,
  civilization_id VARCHAR(50) NOT NULL,
  photos JSON,
  tags JSON,
  notes TEXT,
  name VARCHAR(100),
  related_cells JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
);

-- Admin kullanıcısı ekle
INSERT INTO users (username, password) VALUES ('admin', 'melih.Berat2009');

-- Kontrol et
SELECT * FROM users;
EOF

echo "✅ Database temizlendi ve yeniden oluşturuldu!"
echo ""

# 8. Frontend build
echo "🔨 8. Frontend build ediliyor..."
cd /var/www/western-anatolia/expo
npx expo export --platform web

if [ $? -ne 0 ]; then
    echo "❌ Build başarısız!"
    exit 1
fi

# 9. Dist'i kopyala
echo "📂 9. Dist kopyalanıyor..."
cp -r /var/www/western-anatolia/expo/dist /var/www/western-anatolia/

# 10. PM2'yi başlat
echo "🚀 10. PM2 başlatılıyor..."
cd /var/www/western-anatolia

# API server'ı başlat
pm2 start api-server.js --name timeline-api

# Frontend server'ı başlat
pm2 start expo/server.js --name western-anatolia --cwd /var/www/western-anatolia

# PM2'yi kaydet
pm2 save

echo "✅ PM2 başlatıldı!"
echo ""

# 11. Nginx restart
echo "🌐 11. Nginx restart ediliyor..."
systemctl restart nginx

# 12. Test et
echo "🧪 12. Test ediliyor..."
sleep 3

echo ""
echo "📊 PM2 Durumu:"
pm2 list

echo ""
echo "🔍 API Test:"
curl -s http://localhost:8084/api/mysql -X POST -H "Content-Type: application/json" -d '{"action":"getCivilizations"}' | head -c 100

echo ""
echo ""
echo "🔑 Login Test:"
curl -s http://localhost:8084/api/mysql -X POST -H "Content-Type: application/json" -d '{"action":"login","data":{"username":"admin","password":"melih.Berat2009"}}'

echo ""
echo ""
echo "========================================"
echo "✅ FINAL FIX TAMAMLANDI!"
echo "========================================"
echo ""
echo "🔍 Test için:"
echo "1. Aç: https://anatoliarchieve.info"
echo "2. Hard refresh: Ctrl+Shift+R"
echo "3. Console: localStorage.clear(); location.reload();"
echo "4. Login: admin / melih.Berat2009"
echo ""
echo "📝 Loglar:"
echo "   pm2 logs timeline-api --lines 20"
echo "   pm2 logs western-anatolia --lines 20"
echo ""

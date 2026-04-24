# VPS Deployment Instructions

## Sorun
- Database'de bozuk JSON veriler var
- API 500 hatası veriyor
- Real-time sync çalışmıyor

## Çözüm
Aşağıdaki adımları takip et:

### 1. VPS'e Bağlan
```bash
ssh root@31.42.127.82
```

### 2. Proje Dizinine Git
```bash
cd /var/www/western-anatolia
```

### 3. Güncellenmiş Dosyaları Kopyala

#### a) API MySQL Handler'ı Güncelle
```bash
cat > expo/api/mysql.js << 'EOFAPI'
# (Dosya içeriği aşağıda)
EOFAPI
```

Dosya içeriği için `expo/api/mysql.js` dosyasını kullan (safe JSON parsing eklenmiş hali).

#### b) API Server'ı Güncelle
```bash
cat > api-server.js << 'EOFSERVER'
# (Dosya içeriği aşağıda)
EOFSERVER
```

Dosya içeriği için `api-server.js` dosyasını kullan (WebSocket desteği ile).

### 4. Cors Paketini Yükle
```bash
npm install cors --legacy-peer-deps
```

### 5. Database'i Temizle ve Yeniden Oluştur
```bash
mysql -u timeline_user -p'Timeline2024!Strong' timeline_db << 'EOFSQL'
-- Drop all tables
DROP TABLE IF EXISTS cell_data;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS civilizations;
DROP TABLE IF EXISTS users;

-- Recreate tables
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

-- Insert admin user
INSERT INTO users (username, password) VALUES ('admin', 'melih.Berat2009');

SELECT 'Database cleaned!' as status;
EOFSQL
```

### 6. PM2'yi Güncelle
```bash
# API server'ı yeniden başlat
pm2 restart timeline-api

# Veya eğer yoksa, oluştur:
pm2 delete timeline-api 2>/dev/null || true
pm2 start api-server.js --name timeline-api --env production
pm2 save
```

### 7. Frontend'i Rebuild Et
```bash
cd expo
npx expo export --platform web
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/
pm2 restart western-anatolia
```

### 8. Kontrol Et
```bash
# PM2 durumunu kontrol et
pm2 list

# API loglarını kontrol et
pm2 logs timeline-api --lines 20

# Database'i kontrol et
mysql -u timeline_user -p'Timeline2024!Strong' timeline_db -e "SELECT COUNT(*) FROM civilizations; SELECT COUNT(*) FROM events;"
```

## Test Adımları

### 1. Browser'da Test
1. Aç: https://anatoliarchieve.info
2. F12 bas (DevTools)
3. Console'da çalıştır:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. Login: `admin` / `melih.Berat2009`
5. Bir civilization ekle (örn: "Test Civilization")

### 2. İkinci Browser/Device'da Test
1. Başka bir browser veya cihazda aç: https://anatoliarchieve.info
2. F12 bas
3. Console'da çalıştır:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. Login: `admin` / `melih.Berat2009`
5. İlk browser'da eklediğin civilization'ı görmeli

### 3. Real-Time Sync Test
1. İki browser'ı yan yana aç
2. Birinde civilization ekle
3. Diğerinde **F5 basmadan** otomatik görünmeli
4. Console'da şunu görmeli: `📥 Data changed - reloading from database`

## Sorun Giderme

### API 500 Hatası Devam Ediyorsa
```bash
# API loglarını kontrol et
pm2 logs timeline-api --lines 50

# Database'de bozuk veri var mı kontrol et
mysql -u timeline_user -p'Timeline2024!Strong' timeline_db -e "SELECT id, tags FROM civilizations LIMIT 10;"
```

### WebSocket Bağlanmıyorsa
```bash
# Nginx config'i kontrol et
cat /etc/nginx/sites-available/anatoliarchieve | grep -A 10 "socket.io"

# Nginx'i restart et
systemctl restart nginx
```

### Frontend Güncellenmediyse
```bash
# Dist klasörünü kontrol et
ls -la /var/www/western-anatolia/dist/

# Nginx'in doğru klasörü serve ettiğini kontrol et
cat /etc/nginx/sites-available/anatoliarchieve | grep "root"
```

## Başarı Kriterleri
✅ PM2'de 3 process çalışıyor (western-anatolia, timeline-api, timeline)
✅ API 200 response veriyor
✅ Database boş (sadece admin user var)
✅ İki browser'da aynı veri görünüyor
✅ Bir browser'da değişiklik yapınca diğerinde otomatik güncelleniyor (F5 yok)
✅ Console'da WebSocket bağlantı mesajları var

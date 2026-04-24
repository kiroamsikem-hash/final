# 🚀 HIZLI ÇÖZÜM

## VPS'e SSH ile bağlan ve bu komutu çalıştır:

```bash
ssh root@31.42.127.82
```

Sonra aşağıdaki **TEK KOMUTU** kopyala-yapıştır:

```bash
cd /var/www/western-anatolia && \
npm install cors --legacy-peer-deps && \
mysql -u timeline_user -p'Timeline2024!Strong' timeline_db -e "DROP TABLE IF EXISTS cell_data; DROP TABLE IF EXISTS events; DROP TABLE IF EXISTS civilizations; DROP TABLE IF EXISTS users; CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP); CREATE TABLE civilizations (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100) NOT NULL, region VARCHAR(100), start_year INT, end_year INT, description TEXT, color VARCHAR(7), tags JSON, photo_url VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP); CREATE TABLE events (id VARCHAR(50) PRIMARY KEY, title VARCHAR(200) NOT NULL, description TEXT, start_year INT, end_year INT, period VARCHAR(50), civilization_id VARCHAR(50), tags JSON, photo_url VARCHAR(500), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE); CREATE TABLE cell_data (id VARCHAR(100) PRIMARY KEY, year INT NOT NULL, civilization_id VARCHAR(50) NOT NULL, photos JSON, tags JSON, notes TEXT, name VARCHAR(100), related_cells JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE); INSERT INTO users (username, password) VALUES ('admin', 'melih.Berat2009'); SELECT 'Database OK!' as status;" && \
pm2 restart timeline-api && \
cd expo && \
npx expo export --platform web && \
rm -rf /var/www/western-anatolia/dist && \
cp -r dist /var/www/western-anatolia/ && \
pm2 restart western-anatolia && \
echo "" && \
echo "✅ TAMAMLANDI!" && \
echo "" && \
pm2 list
```

## Sonra browser'da:

1. Aç: https://anatoliarchieve.info
2. F12 bas
3. Console'da çalıştır:
```javascript
localStorage.clear();
location.reload();
```
4. Login: `admin` / `melih.Berat2009`

## Test:
- Bir civilization ekle
- Başka bir browser'da aç - aynı veriyi görmeli
- Birinde değişiklik yap - diğerinde otomatik güncellenmeli (F5 yok!)

---

## ⚠️ ÖNEMLİ: API Dosyalarını Güncelle

Yukarıdaki komut database'i temizler ama API dosyalarını güncellemez. 
API dosyalarını güncellemek için:

### 1. expo/api/mysql.js dosyasını güncelle:

```bash
cat > /var/www/western-anatolia/expo/api/mysql.js << 'EOFMYSQL'
```

Sonra bu dosyanın içeriğini kopyala-yapıştır (local'deki `expo/api/mysql.js` - safe JSON parsing ile)

Bitir:
```bash
EOFMYSQL
```

### 2. api-server.js dosyasını güncelle:

```bash
cat > /var/www/western-anatolia/api-server.js << 'EOFSERVER'
```

Sonra bu dosyanın içeriğini kopyala-yapıştır (local'deki `api-server.js` - WebSocket ile)

Bitir:
```bash
EOFSERVER
```

### 3. PM2'yi restart et:
```bash
pm2 restart timeline-api
pm2 restart western-anatolia
```

---

## Sorun mu var?

### API 500 hatası:
```bash
pm2 logs timeline-api --lines 30
```

### WebSocket bağlanmıyor:
```bash
pm2 logs timeline-api | grep "Client connected"
```

### Frontend güncellenmiyor:
```bash
ls -la /var/www/western-anatolia/dist/
```

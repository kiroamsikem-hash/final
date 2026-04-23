# 🚀 Turso Database Kurulum Adımları

## ✅ Hazırlık Tamamlandı!

Tüm kod dosyaları hazır. Şimdi sadece Turso'yu kurman ve bağlaman gerekiyor.

---

## 📋 Adım Adım Kurulum

### 1️⃣ Turso CLI Kurulumu

**Windows PowerShell (Admin olarak çalıştır):**
```powershell
irm https://get.tur.so/install.ps1 | iex
```

**Veya npm ile:**
```bash
npm install -g @turso/cli
```

---

### 2️⃣ Turso'ya Giriş Yap

```bash
turso auth login
```
- Tarayıcı açılacak
- GitHub ile giriş yap
- Developer planı seç ($4.99/ay)

---

### 3️⃣ Database Oluştur

```bash
# Database oluştur
turso db create timeline-db

# Database listele (kontrol için)
turso db list
```

---

### 4️⃣ Database Schema'yı Yükle

```bash
# Database shell'e gir
turso db shell timeline-db
```

**Aşağıdaki SQL kodlarını kopyala ve yapıştır:**

```sql
-- Users tablosu
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Civilizations tablosu
CREATE TABLE civilizations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  start_year INTEGER,
  end_year INTEGER,
  description TEXT,
  color TEXT,
  tags TEXT,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Events tablosu
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  civilization_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  period TEXT,
  tags TEXT,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
);

-- Cell Data tablosu
CREATE TABLE cell_data (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  civilization_id TEXT NOT NULL,
  photos TEXT,
  tags TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE,
  UNIQUE(year, civilization_id, user_id)
);

-- Settings tablosu
CREATE TABLE user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  start_year INTEGER DEFAULT -500,
  end_year INTEGER DEFAULT -4000,
  year_step INTEGER DEFAULT 50,
  date_format TEXT DEFAULT 'BC',
  show_grid_lines INTEGER DEFAULT 1,
  show_year_labels INTEGER DEFAULT 1,
  show_photos INTEGER DEFAULT 1,
  show_tags INTEGER DEFAULT 1,
  show_empty_rows INTEGER DEFAULT 0,
  highlight_centuries INTEGER DEFAULT 1,
  highlight_decades INTEGER DEFAULT 0,
  cell_height INTEGER DEFAULT 60,
  cell_width INTEGER DEFAULT 160,
  compact_mode INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index'ler
CREATE INDEX idx_civilizations_user ON civilizations(user_id);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_civilization ON events(civilization_id);
CREATE INDEX idx_cell_data_user ON cell_data(user_id);
CREATE INDEX idx_cell_data_year_civ ON cell_data(year, civilization_id);
```

**Shell'den çık:**
```sql
.quit
```

---

### 5️⃣ Connection Bilgilerini Al

```bash
# Database URL'ini al
turso db show timeline-db --url

# Auth token oluştur
turso db tokens create timeline-db
```

**Çıktıyı kopyala! Örnek:**
```
URL: libsql://timeline-db-username.turso.io
Token: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

---

### 6️⃣ .env Dosyası Oluştur

```bash
cd expo
```

**expo/.env dosyası oluştur ve içine yapıştır:**
```bash
EXPO_PUBLIC_TURSO_URL=libsql://timeline-db-username.turso.io
EXPO_PUBLIC_TURSO_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

**ÖNEMLİ:** Gerçek URL ve Token'ı yapıştır!

---

### 7️⃣ Gerekli Paketleri Yükle

```bash
npm install @libsql/client bcryptjs
npm install --save-dev @types/bcryptjs
```

---

### 8️⃣ Development Server'ı Yeniden Başlat

```bash
# Mevcut server'ı durdur (Ctrl+C)
# Sonra yeniden başlat
npx expo start --web
```

---

## ✅ Test Et!

1. http://localhost:8081 aç
2. Login ekranında "Kayıt Ol" butonu göreceksin (yeni eklendi)
3. Yeni hesap oluştur veya demo hesap kullan
4. Artık veriler Turso database'de saklanıyor! 🎉

---

## 🔍 Verileri Kontrol Et

```bash
# Database shell'e gir
turso db shell timeline-db

# Kullanıcıları listele
SELECT * FROM users;

# Medeniyetleri listele
SELECT * FROM civilizations;

# Çık
.quit
```

---

## 💰 Maliyet Takibi

```bash
# Database kullanım istatistiklerini gör
turso db show timeline-db
```

**Developer Plan ($4.99/ay):**
- ✅ Unlimited databases
- ✅ 9GB storage
- ✅ 2.5 Billion row reads/ay

---

## 🆘 Sorun Giderme

### "turso: command not found"
```bash
# npm ile yükle
npm install -g @turso/cli

# Veya PowerShell'i yeniden başlat
```

### "Authentication failed"
```bash
# Yeniden login ol
turso auth logout
turso auth login
```

### ".env dosyası çalışmıyor"
- Dosya adının tam olarak `.env` olduğundan emin ol
- Server'ı yeniden başlat
- `console.log(process.env.EXPO_PUBLIC_TURSO_URL)` ile kontrol et

---

## 📞 Yardım

Sorun yaşarsan:
1. `turso db show timeline-db` ile database durumunu kontrol et
2. `.env` dosyasının doğru olduğundan emin ol
3. Server'ı yeniden başlat

Hazır mısın? Başlayalım! 🚀

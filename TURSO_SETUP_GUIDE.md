# 🚀 Turso Database Kurulum Rehberi ($4.99/ay Developer Plan)

## 📋 Plan Özellikleri
- ✅ **Unlimited databases**
- ✅ **500 databases** (+ $0.20/aktif DB)
- ✅ **9GB storage** (+ $0.75/GB)
- ✅ **2.5 Billion row reads** (+ $1/billion)
- ✅ Edge locations (dünya çapında hızlı)

---

## 🎯 Adım 1: Turso Hesabı ve Database Oluşturma

### 1.1 Hesap Oluştur
1. https://turso.tech adresine git
2. "Sign Up" tıkla
3. GitHub ile giriş yap (önerilen)
4. Developer planı seç ($4.99/ay)

### 1.2 CLI Kurulumu
```bash
# Windows PowerShell (Admin olarak çalıştır)
irm https://get.tur.so/install.ps1 | iex

# Veya npm ile
npm install -g @turso/cli
```

### 1.3 Login
```bash
turso auth login
```

### 1.4 Database Oluştur
```bash
# Database oluştur
turso db create timeline-db

# Database listele
turso db list

# Database bilgilerini gör
turso db show timeline-db
```

---

## 🗄️ Adım 2: Database Schema Oluşturma

### 2.1 Database Shell'e Gir
```bash
turso db shell timeline-db
```

### 2.2 Tabloları Oluştur
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
  tags TEXT, -- JSON array as string
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
  tags TEXT, -- JSON array as string
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
  photos TEXT, -- JSON array as string
  tags TEXT, -- JSON array as string
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

-- Index'ler (performans için)
CREATE INDEX idx_civilizations_user ON civilizations(user_id);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_civilization ON events(civilization_id);
CREATE INDEX idx_cell_data_user ON cell_data(user_id);
CREATE INDEX idx_cell_data_year_civ ON cell_data(year, civilization_id);
```

### 2.3 Shell'den Çık
```sql
.quit
```

---

## 🔑 Adım 3: Connection Bilgilerini Al

```bash
# Database URL'ini al
turso db show timeline-db --url

# Auth token oluştur
turso db tokens create timeline-db
```

**Çıktı örneği:**
```
URL: libsql://timeline-db-[username].turso.io
Token: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

---

## 📦 Adım 4: React Native Entegrasyonu

### 4.1 Paketleri Yükle
```bash
cd expo
npm install @libsql/client bcryptjs
npm install --save-dev @types/bcryptjs
```

### 4.2 Environment Variables Oluştur
```bash
# expo/.env dosyası oluştur
EXPO_PUBLIC_TURSO_URL=libsql://timeline-db-[username].turso.io
EXPO_PUBLIC_TURSO_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

### 4.3 .gitignore'a Ekle
```bash
# .env dosyasını git'e ekleme
echo ".env" >> .gitignore
```

---

## ✅ Kurulum Tamamlandı!

Şimdi kod entegrasyonuna geçebiliriz. Devam edelim mi? 🚀

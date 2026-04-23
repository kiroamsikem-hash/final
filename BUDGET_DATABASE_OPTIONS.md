# 💰 Uygun Fiyatlı Database Seçenekleri

## 🎯 Seçilen Plan: Turso Developer ($4.99/ay)

### ✅ **Turso Developer Plan Özellikleri:**
- 💰 **$4.99/ay** - Çok uygun fiyat
- 🗄️ **9GB Storage** + $0.75/GB ek
- 🚀 **Unlimited Databases** 
- 📊 **500 Databases** + $0.20/aktif DB
- 🔄 **2.5 Billion Row Reads** + $1/billion ek
- 🌍 **Edge Locations** (dünya çapında hızlı)
- 🔒 **SQLite** tabanlı (güvenilir)
- 📱 **TypeScript/React Native** desteği

---

## � Turso Kurulum Rehberi

### 1. **Hesap Oluştur ve Plan Satın Al**
1. https://turso.tech adresine git
2. Hesap oluştur
3. "Get Developer" butonuna tıkla ($4.99/ay)
4. Ödeme bilgilerini gir

### 2. **CLI Kurulumu**
```bash
# Windows için
curl -sSfL https://get.tur.so/install.sh | bash

# veya npm ile (önerilen)
npm install -g @turso/cli
```

### 3. **Login ve Database Oluştur**
```bash
# Login
turso auth login

# Database oluştur
turso db create timeline-production

# Schema dosyası oluştur
turso db shell timeline-production
```

### 4. **Database Schema**
```sql
-- Users tablosu
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Civilizations tablosu
CREATE TABLE civilizations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    region TEXT,
    start_year INTEGER,
    end_year INTEGER,
    description TEXT,
    color TEXT,
    tags TEXT, -- JSON array as string
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Events tablosu
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    civilization_id TEXT NOT NULL REFERENCES civilizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_year INTEGER NOT NULL,
    end_year INTEGER NOT NULL,
    period TEXT,
    tags TEXT, -- JSON array as string
    photo_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cell Data tablosu (hücre verileri)
CREATE TABLE cell_data (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    civilization_id TEXT NOT NULL REFERENCES civilizations(id) ON DELETE CASCADE,
    photos TEXT, -- JSON array as string
    tags TEXT, -- JSON array as string
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, year, civilization_id)
);

-- User Settings tablosu
CREATE TABLE user_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_year INTEGER DEFAULT -4000,
    end_year INTEGER DEFAULT -500,
    year_step INTEGER DEFAULT 50,
    date_format TEXT DEFAULT 'BC',
    show_grid_lines BOOLEAN DEFAULT true,
    show_year_labels BOOLEAN DEFAULT true,
    show_photos BOOLEAN DEFAULT true,
    show_tags BOOLEAN DEFAULT true,
    highlight_centuries BOOLEAN DEFAULT true,
    cell_height INTEGER DEFAULT 60,
    cell_width INTEGER DEFAULT 160,
    compact_mode BOOLEAN DEFAULT false,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX idx_civilizations_user_id ON civilizations(user_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_civilization_id ON events(civilization_id);
CREATE INDEX idx_events_year_range ON events(start_year, end_year);
CREATE INDEX idx_cell_data_user_year ON cell_data(user_id, year);
CREATE INDEX idx_cell_data_civilization ON cell_data(civilization_id);
```

### 5. **Connection Bilgileri Al**
```bash
# Database URL'i al
turso db show timeline-production --url

# Auth token oluştur
turso db tokens create timeline-production
```

---

## 📱 React Native Entegrasyonu

### 1. **Paket Kurulumu**
```bash
cd expo
npm install @libsql/client bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. **Environment Variables**
```bash
# .env dosyası oluştur
EXPO_PUBLIC_TURSO_URL=libsql://timeline-production-[username].turso.io
EXPO_PUBLIC_TURSO_TOKEN=your-auth-token-here
```

### 3. **Database Client Oluştur**
```typescript
// lib/database.ts
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.EXPO_PUBLIC_TURSO_URL!,
  authToken: process.env.EXPO_PUBLIC_TURSO_TOKEN!
});

export default client;
```

---

## 💡 Avantajları

### ✅ **Neden Turso Developer Plan?**
1. **Uygun Fiyat**: Sadece $4.99/ay
2. **Yeterli Kapasite**: 9GB storage (binlerce medeniyet ve olay)
3. **Unlimited DB**: Test, development, production ayrı DB'ler
4. **Hızlı**: Edge locations ile dünya çapında hızlı erişim
5. **Güvenilir**: SQLite tabanlı, ACID uyumlu
6. **Kolay**: TypeScript desteği, basit API

### 📊 **Kapasite Hesabı**
- **9GB Storage** = yaklaşık:
  - 50,000+ medeniyet
  - 500,000+ olay
  - 1,000,000+ hücre verisi
  - Binlerce fotoğraf metadata'sı

### 🔄 **Scaling**
- Daha fazla storage gerekirse: +$0.75/GB
- Daha fazla read gerekirse: +$1/billion reads
- Çok uygun fiyatlarla büyüyebilir

---

## 🎯 **Sonraki Adımlar**

1. ✅ Turso Developer plan satın al ($4.99/ay)
2. ✅ Database oluştur ve schema'yı çalıştır
3. ✅ Connection bilgilerini al
4. ✅ React Native projesine entegre et
5. ✅ Authentication'ı database'e bağla
6. ✅ Veri sync'ini aktif et

Bu plan ile rahatça başlayabilir ve büyüyebilirsin! 🚀
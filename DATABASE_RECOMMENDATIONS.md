# 🗄️ Database Önerileri - Western Anatolia Timeline

## 📊 Proje İhtiyaçları

Bu proje için şu verileri saklamanız gerekiyor:
- ✅ Kullanıcı bilgileri (authentication)
- ✅ Medeniyetler (civilizations)
- ✅ Tarihsel olaylar (events)
- ✅ Hücre verileri (cell data: fotoğraflar, notlar, etiketler)
- ✅ Kullanıcı ayarları (settings)

---

## 🎯 En İyi Seçenekler

### 1. **Supabase** ⭐ (ÖNERİLEN)

**Neden En İyi:**
- ✅ PostgreSQL tabanlı (güçlü ve güvenilir)
- ✅ Ücretsiz plan: 500MB database, 1GB dosya depolama
- ✅ Built-in authentication (email, Google, Apple, vb.)
- ✅ Real-time subscriptions (canlı güncellemeler)
- ✅ Row Level Security (satır bazlı güvenlik)
- ✅ Dosya depolama (fotoğraflar için)
- ✅ React Native SDK mevcut
- ✅ Türkiye'den erişilebilir

**Fiyatlandırma:**
- **Free Plan**: 500MB database, 1GB storage, 50,000 monthly active users
- **Pro Plan**: $25/ay - 8GB database, 100GB storage, 100,000 MAU
- **Team Plan**: $599/ay - Unlimited

**Kurulum:**
```bash
npm install @supabase/supabase-js
```

**Örnek Kullanım:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Veri çekme
const { data: civilizations } = await supabase
  .from('civilizations')
  .select('*')
```

**Link:** https://supabase.com

---

### 2. **Firebase** (Google)

**Avantajlar:**
- ✅ Google altyapısı (çok güvenilir)
- ✅ Ücretsiz plan: 1GB storage, 10GB/ay transfer
- ✅ Authentication (email, Google, Facebook, vb.)
- ✅ Firestore (NoSQL database)
- ✅ Cloud Storage (fotoğraflar için)
- ✅ Real-time database
- ✅ React Native SDK

**Dezavantajlar:**
- ❌ NoSQL (ilişkisel sorgular zor)
- ❌ Fiyatlandırma karmaşık olabilir

**Fiyatlandırma:**
- **Spark Plan (Free)**: 1GB storage, 10GB/ay transfer
- **Blaze Plan (Pay as you go)**: $0.026/GB storage, $0.12/GB transfer

**Link:** https://firebase.google.com

---

### 3. **MongoDB Atlas**

**Avantajlar:**
- ✅ NoSQL (esnek şema)
- ✅ Ücretsiz plan: 512MB storage
- ✅ Global cluster (hızlı erişim)
- ✅ Güçlü sorgulama

**Dezavantajlar:**
- ❌ Authentication kendiniz yapmalısınız
- ❌ Dosya depolama için ayrı servis gerekli

**Fiyatlandırma:**
- **Free (M0)**: 512MB storage
- **Shared (M2)**: $9/ay - 2GB storage
- **Dedicated (M10)**: $57/ay - 10GB storage

**Link:** https://www.mongodb.com/atlas

---

### 4. **PlanetScale** (MySQL)

**Avantajlar:**
- ✅ MySQL tabanlı
- ✅ Ücretsiz plan: 5GB storage
- ✅ Branching (Git gibi)
- ✅ Otomatik yedekleme

**Dezavantajlar:**
- ❌ Authentication kendiniz yapmalısınız
- ❌ Dosya depolama yok

**Fiyatlandırma:**
- **Hobby Plan (Free)**: 5GB storage, 1 billion row reads/ay
- **Scaler Plan**: $29/ay - 10GB storage
- **Team Plan**: $39/ay - 100GB storage

**Link:** https://planetscale.com

---

### 5. **Neon** (PostgreSQL)

**Avantajlar:**
- ✅ Serverless PostgreSQL
- ✅ Ücretsiz plan: 3GB storage
- ✅ Otomatik scaling
- ✅ Branching

**Dezavantajlar:**
- ❌ Authentication kendiniz yapmalısınız
- ❌ Dosya depolama yok

**Fiyatlandırma:**
- **Free Plan**: 3GB storage, 100 compute hours/ay
- **Pro Plan**: $19/ay - 10GB storage, 300 compute hours

**Link:** https://neon.tech

---

## 🏆 Önerim: **SUPABASE**

### Neden Supabase?

1. **Hepsi Bir Arada**: Database + Auth + Storage + Real-time
2. **Kolay Kurulum**: 5 dakikada hazır
3. **Ücretsiz Plan Yeterli**: Başlangıç için mükemmel
4. **React Native Desteği**: Hazır SDK
5. **Türkçe Dokümantasyon**: Kolay öğrenme

### Supabase ile Başlangıç Adımları:

1. **Hesap Oluştur**: https://supabase.com
2. **Yeni Proje Oluştur**: "New Project" → İsim ver → Şifre belirle
3. **Database Tabloları Oluştur**:
   ```sql
   -- Users (otomatik oluşur)
   
   -- Civilizations
   CREATE TABLE civilizations (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     name TEXT NOT NULL,
     region TEXT,
     start_year INTEGER,
     end_year INTEGER,
     description TEXT,
     color TEXT,
     tags TEXT[],
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Events
   CREATE TABLE events (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     civilization_id UUID REFERENCES civilizations(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT,
     start_year INTEGER,
     end_year INTEGER,
     period TEXT,
     tags TEXT[],
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Cell Data
   CREATE TABLE cell_data (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id),
     year INTEGER,
     civilization_id UUID REFERENCES civilizations(id) ON DELETE CASCADE,
     photos JSONB,
     tags TEXT[],
     notes TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **Row Level Security (RLS) Aktif Et**:
   ```sql
   -- Her kullanıcı sadece kendi verilerini görsün
   ALTER TABLE civilizations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   ALTER TABLE cell_data ENABLE ROW LEVEL SECURITY;
   
   -- Policy oluştur
   CREATE POLICY "Users can view own civilizations"
     ON civilizations FOR SELECT
     USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert own civilizations"
     ON civilizations FOR INSERT
     WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update own civilizations"
     ON civilizations FOR UPDATE
     USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete own civilizations"
     ON civilizations FOR DELETE
     USING (auth.uid() = user_id);
   ```

5. **API Keys Al**: Settings → API → Copy keys

6. **Projeye Entegre Et**:
   ```bash
   npm install @supabase/supabase-js
   ```

---

## 💰 Maliyet Karşılaştırması (Aylık)

| Servis | Free Plan | Paid Plan | Storage | Auth | File Storage |
|--------|-----------|-----------|---------|------|--------------|
| **Supabase** | ✅ 500MB | $25 (8GB) | ✅ | ✅ | ✅ 1GB |
| **Firebase** | ✅ 1GB | Pay-as-go | ✅ | ✅ | ✅ 5GB |
| **MongoDB** | ✅ 512MB | $9 (2GB) | ✅ | ❌ | ❌ |
| **PlanetScale** | ✅ 5GB | $29 (10GB) | ✅ | ❌ | ❌ |
| **Neon** | ✅ 3GB | $19 (10GB) | ✅ | ❌ | ❌ |

---

## 🚀 Hızlı Başlangıç Kodu (Supabase)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Login
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// Get civilizations
export async function getCivilizations() {
  const { data, error } = await supabase
    .from('civilizations')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// Add civilization
export async function addCivilization(civ: any) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('civilizations')
    .insert([{ ...civ, user_id: user?.id }])
    .select()
  return { data, error }
}
```

---

## 📞 Destek

Herhangi bir sorunuz varsa:
- Supabase Discord: https://discord.supabase.com
- Supabase Docs: https://supabase.com/docs
- Firebase Docs: https://firebase.google.com/docs

---

## ✅ Sonuç

**Başlangıç için:** Supabase Free Plan (500MB)
**Büyüme için:** Supabase Pro Plan ($25/ay)
**Alternatif:** Firebase (Google altyapısı tercih ederseniz)

Supabase ile başlamanızı şiddetle öneriyorum! 🚀

# 🚀 GitHub Pull and Deploy Guide

## ✅ TAMAMLANDI: GitHub'a Yüklendi!

Tüm güncel kodlar GitHub'a yüklendi. Şimdi VPS'te çekip deploy edebilirsin.

---

## 📦 Yüklenen Özellikler

### 1. ✅ Polling Sistemi (2 saniyede bir)
- `expo/context/TimelineContext.tsx` - Her 2 saniyede database'i kontrol eder
- Civilizations, events, cellData anlık senkronize
- AsyncStorage kaldırıldı - sadece MySQL database kullanılıyor

### 2. ✅ Çoklu Dil Desteği
- `expo/lib/i18n.ts` - i18next konfigürasyonu
- `expo/locales/tr.json` - Türkçe (varsayılan)
- `expo/locales/en.json` - İngilizce
- `expo/locales/fr.json` - Fransızca
- `expo/locales/de.json` - Almanca

### 3. ✅ Yeni Historical Periods
- **ESKİ (SİLİNDİ)**: Prepalatial, Protopalatial, Neopalatial, Postpalatial
- **YENİ**: Neolithic, Bronze Age, Iron Age, Archaic, Classical, Hellenistic, Roman, Byzantine, Medieval, Renaissance, Early Modern, Modern, Other
- `expo/components/EventCard.tsx` - Yeni period renkleri
- `expo/components/InspectorPanel.tsx` - Yeni period renkleri

### 4. ✅ Event Özel Renkleri
- Eventlere özel renk atanabilir
- `expo/types/index.ts` - `color?: string` field eklendi

### 5. ✅ Civilization Düzenleme
- Tarih düzenleme (startYear, endYear)
- BC tarih validasyonu (startYear > endYear)
- Renk seçici: 10 preset + custom hex

### 6. ✅ Event Title Görünürlüğü
- Font size: 10 → 13
- Font weight: 600 → 700
- Text shadow eklendi
- 2 satır gösterim

### 7. ✅ API Düzeltmeleri
- `toNull()` helper - undefined → null dönüşümü
- `safeJSONParse()` - Bozuk JSON handling
- `expo/api/mysql.js` - Tüm API handlers güncellendi

---

## 🔧 VPS'te Deploy Adımları

### 1. GitHub'dan Çek
```bash
cd /var/www/western-anatolia
git pull origin main
```

### 2. Dependencies Yükle (Eğer gerekirse)
```bash
cd /var/www/western-anatolia/expo
npm install --legacy-peer-deps
```

### 3. Frontend Build
```bash
cd /var/www/western-anatolia/expo
npx expo export --platform web
```

### 4. Dist Deploy
```bash
rm -rf /var/www/western-anatolia/dist
cp -r /var/www/western-anatolia/expo/dist /var/www/western-anatolia/
```

### 5. PM2 Restart
```bash
pm2 restart western-anatolia
pm2 restart timeline-api
```

### 6. Nginx Restart (Opsiyonel)
```bash
systemctl restart nginx
```

### 7. Durumu Kontrol
```bash
pm2 list
pm2 logs western-anatolia --lines 20
pm2 logs timeline-api --lines 20
```

---

## 🧹 Database Temizleme (Eski Period Verilerini Sil)

Eğer database'de eski period verileri varsa (Prepalatial, Protopalatial, vb.), bunları temizle:

```bash
mysql -u timeline_user -p timeline_db
```

```sql
-- Eski period'lu eventleri sil
DELETE FROM events WHERE period IN ('Prepalatial', 'Protopalatial', 'Neopalatial', 'Postpalatial');

-- Kontrol et
SELECT DISTINCT period FROM events;

-- Çık
EXIT;
```

---

## 🔍 Test Adımları

### 1. Browser'da Aç
```
https://anatoliarchieve.info
```

### 2. Hard Refresh (Cache Temizle)
```
Ctrl + Shift + R  (veya Cmd + Shift + R)
```

### 3. Console Temizle (F12)
```javascript
localStorage.clear();
location.reload();
```

### 4. Login
```
Username: admin
Password: melih.Berat2009
```

### 5. Test Et
- ✅ Yeni civilization ekle → Başka browser'da görünmeli (2 saniye içinde)
- ✅ Event ekle → Period dropdown'da yeni periodlar olmalı
- ✅ Settings → Dil değiştir (TR, EN, FR, DE)
- ✅ Civilization düzenle → Tarih ve renk değiştir
- ✅ Event ekle → Özel renk seç

---

## 🐛 Sorun Giderme

### Polling Çalışmıyor
```bash
# API loglarını kontrol et
pm2 logs timeline-api --lines 50

# Database bağlantısını test et
mysql -u timeline_user -p timeline_db -e "SELECT COUNT(*) FROM civilizations;"
```

### Çoklu Dil Görünmüyor
```bash
# Locale dosyalarını kontrol et
ls -la /var/www/western-anatolia/expo/locales/

# Build'i yeniden yap
cd /var/www/western-anatolia/expo
npx expo export --platform web
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/
pm2 restart western-anatolia
```

### Eski Periodlar Hala Görünüyor
```bash
# Cache temizle
# Browser'da: Ctrl+Shift+R
# Console'da: localStorage.clear(); location.reload();

# Database'i kontrol et
mysql -u timeline_user -p timeline_db -e "SELECT DISTINCT period FROM events;"
```

---

## 📊 PM2 Process Durumu

Şu processler çalışıyor olmalı:

```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ western-anatolia   │ fork     │ xxx  │ online    │ 0%       │ 57.3mb   │
│ 3  │ timeline           │ fork     │ xxx  │ online    │ 0%       │ 60.0mb   │
│ 4  │ timeline-api       │ fork     │ xxx  │ online    │ 0%       │ 68.6mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

---

## 🎯 Özet

1. ✅ GitHub'a yüklendi: `git pull origin main`
2. ✅ Polling sistemi: 2 saniyede bir senkronizasyon
3. ✅ Çoklu dil: TR, EN, FR, DE
4. ✅ Yeni periodlar: 13 gerçek historical period
5. ✅ Event özel renkleri
6. ✅ Civilization düzenleme (tarih + renk)
7. ✅ API düzeltmeleri (toNull, safeJSONParse)
8. ✅ Event title görünürlüğü artırıldı

**Şimdi VPS'te `git pull` yap ve deploy et!** 🚀

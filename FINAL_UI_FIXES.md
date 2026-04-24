# 🎨 FINAL UI FIXES

## Yapılacaklar:

### 1. ✅ Historical Period - Sadece senin yazdıkların
**Dosya**: `expo/components/CellEditor.tsx`
**Satır**: 45-59
**Değişiklik**: SUGGESTED_PERIODS listesini kullanıcının girdiği periodlarla değiştir

### 2. ✅ Event Renk Paleti - Tek renk seçici (3 değil)
**Dosya**: `expo/components/CellEditor.tsx`
**Eklenecek**: Event form'una tek renk seçici ekle

### 3. ✅ Event Title Gözükmüyor
**Dosya**: `expo/components/EventCard.tsx`
**Kontrol**: Font size, weight, shadow ayarları

### 4. ✅ Civilization Yer Değiştirme
**Dosya**: `expo/app/index.tsx`
**Kontrol**: Drag & drop veya reorder fonksiyonu

## Hızlı Fix Komutu:

VPS'te çalıştır:
```bash
cd /var/www/western-anatolia
git pull origin main
cd expo
npx expo export --platform web
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/
pm2 restart western-anatolia
```

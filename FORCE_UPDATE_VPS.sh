#!/bin/bash

echo "🔄 FORCE UPDATE VPS"
echo "==================="
echo ""

cd /var/www/western-anatolia

# 1. Stash local changes
echo "📦 1. Local değişiklikler stash'leniyor..."
git stash

# 2. Force fetch and reset
echo "📥 2. GitHub'dan force çekiliyor..."
git fetch origin
git reset --hard origin/main
git clean -fd

# 3. Show latest commit
echo "📝 3. Son commit:"
git log --oneline -1

# 4. Restart API
echo "🔄 4. API restart ediliyor..."
pm2 restart timeline-api

# 5. Wait and check logs
echo "⏳ 5. API başlatılıyor..."
sleep 2

echo ""
echo "📊 PM2 Durumu:"
pm2 list

echo ""
echo "📝 API Logları (son 10 satır):"
pm2 logs timeline-api --lines 10 --nostream

echo ""
echo "==================="
echo "✅ FORCE UPDATE TAMAMLANDI!"
echo "==================="
echo ""
echo "🧪 Test et:"
echo "  - Bir hücreye tıkla"
echo "  - Photos tab → Fotoğraf ekle"
echo "  - Tags tab → Tag ekle"
echo "  - Notes tab → Not yaz"
echo ""

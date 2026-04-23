#!/bin/bash

# VPS Server Fix Script
# Bu script serve paketindeki sorunları çözmek için Express kullanır

echo "🔧 VPS Server Fix Script"
echo "========================"

# 1. PM2'yi durdur ve temizle
echo "📦 PM2 durduruluyor..."
pm2 stop western-anatolia
pm2 delete western-anatolia

# 2. Express'i kur
echo "📦 Express kuruluyor..."
npm install express --legacy-peer-deps

# 3. server.js dosyasını oluştur
echo "📝 server.js oluşturuluyor..."
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://0.0.0.0:${PORT}`);
});
EOF

# 4. PM2 ile başlat
echo "🚀 PM2 ile başlatılıyor..."
pm2 start server.js --name western-anatolia

# 5. PM2'yi kaydet
echo "💾 PM2 kaydediliyor..."
pm2 save

# 6. Durum kontrolü
echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
pm2 status
echo ""
pm2 logs western-anatolia --lines 10

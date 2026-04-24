#!/bin/bash
set -e

echo "🚀 DEPLOYING TO VPS: 31.42.127.82"
echo "=================================="

VPS_IP="31.42.127.82"
VPS_USER="root"
VPS_DIR="/var/www/western-anatolia"

echo ""
echo "📦 Step 1: Copying updated files to VPS..."

# Copy API files
scp expo/api/mysql.js ${VPS_USER}@${VPS_IP}:${VPS_DIR}/expo/api/mysql.js
scp api-server.js ${VPS_USER}@${VPS_IP}:${VPS_DIR}/api-server.js
scp fix-complete-system.sh ${VPS_USER}@${VPS_IP}:${VPS_DIR}/fix-complete-system.sh

echo "✅ Files copied"

echo ""
echo "🔧 Step 2: Running fix script on VPS..."

ssh ${VPS_USER}@${VPS_IP} << 'ENDSSH'
cd /var/www/western-anatolia

# Make script executable
chmod +x fix-complete-system.sh

# Run the fix script
./fix-complete-system.sh

ENDSSH

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. Open: https://anatoliarchieve.info"
echo "2. Press F12 (DevTools)"
echo "3. Console'da çalıştır: localStorage.clear(); location.reload();"
echo "4. Login: admin / melih.Berat2009"
echo "5. Test et: Bir civilization ekle"
echo "6. Başka bir browser'da aç - aynı veriyi görmeli"
echo ""

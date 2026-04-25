# ========================================
# FIX EVERYTHING - ONE COMMAND SOLUTION
# ========================================
# This script fixes ALL issues:
# 1. Nginx HTTP 413 error (body size limit)
# 2. PostgreSQL database setup
# 3. Frontend rebuild and deployment
# 4. API server restart
# ========================================

$VPS_IP = "31.42.127.82"
$VPS_USER = "root"
$VPS_PATH = "/var/www/western-anatolia"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 FIX EVERYTHING - COMPLETE SOLUTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Upload all fixed files
Write-Host "📤 Step 1/4: Uploading fixed files..." -ForegroundColor Yellow
Write-Host ""

# Upload the complete fix script
scp COMPLETE_FIX.sh "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload COMPLETE_FIX.sh" -ForegroundColor Red
    exit 1
}

# Upload fixed postgres.js
scp expo/api/postgres.js "${VPS_USER}@${VPS_IP}:${VPS_PATH}/expo/api/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload postgres.js" -ForegroundColor Red
    exit 1
}

# Upload fixed api-server.js
scp api-server.js "${VPS_USER}@${VPS_IP}:${VPS_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upload api-server.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Files uploaded!" -ForegroundColor Green
Write-Host ""

# Step 2: Run the complete fix script
Write-Host "🔧 Step 2/4: Running complete fix on VPS..." -ForegroundColor Yellow
Write-Host "   (This will take 2-3 minutes...)" -ForegroundColor Gray
Write-Host ""

ssh "${VPS_USER}@${VPS_IP}" "cd ${VPS_PATH} && chmod +x COMPLETE_FIX.sh && bash COMPLETE_FIX.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Fix script failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Debug commands:" -ForegroundColor Yellow
    Write-Host "   ssh root@31.42.127.82" -ForegroundColor White
    Write-Host "   cd /var/www/western-anatolia" -ForegroundColor White
    Write-Host "   cat COMPLETE_FIX.sh" -ForegroundColor White
    Write-Host "   bash COMPLETE_FIX.sh" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✅ Fix script completed!" -ForegroundColor Green
Write-Host ""

# Step 3: Verify everything is working
Write-Host "🔍 Step 3/4: Verifying deployment..." -ForegroundColor Yellow
Write-Host ""

$verification = ssh "${VPS_USER}@${VPS_IP}" @"
echo '=== PM2 Status ==='
pm2 list | grep timeline-api
echo ''
echo '=== Nginx Status ==='
systemctl status nginx --no-pager | head -3
echo ''
echo '=== PostgreSQL Status ==='
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) as total_users FROM users;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) as total_civilizations FROM civilizations;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) as total_events FROM events;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) as total_cells FROM cell_data;'
echo ''
echo '=== Dist Files ==='
ls -lh /var/www/western-anatolia/dist/index.html 2>&1 | head -1
"@

Write-Host $verification
Write-Host ""

# Step 4: Final instructions
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 WHAT WAS FIXED:" -ForegroundColor Cyan
Write-Host "   ✅ Nginx HTTP 413 error - body size increased to 150GB" -ForegroundColor White
Write-Host "   ✅ Express.js body limit increased to 150GB" -ForegroundColor White
Write-Host "   ✅ PostgreSQL local database configured" -ForegroundColor White
Write-Host "   ✅ All tables created (users, civilizations, events, cell_data)" -ForegroundColor White
Write-Host "   ✅ Foreign key constraints removed" -ForegroundColor White
Write-Host "   ✅ Admin user: admin / melih.Berat2009" -ForegroundColor White
Write-Host "   ✅ Frontend rebuilt and deployed" -ForegroundColor White
Write-Host "   ✅ API server restarted" -ForegroundColor White
Write-Host ""
Write-Host "🧪 TEST NOW:" -ForegroundColor Cyan
Write-Host "   1. Open: https://anatoliarchieve.info" -ForegroundColor White
Write-Host "   2. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)" -ForegroundColor White
Write-Host "   3. Open browser console (F12)" -ForegroundColor White
Write-Host "   4. Run: localStorage.clear(); location.reload();" -ForegroundColor White
Write-Host "   5. Login: admin / melih.Berat2009" -ForegroundColor White
Write-Host "   6. Add a civilization" -ForegroundColor White
Write-Host "   7. Click on a cell and add a photo" -ForegroundColor White
Write-Host "   8. Wait 10 seconds - photo should STAY!" -ForegroundColor White
Write-Host ""
Write-Host "🔍 MONITOR LOGS:" -ForegroundColor Cyan
Write-Host "   ssh root@31.42.127.82 'pm2 logs timeline-api --lines 50'" -ForegroundColor White
Write-Host ""
Write-Host "🗄️  CHECK DATABASE:" -ForegroundColor Cyan
Write-Host "   ssh root@31.42.127.82 ""sudo -u postgres psql timeline_pg -c 'SELECT id, year, civilization_id, length(photos::text) as photo_size FROM cell_data;'""" -ForegroundColor White
Write-Host ""
Write-Host "🚨 IF PHOTOS STILL DISAPPEAR:" -ForegroundColor Yellow
Write-Host "   1. Check browser console for errors (F12)" -ForegroundColor White
Write-Host "   2. Look for HTTP 413 or 502 errors" -ForegroundColor White
Write-Host "   3. Check API logs: ssh root@31.42.127.82 'pm2 logs timeline-api'" -ForegroundColor White
Write-Host "   4. Verify Nginx config: ssh root@31.42.127.82 'cat /etc/nginx/sites-available/anatoliarchieve | grep client_max_body_size'" -ForegroundColor White
Write-Host ""
Write-Host "📞 NEED HELP?" -ForegroundColor Cyan
Write-Host "   Run this to see detailed logs:" -ForegroundColor White
Write-Host "   ssh root@31.42.127.82 'pm2 logs timeline-api --lines 100 | grep -i error'" -ForegroundColor White
Write-Host ""

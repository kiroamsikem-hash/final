# DEPLOY COMPLETE FIX TO VPS
# This script uploads and runs the complete fix on the VPS

$VPS_IP = "31.42.127.82"
$VPS_USER = "root"
$VPS_PATH = "/var/www/western-anatolia"

Write-Host "🚀 DEPLOYING COMPLETE FIX TO VPS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# 1. Upload the fix script
Write-Host "📤 1. Uploading COMPLETE_FIX.sh..." -ForegroundColor Yellow
scp COMPLETE_FIX.sh "${VPS_USER}@${VPS_IP}:${VPS_PATH}/COMPLETE_FIX.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Uploaded!" -ForegroundColor Green
Write-Host ""

# 2. Make it executable and run it
Write-Host "🔧 2. Making script executable and running..." -ForegroundColor Yellow
ssh "${VPS_USER}@${VPS_IP}" "cd ${VPS_PATH} && chmod +x COMPLETE_FIX.sh && ./COMPLETE_FIX.sh"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Script execution failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Check logs:" -ForegroundColor Yellow
    Write-Host "   ssh root@31.42.127.82" -ForegroundColor White
    Write-Host "   cd /var/www/western-anatolia" -ForegroundColor White
    Write-Host "   cat COMPLETE_FIX.sh" -ForegroundColor White
    Write-Host "   ./COMPLETE_FIX.sh" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 TEST NOW:" -ForegroundColor Cyan
Write-Host "1. Open: https://anatoliarchieve.info" -ForegroundColor White
Write-Host "2. Hard refresh: Ctrl+Shift+R" -ForegroundColor White
Write-Host "3. Login: admin / melih.Berat2009" -ForegroundColor White
Write-Host "4. Add a photo to any cell" -ForegroundColor White
Write-Host "5. Wait 10 seconds - photo should stay!" -ForegroundColor White
Write-Host ""
Write-Host "🔍 MONITOR LOGS:" -ForegroundColor Cyan
Write-Host "   ssh root@31.42.127.82 'pm2 logs timeline-api --lines 50'" -ForegroundColor White
Write-Host ""
Write-Host "🗄️  CHECK DATABASE:" -ForegroundColor Cyan
Write-Host "   ssh root@31.42.127.82 ""sudo -u postgres psql timeline_pg -c 'SELECT id, year, civilization_id, length(photos::text) as photo_size FROM cell_data;'""" -ForegroundColor White
Write-Host ""

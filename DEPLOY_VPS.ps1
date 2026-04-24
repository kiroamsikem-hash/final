# PowerShell deployment script for VPS

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🚀 VPS DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$sshCommand = @"
cd /var/www/western-anatolia && \
echo '📥 Git pull...' && \
git pull origin main && \
echo '🔨 Building frontend...' && \
cd expo && \
npx expo export --platform web && \
echo '📦 Deploying dist...' && \
cd .. && \
rm -rf dist && \
cp -r expo/dist ./dist && \
chmod -R 755 dist && \
echo '🔄 Restarting PM2...' && \
pm2 restart timeline-api && \
echo '✅ DEPLOYMENT COMPLETE!' && \
echo '' && \
echo '📊 PM2 Status:' && \
pm2 list && \
echo '' && \
echo '📝 API Logs:' && \
pm2 logs timeline-api --lines 15 --nostream
"@

Write-Host "Connecting to VPS..." -ForegroundColor Yellow
ssh root@31.42.127.82 $sshCommand

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT FINISHED!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 TEST INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Go to https://anatoliarchieve.info"
Write-Host "2. Click on a cell"
Write-Host "3. Add a photo in Photos tab"
Write-Host "4. Wait 10 seconds (2 polling cycles)"
Write-Host "5. Verify photo is still there!"
Write-Host ""
Write-Host "Test the same for Tags, Notes, and Events!"
Write-Host "=========================================" -ForegroundColor Cyan

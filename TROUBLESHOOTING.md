# 🔧 TROUBLESHOOTING GUIDE

## Quick Fix - Run This First

```powershell
.\FIX_EVERYTHING.ps1
```

This script fixes ALL known issues automatically.

---

## Problem: Photos Disappear After 5-10 Seconds

### Root Cause
HTTP 413 "Request Entity Too Large" - Nginx rejects photo uploads because the request body is too large.

### Solution
The `FIX_EVERYTHING.ps1` script fixes this by:
1. Updating Nginx config to allow 50MB uploads
2. Increasing all timeouts for large uploads
3. Reloading Nginx to apply changes

### Manual Fix (if script fails)
```bash
ssh root@31.42.127.82

# Edit Nginx config
nano /etc/nginx/sites-available/anatoliarchieve

# Add these lines inside the "location /api/" block:
client_max_body_size 50M;
client_body_buffer_size 50M;
proxy_read_timeout 300s;
proxy_connect_timeout 300s;
proxy_send_timeout 300s;

# Test and reload
nginx -t
systemctl reload nginx
```

---

## Problem: Database Connection Errors

### Symptoms
- "Connection terminated unexpectedly"
- "Database not available"
- Events/civilizations not saving

### Solution
The script creates a local PostgreSQL database on the VPS:
- Database: `timeline_pg`
- User: `timeline_admin`
- Password: `Timeline2024!Strong`
- Host: `localhost:5432`

### Verify Database
```bash
ssh root@31.42.127.82

# Check PostgreSQL is running
systemctl status postgresql

# Check database exists
sudo -u postgres psql -l | grep timeline_pg

# Check tables
sudo -u postgres psql timeline_pg -c '\dt'

# Check data
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) FROM users;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) FROM civilizations;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) FROM events;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) FROM cell_data;'
```

---

## Problem: API Server Not Running

### Check PM2 Status
```bash
ssh root@31.42.127.82
pm2 list
```

### Restart API Server
```bash
ssh root@31.42.127.82
cd /var/www/western-anatolia
pm2 restart timeline-api
pm2 logs timeline-api --lines 50
```

### Start from Scratch
```bash
ssh root@31.42.127.82
cd /var/www/western-anatolia
pm2 delete all
pm2 start api-server.js --name timeline-api --time
pm2 save
```

---

## Problem: Frontend Not Loading

### Symptoms
- Blank page
- 404 errors
- Old version showing

### Solution
```bash
ssh root@31.42.127.82
cd /var/www/western-anatolia/expo

# Clean rebuild
rm -rf dist
npx expo export --platform web --clear

# Copy to web root
cd ..
rm -rf dist
cp -r expo/dist ./dist
chmod -R 755 dist

# Verify
ls -la dist/index.html
```

### Clear Browser Cache
1. Open https://anatoliarchieve.info
2. Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Open console (F12)
4. Run: `localStorage.clear(); location.reload();`

---

## Problem: Login Not Working

### Check Admin User
```bash
ssh root@31.42.127.82
sudo -u postgres psql timeline_pg -c "SELECT username, password FROM users WHERE username = 'admin';"
```

Should show:
- Username: `admin`
- Password: `melih.Berat2009`

### Reset Admin Password
```bash
ssh root@31.42.127.82
sudo -u postgres psql timeline_pg -c "UPDATE users SET password = 'melih.Berat2009' WHERE username = 'admin';"
```

---

## Problem: Polling Not Working (Data Not Syncing)

### Symptoms
- Changes on one device don't appear on another
- Data doesn't refresh automatically

### Check WebSocket Connection
Open browser console (F12) and look for:
- `✅ Client connected`
- `📢 Broadcasting: dataChanged`

### Verify Polling
The frontend polls every 5 seconds. Check console for:
- No errors in console
- Network tab shows `/api/postgres` requests every 5 seconds

### Fix
```bash
ssh root@31.42.127.82
pm2 restart timeline-api
```

---

## Problem: Nginx Errors

### Check Nginx Status
```bash
ssh root@31.42.127.82
systemctl status nginx
nginx -t
```

### View Nginx Logs
```bash
ssh root@31.42.127.82
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Restart Nginx
```bash
ssh root@31.42.127.82
systemctl restart nginx
```

---

## Problem: SSL Certificate Issues

### Check Certificate
```bash
ssh root@31.42.127.82
certbot certificates
```

### Renew Certificate
```bash
ssh root@31.42.127.82
certbot renew --dry-run
certbot renew
systemctl reload nginx
```

---

## Complete System Check

Run this to check everything:

```bash
ssh root@31.42.127.82 << 'EOF'
echo "=== SYSTEM STATUS ==="
echo ""

echo "1. Nginx Status:"
systemctl status nginx --no-pager | head -3
echo ""

echo "2. PostgreSQL Status:"
systemctl status postgresql --no-pager | head -3
echo ""

echo "3. PM2 Status:"
pm2 list
echo ""

echo "4. Database Tables:"
sudo -u postgres psql timeline_pg -c '\dt'
echo ""

echo "5. Database Counts:"
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) as users FROM users;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) as civilizations FROM civilizations;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) as events FROM events;'
sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) as cells FROM cell_data;'
echo ""

echo "6. Dist Files:"
ls -lh /var/www/western-anatolia/dist/index.html
echo ""

echo "7. API Logs (last 10 lines):"
pm2 logs timeline-api --lines 10 --nostream
echo ""

echo "8. Nginx Config Check:"
nginx -t
echo ""

echo "=== END STATUS ==="
EOF
```

---

## Emergency Reset

If nothing works, run this to reset everything:

```bash
ssh root@31.42.127.82
cd /var/www/western-anatolia
bash COMPLETE_FIX.sh
```

Or from Windows:
```powershell
.\FIX_EVERYTHING.ps1
```

---

## Contact Information

If you still have issues after running `FIX_EVERYTHING.ps1`, provide:

1. **Browser Console Errors** (F12 → Console tab)
2. **API Logs**: `ssh root@31.42.127.82 'pm2 logs timeline-api --lines 50'`
3. **Nginx Logs**: `ssh root@31.42.127.82 'tail -50 /var/log/nginx/error.log'`
4. **Database Status**: `ssh root@31.42.127.82 'sudo -u postgres psql timeline_pg -c "\dt"'`

---

## Quick Reference

| Component | Location | Command |
|-----------|----------|---------|
| Frontend | `/var/www/western-anatolia/dist/` | `ls -la /var/www/western-anatolia/dist/` |
| API Server | Port 8084 | `pm2 logs timeline-api` |
| Database | PostgreSQL localhost:5432 | `sudo -u postgres psql timeline_pg` |
| Nginx Config | `/etc/nginx/sites-available/anatoliarchieve` | `cat /etc/nginx/sites-available/anatoliarchieve` |
| Logs | `/var/log/nginx/` | `tail -f /var/log/nginx/error.log` |

---

## Success Checklist

After running `FIX_EVERYTHING.ps1`, verify:

- [ ] Site loads: https://anatoliarchieve.info
- [ ] Login works: admin / melih.Berat2009
- [ ] Can add civilization
- [ ] Can add event
- [ ] Can add photo to cell
- [ ] Photo stays after 10 seconds
- [ ] Changes sync between devices
- [ ] No errors in browser console
- [ ] PM2 shows timeline-api running
- [ ] Nginx status is active

---

## Performance Tips

1. **Large Photos**: Resize images before uploading (max 1MB recommended)
2. **Browser Cache**: Clear cache regularly with `Ctrl+Shift+R`
3. **Database**: Run `VACUUM` monthly: `sudo -u postgres psql timeline_pg -c 'VACUUM;'`
4. **Logs**: Rotate PM2 logs: `pm2 flush`

---

## Backup Commands

### Backup Database
```bash
ssh root@31.42.127.82
sudo -u postgres pg_dump timeline_pg > /tmp/timeline_backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
ssh root@31.42.127.82
sudo -u postgres psql timeline_pg < /tmp/timeline_backup_YYYYMMDD.sql
```

---

**Last Updated**: 2026-04-24
**Version**: 1.0

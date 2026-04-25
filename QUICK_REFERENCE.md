# 🎯 QUICK REFERENCE CARD

## ⚡ ONE COMMAND FIX
```powershell
.\FIX_EVERYTHING.ps1
```

---

## 🔑 CREDENTIALS

| Service | Details |
|---------|---------|
| **Site** | https://anatoliarchieve.info |
| **Login** | admin / melih.Berat2009 |
| **VPS** | root@31.42.127.82 |
| **Database** | timeline_pg @ localhost:5432 |
| **DB User** | timeline_admin / Timeline2024!Strong |
| **API Port** | 8084 |

---

## 📁 KEY LOCATIONS

| Item | Path |
|------|------|
| Frontend | `/var/www/western-anatolia/dist/` |
| API Server | `/var/www/western-anatolia/api-server.js` |
| PostgreSQL API | `/var/www/western-anatolia/expo/api/postgres.js` |
| Nginx Config | `/etc/nginx/sites-available/anatoliarchieve` |
| .env File | `/var/www/western-anatolia/expo/.env` |

---

## 🔧 COMMON COMMANDS

### Check Status
```bash
# PM2
ssh root@31.42.127.82 "pm2 list"

# Nginx
ssh root@31.42.127.82 "systemctl status nginx"

# PostgreSQL
ssh root@31.42.127.82 "systemctl status postgresql"
```

### View Logs
```bash
# API logs
ssh root@31.42.127.82 "pm2 logs timeline-api --lines 50"

# Nginx error log
ssh root@31.42.127.82 "tail -50 /var/log/nginx/error.log"

# Nginx access log
ssh root@31.42.127.82 "tail -50 /var/log/nginx/access.log"
```

### Restart Services
```bash
# API server
ssh root@31.42.127.82 "pm2 restart timeline-api"

# Nginx
ssh root@31.42.127.82 "systemctl reload nginx"

# PostgreSQL
ssh root@31.42.127.82 "systemctl restart postgresql"
```

### Database Queries
```bash
# Count users
ssh root@31.42.127.82 "sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) FROM users;'"

# Count civilizations
ssh root@31.42.127.82 "sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) FROM civilizations;'"

# Count events
ssh root@31.42.127.82 "sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) FROM events;'"

# Count cells with photos
ssh root@31.42.127.82 "sudo -u postgres psql timeline_pg -c 'SELECT COUNT(*) FROM cell_data WHERE photos IS NOT NULL;'"

# Check photo sizes
ssh root@31.42.127.82 "sudo -u postgres psql timeline_pg -c 'SELECT id, year, civilization_id, length(photos::text) as photo_size FROM cell_data;'"
```

### Rebuild & Deploy
```bash
# From Windows PowerShell
ssh root@31.42.127.82 "cd /var/www/western-anatolia/expo && npx expo export --platform web --clear && cd .. && rm -rf dist && cp -r expo/dist ./dist && chmod -R 755 dist && pm2 restart timeline-api"
```

---

## 🚨 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Photos disappear | Run `.\FIX_EVERYTHING.ps1` |
| Login fails | Check admin password in database |
| Site not loading | Check Nginx and dist files |
| API errors | Check PM2 logs |
| Database errors | Check PostgreSQL status |
| HTTP 413 | Check Nginx body size config |

---

## ✅ SUCCESS CHECKLIST

- [ ] Site loads: https://anatoliarchieve.info
- [ ] Login works: admin / melih.Berat2009
- [ ] Can add civilization
- [ ] Can add event
- [ ] Can add photo
- [ ] Photo stays after 10 seconds
- [ ] No console errors
- [ ] PM2 running
- [ ] Nginx active

---

## 📊 SYSTEM ARCHITECTURE

```
Browser (HTTPS)
    ↓
Nginx (Port 443)
    ├─→ Static Files (/var/www/western-anatolia/dist/)
    └─→ API Proxy (/api/ → localhost:8084)
            ↓
        Node.js API Server (Port 8084)
            ↓
        PostgreSQL (localhost:5432)
            └─→ timeline_pg database
```

---

## 🔄 DATA FLOW

```
User adds photo
    ↓
Frontend (React)
    ↓
POST /api/postgres (base64 photo data)
    ↓
Nginx (checks body size < 50MB)
    ↓
API Server (Express.js)
    ↓
PostgreSQL (JSONB storage)
    ↓
Polling (every 5 seconds)
    ↓
All devices sync
```

---

## 📝 QUICK FIXES

### Clear Browser Cache
```javascript
// In browser console (F12)
localStorage.clear(); 
location.reload();
```

### Reset Admin Password
```bash
ssh root@31.42.127.82 "sudo -u postgres psql timeline_pg -c \"UPDATE users SET password = 'melih.Berat2009' WHERE username = 'admin';\""
```

### Check Nginx Body Size
```bash
ssh root@31.42.127.82 "cat /etc/nginx/sites-available/anatoliarchieve | grep client_max_body_size"
```
Should show: `client_max_body_size 50M;`

### Verify Database Connection
```bash
ssh root@31.42.127.82 "cat /var/www/western-anatolia/expo/.env"
```
Should show:
```
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=timeline_admin
DB_PASSWORD=Timeline2024!Strong
DB_NAME=timeline_pg
```

---

## 🎯 PERFORMANCE TIPS

1. **Resize photos** before upload (max 1MB)
2. **Clear cache** regularly (Ctrl+Shift+R)
3. **Vacuum database** monthly
4. **Rotate logs** with `pm2 flush`

---

## 📞 EMERGENCY CONTACTS

| Issue | Command |
|-------|---------|
| Complete reset | `.\FIX_EVERYTHING.ps1` |
| Manual fix | `ssh root@31.42.127.82 "cd /var/www/western-anatolia && bash COMPLETE_FIX.sh"` |
| Check all logs | `ssh root@31.42.127.82 "pm2 logs timeline-api --lines 100"` |

---

## 🔐 SECURITY NOTES

- Admin password stored as **plain text** in database
- PostgreSQL only accessible from **localhost**
- Nginx serves over **HTTPS** with Let's Encrypt
- API server bound to **localhost:8084**
- No external database access

---

## 📈 MONITORING

### Health Check
```bash
curl https://anatoliarchieve.info/health
```

### PM2 Monitoring
```bash
ssh root@31.42.127.82 "pm2 monit"
```

### Database Size
```bash
ssh root@31.42.127.82 "sudo -u postgres psql timeline_pg -c 'SELECT pg_size_pretty(pg_database_size(current_database()));'"
```

---

**Print this card and keep it handy!** 📋

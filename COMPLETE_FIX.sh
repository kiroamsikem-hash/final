#!/bin/bash

echo "🚨 COMPLETE FIX - ALL ISSUES"
echo "============================"
echo ""

# 1. Fix Nginx - HTTP 413 Error
echo "🌐 1. Fixing Nginx configuration for large uploads..."

# Backup current config
cp /etc/nginx/sites-available/anatoliarchieve /etc/nginx/sites-available/anatoliarchieve.backup.$(date +%s)

# Create new nginx config with proper body size limits
cat > /etc/nginx/sites-available/anatoliarchieve << 'NGINXEOF'
server {
    listen 80;
    server_name anatoliarchieve.info www.anatoliarchieve.info;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name anatoliarchieve.info www.anatoliarchieve.info;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/anatoliarchieve.info/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anatoliarchieve.info/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # CRITICAL: Allow large uploads for photos (base64 encoded) - 150GB LIMIT
    client_max_body_size 150G;
    client_body_buffer_size 150G;

    # Frontend - Static files
    location / {
        root /var/www/western-anatolia/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API - Reverse proxy to Node.js
    location /api/ {
        # CRITICAL: Large body size for photo uploads - 150GB LIMIT
        client_max_body_size 150G;
        client_body_buffer_size 150G;
        
        # Timeouts for large uploads
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        
        proxy_pass http://localhost:8084/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

echo "✅ Nginx config updated!"
echo ""

# Test nginx config
echo "🔍 Testing Nginx configuration..."
nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx config test failed! Restoring backup..."
    cp /etc/nginx/sites-available/anatoliarchieve.backup.* /etc/nginx/sites-available/anatoliarchieve
    exit 1
fi

echo "✅ Nginx config test passed!"
echo ""

# Reload nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

if [ $? -ne 0 ]; then
    echo "❌ Nginx reload failed!"
    exit 1
fi

echo "✅ Nginx reloaded!"
echo ""

# 2. Verify PostgreSQL database and tables
echo "🗄️  2. Verifying PostgreSQL database..."

sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ PostgreSQL not running!"
    exit 1
fi

echo "✅ PostgreSQL is running!"
echo ""

# Check if database exists
echo "🔍 Checking database 'timeline_pg'..."
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='timeline_pg'")

if [ "$DB_EXISTS" != "1" ]; then
    echo "⚠️  Database doesn't exist, creating..."
    sudo -u postgres psql -c "CREATE DATABASE timeline_pg;"
    sudo -u postgres psql -c "CREATE USER timeline_admin WITH PASSWORD 'Timeline2024!Strong';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE timeline_pg TO timeline_admin;"
    echo "✅ Database created!"
else
    echo "✅ Database exists!"
fi

echo ""

# Create/update tables
echo "📋 Creating/updating tables..."
sudo -u postgres psql timeline_pg << 'SQLEOF'
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Civilizations table
CREATE TABLE IF NOT EXISTS civilizations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    year INTEGER NOT NULL,
    period VARCHAR(255),
    color VARCHAR(50),
    civilization_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cell data table (for photos and other cell-specific data)
CREATE TABLE IF NOT EXISTS cell_data (
    id VARCHAR(255) PRIMARY KEY,
    year INTEGER NOT NULL,
    civilization_id VARCHAR(255),
    photos TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add admin user if not exists
INSERT INTO users (username, password)
VALUES ('admin', 'melih.Berat2009')
ON CONFLICT (username) DO UPDATE SET password = 'melih.Berat2009';

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO timeline_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO timeline_admin;

-- Show tables
\dt

-- Show admin user
SELECT username, password FROM users WHERE username = 'admin';
SQLEOF

echo "✅ Tables created/updated!"
echo ""

# 3. Update .env file
echo "📝 3. Updating .env file..."
cd /var/www/western-anatolia/expo

cat > .env << 'ENVEOF'
# PostgreSQL Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=timeline_admin
DB_PASSWORD=Timeline2024!Strong
DB_NAME=timeline_pg

# API Configuration
API_PORT=8084
ENVEOF

echo "✅ .env updated!"
echo ""

# 4. Stop PM2
echo "⏸️  4. Stopping PM2..."
pm2 stop all
pm2 delete all

echo "✅ PM2 stopped!"
echo ""

# 5. Clean and rebuild
echo "🧹 5. Cleaning old builds..."
cd /var/www/western-anatolia
rm -rf dist
cd expo
rm -rf dist

echo "✅ Cleaned!"
echo ""

# 6. Build frontend
echo "🔨 6. Building frontend..."
cd /var/www/western-anatolia/expo
npx expo export --platform web --clear

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed!"
echo ""

# 7. Copy dist
echo "📂 7. Copying dist..."
cp -r /var/www/western-anatolia/expo/dist /var/www/western-anatolia/
chmod -R 755 /var/www/western-anatolia/dist

if [ ! -f /var/www/western-anatolia/dist/index.html ]; then
    echo "❌ index.html not found!"
    exit 1
fi

echo "✅ Dist copied!"
echo ""

# 8. Start API server with PM2
echo "🚀 8. Starting API server..."
cd /var/www/western-anatolia
pm2 start api-server.js --name timeline-api --time

if [ $? -ne 0 ]; then
    echo "❌ PM2 start failed!"
    exit 1
fi

echo "✅ API server started!"
echo ""

# 9. Save PM2 configuration
echo "💾 9. Saving PM2 configuration..."
pm2 save
pm2 startup

echo "✅ PM2 configuration saved!"
echo ""

# 10. Final checks
echo "📊 10. Final checks..."
echo ""

echo "🔍 PM2 Status:"
pm2 list
echo ""

echo "🔍 Nginx Status:"
systemctl status nginx --no-pager | head -5
echo ""

echo "🔍 PostgreSQL Status:"
sudo -u postgres psql timeline_pg -c "SELECT COUNT(*) as user_count FROM users;"
sudo -u postgres psql timeline_pg -c "SELECT COUNT(*) as civ_count FROM civilizations;"
sudo -u postgres psql timeline_pg -c "SELECT COUNT(*) as event_count FROM events;"
sudo -u postgres psql timeline_pg -c "SELECT COUNT(*) as cell_count FROM cell_data;"
echo ""

echo "🔍 API Logs (last 10 lines):"
pm2 logs timeline-api --lines 10 --nostream
echo ""

echo "================================"
echo "✅ COMPLETE FIX FINISHED!"
echo "================================"
echo ""
echo "🎯 WHAT WAS FIXED:"
echo "1. ✅ Nginx HTTP 413 error - increased body size to 150GB"
echo "2. ✅ PostgreSQL database and tables verified/created"
echo "3. ✅ Admin user: admin / melih.Berat2009"
echo "4. ✅ Frontend rebuilt and deployed"
echo "5. ✅ API server restarted with PM2"
echo "6. ✅ All timeouts increased for large uploads"
echo ""
echo "🧪 TEST NOW:"
echo "1. Open: https://anatoliarchieve.info"
echo "2. Hard refresh: Ctrl+Shift+R"
echo "3. Login: admin / melih.Berat2009"
echo "4. Add a photo to any cell"
echo "5. Photo should persist after 5-10 seconds"
echo ""
echo "🔍 MONITOR:"
echo "   pm2 logs timeline-api --lines 50"
echo "   sudo -u postgres psql timeline_pg -c 'SELECT id, year, civilization_id, length(photos::text) as photo_size FROM cell_data;'"
echo ""
echo "🚨 IF PHOTOS STILL DISAPPEAR:"
echo "   Check browser console for errors"
echo "   Check API logs: pm2 logs timeline-api"
echo "   Check database: sudo -u postgres psql timeline_pg -c 'SELECT * FROM cell_data;'"
echo ""

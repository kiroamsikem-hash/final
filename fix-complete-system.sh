#!/bin/bash
set -e

echo "🔧 COMPLETE SYSTEM FIX - Starting..."

# 1. Clean database completely
echo "🗑️  Step 1: Cleaning database..."
mysql -u timeline_user -p'Timeline2024!Strong' timeline_db <<EOF
-- Drop all tables to ensure clean state
DROP TABLE IF EXISTS cell_data;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS civilizations;
DROP TABLE IF EXISTS users;

-- Recreate tables
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE civilizations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  start_year INT,
  end_year INT,
  description TEXT,
  color VARCHAR(7),
  tags JSON,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_year INT,
  end_year INT,
  period VARCHAR(50),
  civilization_id VARCHAR(50),
  tags JSON,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
);

CREATE TABLE cell_data (
  id VARCHAR(100) PRIMARY KEY,
  year INT NOT NULL,
  civilization_id VARCHAR(50) NOT NULL,
  photos JSON,
  tags JSON,
  notes TEXT,
  name VARCHAR(100),
  related_cells JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE
);

-- Insert admin user
INSERT INTO users (username, password) VALUES ('admin', 'melih.Berat2009');

SELECT 'Database cleaned and recreated!' as status;
EOF

echo "✅ Database cleaned successfully"

# 2. Copy updated API file to VPS
echo "📦 Step 2: Updating API server..."
cp /root/western-anatolia/expo/api/mysql.js /var/www/western-anatolia/expo/api/mysql.js

# 3. Restart API server
echo "🔄 Step 3: Restarting API server..."
pm2 restart timeline-api

# 4. Wait for API to be ready
echo "⏳ Waiting for API to start..."
sleep 3

# 5. Rebuild frontend
echo "🏗️  Step 4: Rebuilding frontend..."
cd /var/www/western-anatolia/expo
npx expo export --platform web

# 6. Deploy new build
echo "📂 Step 5: Deploying new build..."
rm -rf /var/www/western-anatolia/dist
cp -r dist /var/www/western-anatolia/

# 7. Restart frontend server
echo "🔄 Step 6: Restarting frontend server..."
pm2 restart western-anatolia

# 8. Show status
echo ""
echo "✅ COMPLETE! System is ready."
echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "🔍 API Logs (last 20 lines):"
pm2 logs timeline-api --lines 20 --nostream

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Open browser: https://anatoliarchieve.info"
echo "2. Open DevTools Console (F12)"
echo "3. Run: localStorage.clear(); location.reload();"
echo "4. Login with: admin / melih.Berat2009"
echo "5. Add a test civilization"
echo "6. Open in another browser/device - should see same data"
echo ""
echo "✨ Real-time sync should now work!"

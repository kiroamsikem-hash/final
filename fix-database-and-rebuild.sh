#!/bin/bash

echo "🔧 Fixing Database and Rebuilding Frontend..."

# 1. Clean database
echo "🗑️ Cleaning corrupted database..."
mysql -u timeline_user -p'Timeline2024!Strong' timeline_db << 'EOF'
-- Clear all data
TRUNCATE TABLE civilizations;
TRUNCATE TABLE events;
TRUNCATE TABLE cell_data;

-- Verify tables are empty
SELECT 'Civilizations:', COUNT(*) FROM civilizations;
SELECT 'Events:', COUNT(*) FROM events;
SELECT 'Cell Data:', COUNT(*) FROM cell_data;
EOF

echo ""
echo "✅ Database cleaned!"
echo ""

# 2. Rebuild frontend with correct command
cd /var/www/western-anatolia/expo

echo "🏗️ Building frontend (this may take a few minutes)..."
npx expo export --platform web

# Move dist to correct location
if [ -d "dist" ]; then
    rm -rf /var/www/western-anatolia/dist
    mv dist /var/www/western-anatolia/
    echo "✅ Frontend built and moved to /var/www/western-anatolia/dist"
else
    echo "❌ Build failed - dist folder not created"
    exit 1
fi

# 3. Restart services
echo ""
echo "🔄 Restarting services..."
pm2 restart all

echo ""
echo "✅ DONE!"
echo ""
echo "📋 Next steps:"
echo "1. Open https://anatoliarchieve.info"
echo "2. Login with: admin / melih.Berat2009"
echo "3. Add a new civilization"
echo "4. Open in another browser - should sync instantly!"
echo ""
echo "🔍 Check logs: pm2 logs timeline-api --lines 20"

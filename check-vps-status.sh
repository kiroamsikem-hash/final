#!/bin/bash

echo "🔍 Checking VPS status..."
echo ""

# Check if we're on VPS
if [ -d "/var/www/western-anatolia" ]; then
    echo "✅ Running on VPS"
    
    echo ""
    echo "📊 PM2 Processes:"
    pm2 list
    
    echo ""
    echo "📁 API Server location:"
    pm2 describe timeline-api | grep "script path"
    
    echo ""
    echo "🗄️  Database status:"
    mysql -u timeline_user -p'Timeline2024!Strong' timeline_db -e "SELECT COUNT(*) as civs FROM civilizations; SELECT COUNT(*) as events FROM events; SELECT COUNT(*) as cells FROM cell_data;"
    
    echo ""
    echo "📝 Recent API logs:"
    pm2 logs timeline-api --lines 10 --nostream
else
    echo "❌ Not on VPS - need to SSH first"
    echo "Run: ssh root@31.42.127.82"
fi

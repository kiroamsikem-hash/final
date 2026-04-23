#!/bin/bash

# Western Anatolia Timeline - VPS Deployment Script
# Usage: bash vps-deploy.sh

echo "🚀 Starting deployment..."

# 1. Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# 4. Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# 5. Create project directory
echo "📁 Creating project directory..."
sudo mkdir -p /var/www/western-anatolia
cd /var/www/western-anatolia

# 6. Copy project files (you need to upload them first)
echo "📂 Please upload your expo folder to /var/www/western-anatolia/"
echo "Press Enter when ready..."
read

# 7. Install dependencies
echo "📦 Installing dependencies..."
cd expo
npm install --legacy-peer-deps

# 8. Build for web
echo "🔨 Building for web..."
npx expo export:web

# 9. Install serve
echo "📦 Installing serve..."
sudo npm install -g serve

# 10. Start with PM2
echo "🚀 Starting application..."
pm2 start "serve dist -s -l 3000" --name western-anatolia
pm2 startup
pm2 save

# 11. Configure Nginx
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/sites-available/western-anatolia > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/western-anatolia /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 12. Configure firewall
echo "🔒 Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

echo "✅ Deployment complete!"
echo "🌐 Your app is now running at: http://$(curl -s ifconfig.me)"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: pm2 logs western-anatolia"
echo "  - Restart app: pm2 restart western-anatolia"
echo "  - Stop app: pm2 stop western-anatolia"
echo "  - Check status: pm2 status"

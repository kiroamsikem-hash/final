# 🚀 Western Anatolia Timeline - VPS Deployment Guide

## 📋 Gereksinimler

- VPS (Ubuntu 20.04+ veya Debian)
- En az 2GB RAM
- Root veya sudo erişimi
- Domain (opsiyonel, IP ile de çalışır)

## 🎯 Hızlı Kurulum

### Yöntem 1: Otomatik Script (Önerilen)

```bash
# 1. VPS'e bağlan
ssh root@your-vps-ip

# 2. Script'i yükle
wget https://your-repo/vps-deploy.sh
chmod +x vps-deploy.sh

# 3. Çalıştır
bash vps-deploy.sh
```

### Yöntem 2: Manuel Kurulum

#### 1. VPS'e Bağlan
```bash
ssh root@your-vps-ip
```

#### 2. Node.js Kur
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. PM2 ve Nginx Kur
```bash
sudo npm install -g pm2
sudo apt install nginx -y
```

#### 4. Projeyi Yükle
```bash
# Git ile
cd /var/www
git clone https://github.com/yourusername/your-repo.git
cd your-repo/expo

# Veya SCP ile
# scp -r expo/ root@your-vps-ip:/var/www/western-anatolia/
```

#### 5. Build Et
```bash
cd /var/www/western-anatolia/expo
npm install --legacy-peer-deps
npx expo export:web
```

#### 6. Express Kur ve Başlat
```bash
# Express'i kur
npm install express --legacy-peer-deps

# PM2 ile başlat
pm2 start server.js --name western-anatolia
pm2 startup
pm2 save
```

#### 7. Nginx Yapılandır
```bash
sudo nano /etc/nginx/sites-available/western-anatolia
```

İçerik:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # veya _ (tüm domainler için)

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktif et:
```bash
sudo ln -s /etc/nginx/sites-available/western-anatolia /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. Firewall Ayarla
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable
```

## 🔒 SSL Sertifikası (HTTPS)

```bash
# Certbot kur
sudo apt install certbot python3-certbot-nginx -y

# Sertifika al
sudo certbot --nginx -d your-domain.com

# Otomatik yenileme
sudo certbot renew --dry-run
```

## 📱 Mobil Uygulama İçin

VPS sadece web uygulamasını host eder. Mobil için:

### Seçenek 1: Expo Go (Test)
```bash
# Local'de çalıştır
npx expo start --tunnel
```

### Seçenek 2: EAS Build (Production)
```bash
# APK/IPA oluştur
eas build --platform all
```

## 🛠️ Yönetim Komutları

```bash
# Logları görüntüle
pm2 logs western-anatolia

# Uygulamayı yeniden başlat
pm2 restart western-anatolia

# Uygulamayı durdur
pm2 stop western-anatolia

# Durum kontrolü
pm2 status

# Nginx yeniden başlat
sudo systemctl restart nginx

# Nginx durumu
sudo systemctl status nginx
```

## 🔄 Güncelleme

```bash
# 1. Yeni kodu çek
cd /var/www/western-anatolia/expo
git pull

# 2. Bağımlılıkları güncelle
npm install --legacy-peer-deps

# 3. Yeniden build et
npx expo export:web

# 4. Uygulamayı yeniden başlat
pm2 restart western-anatolia
```

## 🗄️ Database Bağlantısı

VPS'inizde zaten Google Cloud SQL kullanıyorsunuz:
- Host: 34.159.138.77
- Database: timeline_db

### Güvenlik Önerileri:
1. Google Cloud SQL'de firewall kuralı ekleyin (sadece VPS IP'si)
2. SSL/TLS bağlantısı kullanın
3. Güçlü şifre kullanın
4. Environment variables kullanın

```bash
# .env dosyası oluştur
nano /var/www/western-anatolia/expo/.env
```

İçerik:
```
DB_HOST=34.159.138.77
DB_USER=root
DB_PASSWORD=your-strong-password
DB_NAME=timeline_db
```

## 🌐 Erişim

- **Web**: http://your-vps-ip veya http://your-domain.com
- **HTTPS**: https://your-domain.com (SSL kurulumundan sonra)

## ❓ Sorun Giderme

### Uygulama çalışmıyor
```bash
pm2 logs western-anatolia
```

### Nginx hatası
```bash
sudo nginx -t
sudo systemctl status nginx
```

### Port zaten kullanımda
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Database bağlantı hatası
```bash
# MySQL bağlantısını test et
mysql -h 34.159.138.77 -u root -p timeline_db
```

## 📊 Performans İyileştirme

### 1. Nginx Cache
```nginx
# /etc/nginx/sites-available/western-anatolia
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. Gzip Sıkıştırma
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 3. PM2 Cluster Mode
```bash
pm2 start "serve dist -s -l 3000" --name western-anatolia -i max
```

## 🎉 Tamamlandı!

Uygulamanız artık VPS'de çalışıyor! 🚀

**Erişim**: http://$(curl -s ifconfig.me)

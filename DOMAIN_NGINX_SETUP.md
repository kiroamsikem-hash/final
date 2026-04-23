# 🌐 Domain ve Nginx Yapılandırma Kılavuzu

## Domain: anatoliarchieve.info

### 1️⃣ DNS Ayarları

Domain sağlayıcınızın (GoDaddy, Namecheap, vb.) DNS yönetim panelinden:

```
A Record:
Name: @
Value: 31.42.127.82
TTL: 3600 (veya Auto)

A Record (www için):
Name: www
Value: 31.42.127.82
TTL: 3600 (veya Auto)
```

**Not:** DNS değişikliklerinin yayılması 5 dakika ile 48 saat arasında sürebilir.

### 2️⃣ DNS Kontrolü

DNS'in yayılıp yayılmadığını kontrol edin:

```bash
# Linux/Mac
dig anatoliarchieve.info
nslookup anatoliarchieve.info

# Windows
nslookup anatoliarchieve.info

# Online araç
# https://dnschecker.org adresinden kontrol edebilirsiniz
```

### 3️⃣ Nginx Yapılandırması

VPS'e bağlanın ve Nginx'i yapılandırın:

```bash
ssh root@31.42.127.82

# Nginx yapılandırma dosyası oluştur
nano /etc/nginx/sites-available/anatoliarchieve
```

Aşağıdaki içeriği yapıştırın:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name anatoliarchieve.info www.anatoliarchieve.info;

    # Gzip sıkıştırma
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static dosyalar için cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Kaydet ve çık (Ctrl+X, Y, Enter).

### 4️⃣ Nginx'i Aktif Et

```bash
# Sembolik link oluştur
ln -s /etc/nginx/sites-available/anatoliarchieve /etc/nginx/sites-enabled/

# Varsayılan siteyi kaldır (eğer varsa)
rm /etc/nginx/sites-enabled/default

# Nginx yapılandırmasını test et
nginx -t

# Nginx'i yeniden başlat
systemctl restart nginx

# Nginx durumunu kontrol et
systemctl status nginx
```

### 5️⃣ Firewall Ayarları

```bash
# HTTP (80) ve HTTPS (443) portlarını aç
ufw allow 'Nginx Full'

# Port 3000'i kapat (artık gerek yok, Nginx proxy kullanıyoruz)
ufw delete allow 3000

# Firewall durumunu kontrol et
ufw status
```

### 6️⃣ SSL Sertifikası (HTTPS)

Let's Encrypt ile ücretsiz SSL sertifikası:

```bash
# Certbot kur
apt install certbot python3-certbot-nginx -y

# SSL sertifikası al (otomatik Nginx yapılandırması)
certbot --nginx -d anatoliarchieve.info -d www.anatoliarchieve.info

# E-posta adresinizi girin
# Şartları kabul edin (Y)
# Redirect seçeneğini seçin (2)

# Otomatik yenileme testi
certbot renew --dry-run
```

Certbot otomatik olarak Nginx yapılandırmanızı güncelleyecek ve HTTP'den HTTPS'e yönlendirme ekleyecektir.

### 7️⃣ Test

```bash
# HTTP testi
curl -I http://anatoliarchieve.info

# HTTPS testi (SSL kurulumundan sonra)
curl -I https://anatoliarchieve.info

# PM2 durumu
pm2 status

# Nginx logları
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 8️⃣ Erişim

- **HTTP**: http://anatoliarchieve.info
- **HTTPS**: https://anatoliarchieve.info (SSL kurulumundan sonra)
- **www**: http://www.anatoliarchieve.info

## 🔄 Güncelleme Sonrası

Her kod güncellemesinden sonra:

```bash
cd /var/www/western-anatolia/expo
git pull
npm install --legacy-peer-deps
npx expo export --platform web
pm2 restart western-anatolia
```

Nginx'i yeniden başlatmaya gerek yok (sadece Nginx yapılandırmasını değiştirdiyseniz).

## 🛠️ Sorun Giderme

### Domain çalışmıyor
```bash
# DNS kontrolü
nslookup anatoliarchieve.info

# Nginx durumu
systemctl status nginx

# Nginx yapılandırma testi
nginx -t
```

### SSL hatası
```bash
# Certbot logları
journalctl -u certbot

# Manuel yenileme
certbot renew --force-renewal
```

### 502 Bad Gateway
```bash
# PM2 durumu kontrol et
pm2 status
pm2 logs western-anatolia

# Uygulamayı yeniden başlat
pm2 restart western-anatolia
```

### Port 3000 hala açık
```bash
# Port 3000'i kapat
ufw delete allow 3000
ufw reload
```

## 📊 Performans İyileştirme

Nginx yapılandırmasına ekleyebileceğiniz ek optimizasyonlar:

```nginx
# /etc/nginx/nginx.conf içine ekleyin (http bloğuna)

# Bağlantı sayısını artır
worker_connections 2048;

# Keepalive timeout
keepalive_timeout 65;

# Client body size
client_max_body_size 20M;

# Buffer sizes
client_body_buffer_size 128k;
client_header_buffer_size 1k;
large_client_header_buffers 4 16k;
```

## ✅ Tamamlandı!

Artık uygulamanız **https://anatoliarchieve.info** adresinden erişilebilir! 🎉


# Deployment Guide

This guide covers deploying the Library Management System to production environments on both Windows and Linux servers.

## Table of Contents
- [Production Requirements](#production-requirements)
- [Windows Server Deployment](#windows-server-deployment)
- [Linux Server Deployment](#linux-server-deployment)
- [Docker Deployment](#docker-deployment)
- [Security Hardening](#security-hardening)
- [Performance Optimization](#performance-optimization)
- [Monitoring and Maintenance](#monitoring-and-maintenance)

## Production Requirements

### Minimum System Requirements
- **CPU**: 2 cores, 2.4 GHz
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 20 GB available space
- **Network**: Stable internet connection

### Software Requirements
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **PHP**: 8.0+ with required extensions
- **Database**: MariaDB 10.5+ or MySQL 8.0+
- **Node.js**: 16+ (for building frontend)
- **SSL Certificate**: For HTTPS (recommended)

---

## Windows Server Deployment

### Step 1: Install IIS or Apache

#### Option A: IIS (Internet Information Services)
```powershell
# Enable IIS features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer
Enable-WindowsOptionalFeature -Online -FeatureName IIS-CommonHttpFeatures
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpErrors
Enable-WindowsOptionalFeature -Online -FeatureName IIS-HttpLogging
```

#### Option B: Apache (via XAMPP for Windows)
1. Download XAMPP for Windows
2. Install to `C:\xampp`
3. Configure as Windows Service

### Step 2: Install PHP
```powershell
# Download PHP from php.net
# Extract to C:\php
# Add to PATH environment variable
```

### Step 3: Install MariaDB/MySQL
```powershell
# Download MariaDB MSI installer
# Install with custom configuration
# Set root password
# Create production database
```

### Step 4: Configure Web Server

#### IIS Configuration
```xml
<!-- web.config -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="API Routes" stopProcessing="true">
                    <match url="^api/(.*)$" />
                    <action type="Rewrite" url="backend/api/{R:1}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

#### Apache Configuration
```apache
# httpd.conf or .htaccess
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot "C:/inetpub/wwwroot/library-management"
    
    <Directory "C:/inetpub/wwwroot/library-management">
        AllowOverride All
        Require all granted
    </Directory>
    
    # Redirect API calls
    RewriteEngine On
    RewriteRule ^api/(.*)$ backend/api/$1 [L]
</VirtualHost>
```

### Step 5: Deploy Application Files
```powershell
# Copy files to web directory
Copy-Item -Recurse ".\backend" "C:\inetpub\wwwroot\library-management\"
Copy-Item -Recurse ".\frontend\dist" "C:\inetpub\wwwroot\library-management\public"
```

### Step 6: Build and Deploy Frontend
```powershell
cd frontend
npm ci --production
npm run build

# Copy dist files to web server
Copy-Item -Recurse ".\dist\*" "C:\inetpub\wwwroot\library-management\public\"
```

---

## Linux Server Deployment

### Step 1: Update System and Install Dependencies
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y apache2 php8.1 php8.1-mysql php8.1-mysqli php8.1-json php8.1-curl php8.1-mbstring mariadb-server nodejs npm

# CentOS/RHEL
sudo yum update -y
sudo yum install -y httpd php php-mysql php-json php-curl php-mbstring mariadb-server nodejs npm
```

### Step 2: Configure Apache
```bash
# Enable Apache
sudo systemctl enable apache2
sudo systemctl start apache2

# Create virtual host
sudo nano /etc/apache2/sites-available/library-management.conf
```

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/html/library-management/public
    
    <Directory /var/www/html/library-management>
        AllowOverride All
        Require all granted
    </Directory>
    
    # API routing
    Alias /api /var/www/html/library-management/backend/api
    
    <Directory /var/www/html/library-management/backend/api>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/library-management_error.log
    CustomLog ${APACHE_LOG_DIR}/library-management_access.log combined
</VirtualHost>
```

```bash
# Enable site and modules
sudo a2ensite library-management.conf
sudo a2enmod rewrite
sudo systemctl reload apache2
```

### Step 3: Configure MariaDB
```bash
# Secure installation
sudo mysql_secure_installation

# Create production database
sudo mysql -u root -p
```

```sql
CREATE DATABASE library_management_prod;
CREATE USER 'library_prod'@'localhost' IDENTIFIED BY 'secure_production_password';
GRANT ALL PRIVILEGES ON library_management_prod.* TO 'library_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Deploy Application
```bash
# Create application directory
sudo mkdir -p /var/www/html/library-management
cd /var/www/html/library-management

# Clone or copy application files
sudo git clone <repository-url> .
# OR
sudo cp -r /path/to/source/* .

# Set permissions
sudo chown -R www-data:www-data /var/www/html/library-management
sudo chmod -R 755 /var/www/html/library-management
sudo chmod -R 775 /var/www/html/library-management/backend/logs  # if logs directory exists
```

### Step 5: Build Frontend
```bash
cd frontend
npm ci --production
npm run build

# Move built files to public directory
sudo mkdir -p ../public
sudo cp -r dist/* ../public/
```

### Step 6: Import Database
```bash
mysql -u library_prod -p library_management_prod < database/schema.sql
mysql -u library_prod -p library_management_prod < database/sample_data.sql
```

---

## Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_BASE_URL=http://backend/api
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - DB_HOST=database
      - DB_USERNAME=library_user
      - DB_PASSWORD=library_password
      - DB_DATABASE=library_management
    depends_on:
      - database
    volumes:
      - ./backend:/var/www/html

  database:
    image: mariadb:10.9
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=library_management
      - MYSQL_USER=library_user
      - MYSQL_PASSWORD=library_password
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./database/sample_data.sql:/docker-entrypoint-initdb.d/02-sample_data.sql
    ports:
      - "3306:3306"

volumes:
  db_data:
```

### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM php:8.1-apache

# Install PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache modules
RUN a2enmod rewrite

# Copy application files
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

EXPOSE 80
```

### Deploy with Docker
```bash
# Build and start containers
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## Security Hardening

### 1. SSL/TLS Configuration

#### Let's Encrypt (Linux)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache

# Obtain certificate
sudo certbot --apache -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Windows IIS
1. Purchase SSL certificate or use self-signed for testing
2. Install certificate in IIS Manager
3. Configure HTTPS binding

### 2. PHP Security Configuration

Edit `php.ini`:
```ini
# Hide PHP version
expose_php = Off

# Disable dangerous functions
disable_functions = exec,passthru,shell_exec,system,proc_open,popen

# Session security
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1

# File upload limits
file_uploads = On
upload_max_filesize = 2M
max_file_uploads = 20

# Error handling
display_errors = Off
log_errors = On
error_log = /var/log/php/error.log
```

### 3. Database Security
```sql
-- Remove test databases
DROP DATABASE IF EXISTS test;

-- Create limited user for application
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON library_management.* TO 'app_user'@'localhost';

-- Remove unnecessary privileges
REVOKE ALL PRIVILEGES ON *.* FROM 'app_user'@'localhost';
```

### 4. Web Server Security

#### Apache Security Headers
```apache
# Add to .htaccess or virtual host
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
```

### 5. Firewall Configuration

#### Linux (UFW)
```bash
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3306/tcp   # MySQL (block external access)
```

#### Windows Firewall
```powershell
# Allow HTTP and HTTPS
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## Performance Optimization

### 1. PHP Optimization

#### OPcache Configuration
```ini
# php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
```

### 2. Database Optimization

#### MariaDB Configuration
```ini
# /etc/mysql/mariadb.conf.d/50-server.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_type = 1
query_cache_size = 64M
max_connections = 100
```

#### Database Indexing
```sql
-- Add indexes for better performance
CREATE INDEX idx_books_category ON BOOKS(Category);
CREATE INDEX idx_books_author ON BOOKS(Author);
CREATE INDEX idx_records_status_date ON RECORDS(Status, Date_Borrowed);
CREATE INDEX idx_student_course_year ON STUDENT(Course, Year);
```

### 3. Frontend Optimization

#### Build Optimization
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-slot', 'lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### 4. Caching Strategy

#### Apache Caching
```apache
# .htaccess
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

## Monitoring and Maintenance

### 1. Log Management

#### Application Logs
```php
// backend/config/logging.php
error_log("API Error: " . $message, 3, "/var/log/library-management/api.log");
```

#### Log Rotation (Linux)
```bash
# /etc/logrotate.d/library-management
/var/log/library-management/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
```

### 2. Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup-database.sh

DB_NAME="library_management_prod"
DB_USER="library_prod"
DB_PASS="secure_production_password"
BACKUP_DIR="/var/backups/library-management"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Database backup completed: backup_$DATE.sql"
```

#### Cron Job
```bash
# Add to crontab
0 2 * * * /path/to/backup-database.sh
```

### 3. Health Monitoring

#### Simple Health Check Script
```bash
#!/bin/bash
# health-check.sh

# Check web server
if curl -f -s http://localhost/api/books/index.php > /dev/null; then
    echo "✓ Web server is running"
else
    echo "✗ Web server is down"
    # Send alert email or restart service
fi

# Check database
if mysql -u library_prod -p$DB_PASS -e "SELECT 1" library_management_prod > /dev/null 2>&1; then
    echo "✓ Database is accessible"
else
    echo "✗ Database connection failed"
fi
```

### 4. Performance Monitoring

#### System Resource Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor disk usage
df -h

# Monitor memory usage
free -h

# Monitor active connections
netstat -an | grep :80 | wc -l
```

---

## Troubleshooting Production Issues

### Common Issues

1. **500 Internal Server Error**
   - Check Apache/PHP error logs
   - Verify file permissions
   - Check PHP configuration

2. **Database Connection Failed**
   - Verify database credentials
   - Check database service status
   - Test connection manually

3. **API CORS Errors**
   - Update CORS configuration for production domain
   - Check Apache/Nginx configuration

4. **Frontend Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify build environment variables

### Emergency Recovery

#### Service Restart Commands
```bash
# Linux
sudo systemctl restart apache2
sudo systemctl restart mariadb

# Windows
net stop apache2.4
net start apache2.4
net stop mysql
net start mysql
```

#### Database Recovery
```bash
# Restore from backup
mysql -u library_prod -p library_management_prod < /var/backups/library-management/backup_latest.sql
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Test all functionality in staging environment
- [ ] Update production configuration files
- [ ] Backup existing database and files
- [ ] Prepare rollback plan

### Deployment
- [ ] Deploy backend files
- [ ] Build and deploy frontend
- [ ] Run database migrations
- [ ] Update configuration files
- [ ] Set proper file permissions

### Post-Deployment
- [ ] Test all major functionality
- [ ] Check error logs
- [ ] Verify SSL certificate
- [ ] Test backup procedures
- [ ] Monitor system performance

### Security Verification
- [ ] SSL/TLS configuration
- [ ] Firewall rules
- [ ] Database security
- [ ] File permissions
- [ ] Security headers

This deployment guide ensures a secure, performant, and maintainable production environment for the Library Management System on both Windows and Linux platforms.

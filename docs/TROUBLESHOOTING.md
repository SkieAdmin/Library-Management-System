# Troubleshooting Guide

This guide helps resolve common issues when setting up and running the Library Management System on Windows and Linux platforms.

## Table of Contents
- [Installation Issues](#installation-issues)
- [Database Problems](#database-problems)
- [Backend API Issues](#backend-api-issues)
- [Frontend Problems](#frontend-problems)
- [Authentication Issues](#authentication-issues)
- [Performance Issues](#performance-issues)
- [Platform-Specific Issues](#platform-specific-issues)

---

## Installation Issues

### Node.js and npm Problems

#### Issue: `npm install` fails with permission errors (Linux)
```bash
# Solution: Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Alternative: Use node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Issue: `npm install` fails with EACCES errors (Windows)
```cmd
# Solution: Run as Administrator or fix npm permissions
npm config set prefix %APPDATA%\npm
```

#### Issue: Package compatibility errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json  # Linux
rmdir /s node_modules & del package-lock.json  # Windows
npm cache clean --force
npm install
```

### Web Server Issues

#### Issue: Apache won't start (Port 80 in use)
**Windows:**
```cmd
# Check what's using port 80
netstat -ano | findstr :80

# Stop IIS if running
net stop was /y
net stop w3svc
```

**Linux:**
```bash
# Check port usage
sudo netstat -tulpn | grep :80
sudo lsof -i :80

# Stop conflicting services
sudo systemctl stop nginx  # if nginx is running
```

#### Issue: PHP not working with Apache
**Windows (XAMPP):**
- Verify PHP is enabled in XAMPP Control Panel
- Check `httpd.conf` for PHP module loading
- Restart Apache service

**Linux:**
```bash
# Install PHP Apache module
sudo apt install libapache2-mod-php8.1

# Enable PHP module
sudo a2enmod php8.1
sudo systemctl restart apache2

# Test PHP
echo "<?php phpinfo(); ?>" | sudo tee /var/www/html/test.php
```

---

## Database Problems

### Connection Issues

#### Issue: "Connection failed: Access denied"
```php
// Check database credentials in backend/config/database.php
private $host = "localhost";
private $username = "root";  // Verify username
private $password = "";      // Verify password
private $database = "library_management";  // Verify database exists
```

**Solutions:**
```sql
-- Create user and grant permissions
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON library_management.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Issue: "Unknown database 'library_management'"
```sql
-- Create the database
CREATE DATABASE library_management;
USE library_management;

-- Import schema
SOURCE /path/to/database/schema.sql;
SOURCE /path/to/database/sample_data.sql;
```

#### Issue: MySQL/MariaDB won't start
**Windows (XAMPP):**
- Check if port 3306 is in use
- Reset MySQL password in XAMPP
- Check MySQL error log in `xampp/mysql/data/`

**Linux:**
```bash
# Check service status
sudo systemctl status mariadb

# Check error logs
sudo tail -f /var/log/mysql/error.log

# Reset root password
sudo mysql_secure_installation
```

### Import/Export Issues

#### Issue: "MySQL server has gone away" during import
```bash
# Increase MySQL timeout settings
mysql -u root -p -e "SET GLOBAL max_allowed_packet=1073741824;"
mysql -u root -p -e "SET GLOBAL wait_timeout=28800;"

# Import with extended timeout
mysql --max_allowed_packet=1G -u root -p library_management < schema.sql
```

#### Issue: Character encoding problems
```sql
-- Set proper charset
ALTER DATABASE library_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- For existing tables
ALTER TABLE STUDENT CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE BOOKS CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE RECORDS CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Backend API Issues

### CORS Errors

#### Issue: "Access to fetch blocked by CORS policy"
**Solution:** Update `backend/config/cors.php`
```php
// For development
header("Access-Control-Allow-Origin: http://localhost:8077");

// For production (replace with your domain)
header("Access-Control-Allow-Origin: https://yourdomain.com");

// For multiple origins
$allowed_origins = [
    'http://localhost:8077',
    'https://yourdomain.com'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}
```

### API Endpoint Issues

#### Issue: 404 Not Found for API endpoints
**Apache .htaccess solution:**
```apache
# Create .htaccess in backend/api/
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

**Nginx solution:**
```nginx
location /api/ {
    try_files $uri $uri/ /api/index.php?$query_string;
}
```

#### Issue: PHP errors not showing
```php
// Add to top of PHP files for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

### Session Issues

#### Issue: Sessions not persisting
```php
// Check session configuration
session_start();
if (session_status() !== PHP_SESSION_ACTIVE) {
    die('Sessions not working');
}

// Check session save path
echo "Session save path: " . session_save_path();
```

**Solutions:**
```php
// Set custom session path
session_save_path('/tmp/sessions');
if (!is_dir('/tmp/sessions')) {
    mkdir('/tmp/sessions', 0777, true);
}
```

---

## Frontend Problems

### Build Issues

#### Issue: "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check for missing dependencies
npm ls
```

#### Issue: Vite build fails
```bash
# Check Node.js version
node --version  # Should be 16+

# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Runtime Issues

#### Issue: "Cannot read property of undefined"
**Common causes:**
1. API response structure mismatch
2. Missing error handling
3. State initialization issues

**Debug solution:**
```javascript
// Add error boundaries and logging
useEffect(() => {
  console.log('Component state:', { user, loading, error });
}, [user, loading, error]);

// Add null checks
if (!user) {
  return <div>Loading...</div>;
}
```

#### Issue: API calls failing
```javascript
// Check API configuration
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Add request/response interceptors
api.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### Styling Issues

#### Issue: Tailwind CSS not working
```bash
# Verify Tailwind installation
npm list tailwindcss

# Check tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}

# Rebuild CSS
npm run build
```

---

## Authentication Issues

### Login Problems

#### Issue: "Invalid email or password" with correct credentials
**Check password hashing:**
```php
// Verify password hash in database
$password = 'password123';
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "Hash: $hash\n";
echo "Verify: " . (password_verify($password, $hash) ? 'true' : 'false');
```

**Update sample data with correct hashes:**
```sql
-- Update passwords with proper hashes
UPDATE STUDENT SET Password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE Email = 'admin@university.edu';
```

#### Issue: Session not maintaining login state
```php
// Check session configuration
// In backend/utils/auth.php
session_start();
session_set_cookie_params([
    'lifetime' => 3600,
    'path' => '/',
    'domain' => '',
    'secure' => false,  // Set to true for HTTPS
    'httponly' => true,
    'samesite' => 'Lax'
]);
```

### Role-Based Access Issues

#### Issue: Admin routes accessible to students
```javascript
// Check ProtectedRoute component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute check:', { user, adminOnly });
  
  if (adminOnly && user?.Role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};
```

---

## Performance Issues

### Slow API Responses

#### Issue: Database queries taking too long
```sql
-- Add indexes for better performance
CREATE INDEX idx_books_search ON BOOKS(Book_Name, Author);
CREATE INDEX idx_student_search ON STUDENT(FirstName, LastName, Email);
CREATE INDEX idx_records_student_status ON RECORDS(Student_Id, Status);

-- Analyze slow queries
SHOW PROCESSLIST;
```

#### Issue: Large payload responses
```php
// Implement pagination
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 20;
$offset = ($page - 1) * $limit;

$sql = "SELECT * FROM BOOKS LIMIT $limit OFFSET $offset";
```

### Memory Issues

#### Issue: PHP memory limit exceeded
```php
// Increase memory limit
ini_set('memory_limit', '256M');

// Or in php.ini
memory_limit = 256M
```

#### Issue: Frontend bundle too large
```javascript
// Implement code splitting in vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
});
```

---

## Platform-Specific Issues

### Windows Issues

#### Issue: Path separator problems
```php
// Use DIRECTORY_SEPARATOR constant
$path = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'database.php';

// Or use forward slashes (works on both platforms)
$path = dirname(__FILE__) . '/config/database.php';
```

#### Issue: File permissions in XAMPP
```cmd
# Run XAMPP as Administrator
# Or adjust folder permissions in Windows Explorer
```

#### Issue: Antivirus blocking Apache
- Add XAMPP folder to antivirus exclusions
- Temporarily disable real-time protection during setup

### Linux Issues

#### Issue: Permission denied errors
```bash
# Fix web server permissions
sudo chown -R www-data:www-data /var/www/html/library-management
sudo chmod -R 755 /var/www/html/library-management

# Fix session directory permissions
sudo chmod 777 /var/lib/php/sessions
```

#### Issue: SELinux blocking connections
```bash
# Check SELinux status
sestatus

# Allow Apache to connect to network
sudo setsebool -P httpd_can_network_connect 1

# Allow Apache to write to files
sudo setsebool -P httpd_unified 1
```

#### Issue: Firewall blocking connections
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## Debugging Tools and Commands

### Backend Debugging

#### PHP Error Logging
```php
// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php_errors.log');

// Custom logging function
function debug_log($message) {
    error_log(date('Y-m-d H:i:s') . " - DEBUG: " . $message);
}
```

#### Database Query Debugging
```php
// Log MySQL queries
$query = "SELECT * FROM BOOKS WHERE Book_Name LIKE ?";
error_log("Executing query: $query");

if (!$stmt = $db->prepare($query)) {
    error_log("Prepare failed: " . $db->error);
}
```

### Frontend Debugging

#### React Developer Tools
- Install React Developer Tools browser extension
- Use Components and Profiler tabs

#### Network Debugging
```javascript
// Log all API requests
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(request => {
  console.log('🚀 Request:', {
    method: request.method,
    url: request.url,
    data: request.data
  });
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.data);
    return response;
  },
  error => {
    console.error('❌ Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);
```

### System Debugging

#### Check Service Status
```bash
# Linux
sudo systemctl status apache2
sudo systemctl status mariadb
sudo journalctl -u apache2 -f

# Windows
net start | findstr Apache
net start | findstr MySQL
```

#### Monitor Resource Usage
```bash
# Linux
htop
iotop
df -h
free -h

# Windows
tasklist
wmic process get name,processid,percentprocessortime
```

---

## Getting Help

### Log Files Locations

#### Windows (XAMPP)
- Apache: `C:\xampp\apache\logs\error.log`
- PHP: `C:\xampp\php\logs\php_error_log`
- MySQL: `C:\xampp\mysql\data\*.err`

#### Linux
- Apache: `/var/log/apache2/error.log`
- PHP: `/var/log/php_errors.log`
- MySQL: `/var/log/mysql/error.log`
- System: `/var/log/syslog`

### Useful Commands

#### Check Configuration
```bash
# PHP configuration
php -i | grep -i config
php -m  # List loaded modules

# Apache configuration
apache2ctl -t  # Test configuration
apache2ctl -S  # Show virtual hosts

# MySQL configuration
mysql --help | grep -A 1 'Default options'
```

#### Test Connectivity
```bash
# Test database connection
mysql -u username -p -h localhost -e "SELECT 1"

# Test web server
curl -I http://localhost/
curl -X POST http://localhost/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'
```

### Community Support

1. **GitHub Issues**: Create detailed issue reports
2. **Stack Overflow**: Search for similar problems
3. **Documentation**: Check official docs for technologies used
4. **Forums**: PHP, React, MySQL community forums

### Creating Bug Reports

Include the following information:
1. **Environment**: OS, PHP version, Node.js version
2. **Error Messages**: Complete error messages and stack traces
3. **Steps to Reproduce**: Detailed steps that led to the issue
4. **Expected vs Actual**: What should happen vs what actually happens
5. **Logs**: Relevant log entries
6. **Configuration**: Relevant configuration files (sanitized)

This troubleshooting guide should help resolve most common issues encountered during setup and operation of the Library Management System.

# Installation Guide

This guide provides step-by-step instructions for setting up the Library Management System on both Windows and Linux platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Windows Installation](#windows-installation)
- [Linux Installation](#linux-installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Verification](#verification)

## Prerequisites

### Common Requirements
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control

### Platform-Specific Requirements

#### Windows
- **XAMPP** - [Download](https://www.apachefriends.org/download.html)
  - Includes Apache, PHP, and MariaDB/MySQL
- **Visual Studio Code** (recommended) - [Download](https://code.visualstudio.com/)

#### Linux (Ubuntu/Debian)
- **Apache2** web server
- **PHP 8.0+** with required extensions
- **MariaDB** or **MySQL**
- **Composer** (optional, for PHP dependencies)

---

## Windows Installation

### Step 1: Install XAMPP

1. **Download XAMPP**
   ```
   https://www.apachefriends.org/download.html
   ```

2. **Install XAMPP**
   - Run the installer as Administrator
   - Choose installation directory (default: `C:\xampp`)
   - Select components: Apache, MySQL, PHP, phpMyAdmin

3. **Start Services**
   - Open XAMPP Control Panel
   - Start **Apache** and **MySQL** services
   - Verify services are running (green status)

### Step 2: Setup Project Directory

1. **Navigate to htdocs**
   ```cmd
   cd C:\xampp\htdocs
   ```

2. **Clone or Copy Project**
   ```cmd
   git clone <repository-url> Library-Management-System
   # OR copy the project folder manually
   ```

3. **Verify Directory Structure**
   ```
   C:\xampp\htdocs\Library-Management-System\
   ├── frontend/
   ├── backend/
   ├── database/
   └── docs/
   ```

### Step 3: Install Node.js Dependencies

1. **Open Command Prompt or PowerShell**
   ```cmd
   cd C:\xampp\htdocs\Library-Management-System\frontend
   ```

2. **Install Dependencies**
   ```cmd
   npm install
   ```

### Step 4: Database Setup (Windows)

1. **Open phpMyAdmin**
   - Navigate to: http://localhost/phpmyadmin
   - Login with default credentials (usually no password)

2. **Create Database**
   - Click "New" to create a database
   - Name: `library_management`
   - Collation: `utf8mb4_general_ci`

3. **Import Schema**
   - Select the `library_management` database
   - Go to "Import" tab
   - Choose file: `database/schema.sql`
   - Click "Go"

4. **Import Sample Data**
   - Go to "Import" tab again
   - Choose file: `database/sample_data.sql`
   - Click "Go"

---

## Linux Installation

### Step 1: Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install LAMP Stack

#### Install Apache
```bash
sudo apt install apache2 -y
sudo systemctl start apache2
sudo systemctl enable apache2
```

#### Install PHP
```bash
sudo apt install php php-mysql php-mysqli php-json php-curl php-mbstring -y
```

#### Install MariaDB
```bash
sudo apt install mariadb-server -y
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql_secure_installation
```

### Step 3: Configure Apache

1. **Enable PHP Module**
   ```bash
   sudo a2enmod php8.1  # or your PHP version
   sudo systemctl restart apache2
   ```

2. **Set Permissions**
   ```bash
   sudo chown -R www-data:www-data /var/www/html
   sudo chmod -R 755 /var/www/html
   ```

### Step 4: Setup Project Directory

1. **Navigate to Web Root**
   ```bash
   cd /var/www/html
   ```

2. **Clone Project**
   ```bash
   sudo git clone <repository-url> Library-Management-System
   sudo chown -R www-data:www-data Library-Management-System
   ```

3. **Install Node.js (if not installed)**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd Library-Management-System/frontend
   npm install
   ```

### Step 5: Database Setup (Linux)

1. **Access MariaDB**
   ```bash
   sudo mysql -u root -p
   ```

2. **Create Database and User**
   ```sql
   CREATE DATABASE library_management;
   CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON library_management.* TO 'library_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Import Schema**
   ```bash
   mysql -u library_user -p library_management < database/schema.sql
   ```

4. **Import Sample Data**
   ```bash
   mysql -u library_user -p library_management < database/sample_data.sql
   ```

---

## Database Setup

### Schema Overview

The system uses three main tables:

#### STUDENT Table
```sql
CREATE TABLE STUDENT (
    Student_Id INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Year VARCHAR(10) NOT NULL,
    Course VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('student', 'admin') DEFAULT 'student',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### BOOKS Table
```sql
CREATE TABLE BOOKS (
    Book_Id INT AUTO_INCREMENT PRIMARY KEY,
    Book_Name VARCHAR(200) NOT NULL,
    Author VARCHAR(100) NOT NULL,
    Year_Published YEAR NOT NULL,
    ISBN VARCHAR(20) UNIQUE,
    Available_Copies INT DEFAULT 1,
    Total_Copies INT DEFAULT 1,
    Category VARCHAR(50),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### RECORDS Table
```sql
CREATE TABLE RECORDS (
    Record_Id INT AUTO_INCREMENT PRIMARY KEY,
    Student_Id INT NOT NULL,
    Book_Id INT NOT NULL,
    Date_Borrowed DATE NOT NULL,
    Date_Due DATE NOT NULL,
    Date_Returned DATE NULL,
    Status ENUM('borrowed', 'returned', 'overdue') DEFAULT 'borrowed',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Student_Id) REFERENCES STUDENT(Student_Id) ON DELETE CASCADE,
    FOREIGN KEY (Book_Id) REFERENCES BOOKS(Book_Id) ON DELETE CASCADE
);
```

---

## Configuration

### Backend Configuration

#### Windows (XAMPP)
Edit `backend/config/database.php`:
```php
private $host = "localhost";
private $username = "root";
private $password = "";  // Usually empty for XAMPP
private $database = "library_management";
```

#### Linux
Edit `backend/config/database.php`:
```php
private $host = "localhost";
private $username = "library_user";
private $password = "secure_password";
private $database = "library_management";
```

### Frontend Configuration

Edit `frontend/src/services/api.js`:

#### Windows
```javascript
const API_BASE_URL = 'http://localhost/Library-Management-System/backend/api';
```

#### Linux
```javascript
const API_BASE_URL = 'http://localhost/Library-Management-System/backend/api';
// or your server IP: 'http://YOUR_SERVER_IP/Library-Management-System/backend/api'
```

### Environment Variables (Optional)

Create `.env` files for better configuration management:

#### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost/Library-Management-System/backend/api
VITE_APP_NAME=Library Management System
```

#### Backend `.env` (if implementing)
```env
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=library_management
```

---

## Running the Application

### Windows

1. **Start XAMPP Services**
   - Open XAMPP Control Panel
   - Start Apache and MySQL

2. **Start Frontend Development Server**
   ```cmd
   cd C:\xampp\htdocs\Library-Management-System\frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:8077
   - Backend API: http://localhost/Library-Management-System/backend/api

### Linux

1. **Start Services**
   ```bash
   sudo systemctl start apache2
   sudo systemctl start mariadb
   ```

2. **Start Frontend Development Server**
   ```bash
   cd /var/www/html/Library-Management-System/frontend
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:8077
   - Backend API: http://localhost/Library-Management-System/backend/api

---

## Verification

### Test Backend API

1. **Test Database Connection**
   ```bash
   # Windows
   curl http://localhost/Library-Management-System/backend/api/books/index.php
   
   # Linux
   curl http://localhost/Library-Management-System/backend/api/books/index.php
   ```

2. **Expected Response**
   ```json
   {
     "success": true,
     "message": "Success",
     "data": [...]
   }
   ```

### Test Frontend

1. **Open Browser**
   - Navigate to: http://localhost:8077

2. **Login with Demo Account**
   - **Admin**: admin@university.edu / password123
   - **Student**: john.doe@university.edu / password123

3. **Verify Features**
   - Dashboard loads correctly
   - Navigation works
   - API calls succeed

### Common Test URLs

- **Frontend**: http://localhost:8077
- **Backend API**: http://localhost/Library-Management-System/backend/api
- **Books API**: http://localhost/Library-Management-System/backend/api/books/index.php
- **phpMyAdmin** (Windows): http://localhost/phpmyadmin

---

## Quick Setup Scripts

### Windows Batch Script (`setup-windows.bat`)

```batch
@echo off
echo Setting up Library Management System on Windows...

echo Checking if XAMPP is running...
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Apache is running
) else (
    echo Please start Apache in XAMPP Control Panel
    pause
)

echo Installing frontend dependencies...
cd frontend
npm install

echo Setup complete! 
echo 1. Import database/schema.sql and database/sample_data.sql in phpMyAdmin
echo 2. Run 'npm run dev' in the frontend directory
echo 3. Access http://localhost:8077
pause
```

### Linux Setup Script (`setup-linux.sh`)

```bash
#!/bin/bash

echo "Setting up Library Management System on Linux..."

# Check if running as root for system packages
if [[ $EUID -eq 0 ]]; then
   echo "Don't run this script as root for the entire process"
   echo "Run: chmod +x setup-linux.sh && ./setup-linux.sh"
   exit 1
fi

# Install system dependencies
echo "Installing system dependencies..."
sudo apt update
sudo apt install -y apache2 php php-mysql php-mysqli mariadb-server nodejs npm

# Start services
echo "Starting services..."
sudo systemctl start apache2
sudo systemctl start mariadb
sudo systemctl enable apache2
sudo systemctl enable mariadb

# Setup database
echo "Setting up database..."
echo "Please run the following commands manually:"
echo "sudo mysql -u root -p"
echo "CREATE DATABASE library_management;"
echo "CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'your_password';"
echo "GRANT ALL PRIVILEGES ON library_management.* TO 'library_user'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Setup complete!"
echo "1. Complete database setup manually"
echo "2. Import database/schema.sql and database/sample_data.sql"
echo "3. Update backend/config/database.php with your credentials"
echo "4. Run 'npm run dev' in the frontend directory"
echo "5. Access http://localhost:8077"
```

Make the script executable:
```bash
chmod +x setup-linux.sh
./setup-linux.sh
```

---

## Next Steps

After successful installation:

1. **Read the [API Documentation](API.md)**
2. **Check [Deployment Guide](DEPLOYMENT.md)** for production setup
3. **Review [Troubleshooting Guide](TROUBLESHOOTING.md)** for common issues
4. **See [Development Guide](DEVELOPMENT.md)** for contributing

For support, create an issue in the repository or check the troubleshooting section.

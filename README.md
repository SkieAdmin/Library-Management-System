# Library Management System

A full-stack Library Management System built with React (Frontend), PHP (Backend), and MariaDB (Database).

## Features

### Student Features
- **Dashboard**: View library statistics and recent books
- **Browse Books**: Search and filter available books
- **Borrow Books**: Borrow available books with due dates
- **My Books**: View borrowed books and return them
- **Book Search**: Search by title, author, ISBN, or category

### Admin Features
- **Admin Dashboard**: Comprehensive library overview and statistics
- **Book Management**: Full CRUD operations for books
- **Student Management**: Add and manage student accounts
- **Borrowing Records**: View and manage all borrowing activities
- **Analytics**: Track library usage and overdue books

## Technology Stack

- **Frontend**: React 19 + Vite + shadcn/ui + Tailwind CSS
- **Backend**: PHP with native mysqli (no PDO)
- **Database**: MariaDB
- **Authentication**: Session-based with role management
- **API**: RESTful endpoints with CORS support

## Project Structure

```
Library-Management-System/
├── frontend/                 # React frontend (Port: 8077)
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Student/     # Student dashboard components
│   │   │   ├── Admin/       # Admin dashboard components
│   │   │   ├── Layout/      # Layout components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── contexts/        # React contexts
│   │   └── services/        # API services
│   └── package.json
├── backend/                 # PHP backend API
│   ├── api/                # API endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── books/          # Books management
│   │   ├── students/       # Student management
│   │   └── records/        # Borrowing records
│   ├── config/             # Configuration files
│   └── utils/              # Utility functions
└── database/               # Database files
    ├── schema.sql          # Database schema
    └── sample_data.sql     # Sample data
```

## Setup Instructions

### Prerequisites
- **XAMPP** or **WAMP** (Apache + PHP + MariaDB/MySQL)
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### 1. Database Setup

1. Start Apache and MySQL/MariaDB in XAMPP/WAMP
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create the database and tables:
   ```sql
   -- Run the contents of database/schema.sql
   -- Then run database/sample_data.sql for sample data
   ```

### 2. Backend Setup

1. Copy the `backend` folder to your web server directory:
   ```
   C:\xampp\htdocs\Library-Management-System\backend\
   ```

2. Update database configuration in `backend/config/database.php`:
   ```php
   private $host = "localhost";
   private $username = "root";        // Your MySQL username
   private $password = "";            // Your MySQL password
   private $database = "library_management";
   ```

3. Test the API endpoints:
   - http://localhost/Library-Management-System/backend/api/books/index.php

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API base URL in `src/services/api.js` if needed:
   ```javascript
   const API_BASE_URL = 'http://localhost/Library-Management-System/backend/api';
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:8077 in your browser

## Demo Accounts

### Admin Account
- **Email**: admin@university.edu
- **Password**: password123

### Student Account
- **Email**: john.doe@university.edu
- **Password**: password123

## API Endpoints

### Authentication
- `POST /api/auth/login.php` - User login
- `POST /api/auth/logout.php` - User logout
- `GET /api/auth/me.php` - Get current user

### Books
- `GET /api/books/index.php` - Get all books
- `POST /api/books/index.php` - Create book (Admin only)
- `GET /api/books/{id}.php` - Get book by ID
- `PUT /api/books/{id}.php` - Update book (Admin only)
- `DELETE /api/books/{id}.php` - Delete book (Admin only)

### Students
- `GET /api/students/index.php` - Get all students (Admin only)
- `POST /api/students/index.php` - Create student (Admin only)

### Records
- `GET /api/records/index.php` - Get borrowing records
- `POST /api/records/index.php` - Borrow book
- `POST /api/records/return.php` - Return book

## Database Schema

### STUDENT Table
- `Student_Id` (Primary Key, Auto Increment)
- `FirstName`, `LastName`, `Year`, `Course`
- `Email` (Unique), `Password`, `Role`
- `Created_At`

### BOOKS Table
- `Book_Id` (Primary Key, Auto Increment)
- `Book_Name`, `Author`, `Year_Published`
- `ISBN` (Unique), `Available_Copies`, `Total_Copies`
- `Category`, `Created_At`

### RECORDS Table
- `Record_Id` (Primary Key, Auto Increment)
- `Student_Id` (Foreign Key), `Book_Id` (Foreign Key)
- `Date_Borrowed`, `Date_Due`, `Date_Returned`
- `Status` (borrowed/returned/overdue)
- `Created_At`

## Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
- PHP files are served directly by Apache
- Make sure to restart Apache after configuration changes
- Check Apache error logs for debugging

## Security Features

- **Password Hashing**: Using PHP's `password_hash()` and `password_verify()`
- **SQL Injection Prevention**: Using prepared statements with mysqli
- **Session Management**: Secure session handling
- **CORS Configuration**: Proper CORS headers for API access
- **Input Validation**: Both frontend and backend validation

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS headers are properly set in PHP files
2. **Database Connection**: Check database credentials and server status
3. **API 404 Errors**: Verify Apache is running and paths are correct
4. **Frontend Build Issues**: Clear node_modules and reinstall dependencies

### Error Logs
- **Apache**: Check XAMPP/WAMP error logs
- **PHP**: Enable error reporting in development
- **Frontend**: Check browser console for JavaScript errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please create an issue in the repository or contact the development team.

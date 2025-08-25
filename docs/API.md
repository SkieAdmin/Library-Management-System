# API Documentation

This document provides comprehensive information about the Library Management System API endpoints.

## Base URL

```
http://localhost/Library-Management-System/backend/api
```

## Authentication

The API uses session-based authentication. After login, the session cookie is automatically included in subsequent requests.

### Headers

All API requests should include:
```
Content-Type: application/json
```

For CORS requests from the frontend:
```
Access-Control-Allow-Origin: http://localhost:8077
Access-Control-Allow-Credentials: true
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {...} // Optional validation errors
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `405` - Method Not Allowed
- `422` - Validation Error
- `500` - Internal Server Error

---

## Authentication Endpoints

### Login
**POST** `/auth/login.php`

Authenticate user and create session.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "Student_Id": 1,
      "FirstName": "John",
      "LastName": "Doe",
      "Email": "john.doe@university.edu",
      "Role": "student",
      "Year": "2024",
      "Course": "Computer Science"
    }
  }
}
```

### Logout
**POST** `/auth/logout.php`

Destroy user session.

#### Response
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

### Get Current User
**GET** `/auth/me.php`

Get current authenticated user information.

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "role": "student",
    "name": "John Doe",
    "email": "john.doe@university.edu"
  }
}
```

---

## Books Endpoints

### Get All Books
**GET** `/books/index.php`

Retrieve all books with optional filtering.

#### Query Parameters
- `search` (string) - Search by title, author, or ISBN
- `category` (string) - Filter by category
- `available_only` (boolean) - Show only available books

#### Example Request
```
GET /books/index.php?search=algorithm&available_only=true
```

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "Book_Id": 1,
      "Book_Name": "Introduction to Algorithms",
      "Author": "Thomas H. Cormen",
      "Year_Published": 2009,
      "ISBN": "978-0262033848",
      "Available_Copies": 3,
      "Total_Copies": 5,
      "Category": "Computer Science",
      "Created_At": "2024-08-25 10:00:00"
    }
  ]
}
```

### Get Book by ID
**GET** `/books/{id}.php`

Retrieve a specific book by ID.

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "Book_Id": 1,
    "Book_Name": "Introduction to Algorithms",
    "Author": "Thomas H. Cormen",
    "Year_Published": 2009,
    "ISBN": "978-0262033848",
    "Available_Copies": 3,
    "Total_Copies": 5,
    "Category": "Computer Science",
    "Created_At": "2024-08-25 10:00:00"
  }
}
```

### Create Book
**POST** `/books/index.php`

Create a new book (Admin only).

#### Request Body
```json
{
  "Book_Name": "Clean Code",
  "Author": "Robert C. Martin",
  "Year_Published": 2008,
  "ISBN": "978-0132350884",
  "Total_Copies": 3,
  "Category": "Programming"
}
```

#### Response
```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "Book_Id": 11,
    "Book_Name": "Clean Code",
    "Author": "Robert C. Martin",
    "Year_Published": 2008,
    "ISBN": "978-0132350884",
    "Available_Copies": 3,
    "Total_Copies": 3,
    "Category": "Programming",
    "Created_At": "2024-08-25 16:00:00"
  }
}
```

### Update Book
**PUT** `/books/{id}.php`

Update an existing book (Admin only).

#### Request Body
```json
{
  "Book_Name": "Clean Code - Updated",
  "Total_Copies": 5
}
```

#### Response
```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "Book_Id": 11,
    "Book_Name": "Clean Code - Updated",
    "Author": "Robert C. Martin",
    "Year_Published": 2008,
    "ISBN": "978-0132350884",
    "Available_Copies": 5,
    "Total_Copies": 5,
    "Category": "Programming",
    "Created_At": "2024-08-25 16:00:00"
  }
}
```

### Delete Book
**DELETE** `/books/{id}.php`

Delete a book (Admin only).

#### Response
```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": null
}
```

---

## Students Endpoints

### Get All Students
**GET** `/students/index.php`

Retrieve all students (Admin only).

#### Query Parameters
- `search` (string) - Search by name or email
- `course` (string) - Filter by course
- `year` (string) - Filter by year

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "Student_Id": 1,
      "FirstName": "John",
      "LastName": "Doe",
      "Year": "2024",
      "Course": "Computer Science",
      "Email": "john.doe@university.edu",
      "Role": "student",
      "Created_At": "2024-08-25 10:00:00"
    }
  ]
}
```

### Create Student
**POST** `/students/index.php`

Create a new student account (Admin only).

#### Request Body
```json
{
  "FirstName": "Jane",
  "LastName": "Smith",
  "Year": "2023",
  "Course": "Information Technology",
  "Email": "jane.smith@university.edu",
  "Password": "password123",
  "Role": "student"
}
```

#### Response
```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "Student_Id": 6,
    "FirstName": "Jane",
    "LastName": "Smith",
    "Year": "2023",
    "Course": "Information Technology",
    "Email": "jane.smith@university.edu",
    "Role": "student",
    "Created_At": "2024-08-25 16:30:00"
  }
}
```

---

## Records Endpoints

### Get All Records
**GET** `/records/index.php`

Retrieve borrowing records.

#### Query Parameters
- `status` (string) - Filter by status: `borrowed`, `returned`, `overdue`
- `student_id` (int) - Filter by student ID (Admin only)

#### Behavior
- **Students**: Can only see their own records
- **Admins**: Can see all records

#### Response
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "Record_Id": 1,
      "Student_Id": 1,
      "Book_Id": 1,
      "Date_Borrowed": "2024-08-01",
      "Date_Due": "2024-08-15",
      "Date_Returned": "2024-08-14",
      "Status": "returned",
      "Created_At": "2024-08-01 10:00:00",
      "FirstName": "John",
      "LastName": "Doe",
      "Email": "john.doe@university.edu",
      "Course": "Computer Science",
      "Book_Name": "Introduction to Algorithms",
      "Author": "Thomas H. Cormen",
      "ISBN": "978-0262033848"
    }
  ]
}
```

### Borrow Book
**POST** `/records/index.php`

Create a new borrowing record.

#### Request Body
```json
{
  "Book_Id": 1,
  "Student_Id": 2  // Optional, Admin can borrow for other students
}
```

#### Response
```json
{
  "success": true,
  "message": "Book borrowed successfully",
  "data": {
    "Record_Id": 8,
    "Student_Id": 1,
    "Book_Id": 1,
    "Date_Borrowed": "2024-08-25",
    "Date_Due": "2024-09-08",
    "Date_Returned": null,
    "Status": "borrowed",
    "Created_At": "2024-08-25 16:45:00",
    "Book_Name": "Introduction to Algorithms",
    "Author": "Thomas H. Cormen",
    "FirstName": "John",
    "LastName": "Doe"
  }
}
```

### Return Book
**POST** `/records/return.php`

Return a borrowed book.

#### Request Body
```json
{
  "Record_Id": 8
}
```

#### Response
```json
{
  "success": true,
  "message": "Book returned successfully",
  "data": {
    "Record_Id": 8,
    "Date_Returned": "2024-08-25",
    "Book_Name": "Introduction to Algorithms"
  }
}
```

---

## Error Handling

### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "Book_Name": "Book name is required",
    "Author": "Author is required"
  }
}
```

### Authentication Errors
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### Not Found Errors
```json
{
  "success": false,
  "message": "Book not found"
}
```

### Business Logic Errors
```json
{
  "success": false,
  "message": "Book is not available for borrowing"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing rate limiting to prevent abuse.

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:8077` (Frontend development server)

For production, update the CORS configuration in `backend/config/cors.php`.

## Security Considerations

1. **Password Hashing**: Uses PHP's `password_hash()` with default algorithm
2. **SQL Injection Prevention**: All queries use prepared statements
3. **Session Security**: Sessions are properly managed and destroyed on logout
4. **Input Validation**: Both client-side and server-side validation
5. **Role-based Access**: Endpoints are protected based on user roles

## Testing the API

### Using cURL

#### Login
```bash
curl -X POST http://localhost/Library-Management-System/backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"password123"}' \
  -c cookies.txt
```

#### Get Books (with session)
```bash
curl -X GET http://localhost/Library-Management-System/backend/api/books/index.php \
  -b cookies.txt
```

### Using Postman

1. **Import Collection**: Create a Postman collection with all endpoints
2. **Set Base URL**: Configure environment variable for base URL
3. **Handle Sessions**: Use Postman's cookie jar for session management

### Using Frontend

The React frontend automatically handles authentication and API calls through the `services/api.js` module.

---

## Changelog

### Version 1.0.0
- Initial API implementation
- Authentication endpoints
- Books CRUD operations
- Students management
- Borrowing records system
- Session-based authentication
- Role-based access control

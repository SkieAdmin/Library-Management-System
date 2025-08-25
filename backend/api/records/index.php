<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getRecords();
        break;
    case 'POST':
        createRecord();
        break;
    default:
        sendError("Method not allowed", 405);
}

function getRecords() {
    requireAuth();
    
    try {
        $db = new Database();
        $user = getCurrentUser();
        
        // Build query based on user role
        if ($user['role'] === 'admin') {
            // Admin can see all records
            $sql = "SELECT r.Record_Id, r.Student_Id, r.Book_Id, r.Date_Borrowed, r.Date_Due, r.Date_Returned, r.Status, r.Created_At,
                           s.FirstName, s.LastName, s.Email, s.Course,
                           b.Book_Name, b.Author, b.ISBN
                    FROM RECORDS r
                    JOIN STUDENT s ON r.Student_Id = s.Student_Id
                    JOIN BOOKS b ON r.Book_Id = b.Book_Id";
            
            // Add filters
            $conditions = [];
            $params = [];
            $types = '';
            
            if (isset($_GET['status']) && !empty($_GET['status'])) {
                $conditions[] = "r.Status = ?";
                $params[] = $_GET['status'];
                $types .= 's';
            }
            
            if (isset($_GET['student_id']) && !empty($_GET['student_id'])) {
                $conditions[] = "r.Student_Id = ?";
                $params[] = (int)$_GET['student_id'];
                $types .= 'i';
            }
            
            if (!empty($conditions)) {
                $sql .= " WHERE " . implode(" AND ", $conditions);
            }
            
            $sql .= " ORDER BY r.Date_Borrowed DESC";
            
        } else {
            // Students can only see their own records
            $sql = "SELECT r.Record_Id, r.Student_Id, r.Book_Id, r.Date_Borrowed, r.Date_Due, r.Date_Returned, r.Status, r.Created_At,
                           b.Book_Name, b.Author, b.ISBN, b.Category
                    FROM RECORDS r
                    JOIN BOOKS b ON r.Book_Id = b.Book_Id
                    WHERE r.Student_Id = ?";
            
            $params = [$user['id']];
            $types = 'i';
            
            if (isset($_GET['status']) && !empty($_GET['status'])) {
                $sql .= " AND r.Status = ?";
                $params[] = $_GET['status'];
                $types .= 's';
            }
            
            $sql .= " ORDER BY r.Date_Borrowed DESC";
        }
        
        if (!empty($params)) {
            $stmt = $db->prepare($sql);
            if ($stmt) {
                mysqli_stmt_bind_param($stmt, $types, ...$params);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);
            } else {
                sendError("Database error", 500);
            }
        } else {
            $result = $db->query($sql);
        }
        
        if (!$result) {
            sendError("Failed to fetch records", 500);
        }
        
        $records = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $records[] = $row;
        }
        
        sendSuccess($records);
        
    } catch (Exception $e) {
        sendError("Failed to fetch records: " . $e->getMessage(), 500);
    }
}

function createRecord() {
    requireAuth();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError("Invalid JSON input", 400);
    }
    
    // Validate required fields
    if (!isset($input['Book_Id']) || empty($input['Book_Id'])) {
        sendValidationError(['Book_Id' => 'Book ID is required']);
    }
    
    $user = getCurrentUser();
    $book_id = (int)$input['Book_Id'];
    $student_id = $user['id'];
    
    // Admin can borrow for other students
    if ($user['role'] === 'admin' && isset($input['Student_Id'])) {
        $student_id = (int)$input['Student_Id'];
    }
    
    try {
        $db = new Database();
        
        // Check if book exists and is available
        $stmt = $db->prepare("SELECT Book_Id, Book_Name, Available_Copies FROM BOOKS WHERE Book_Id = ?");
        mysqli_stmt_bind_param($stmt, "i", $book_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (!$result || mysqli_num_rows($result) === 0) {
            sendError("Book not found", 404);
        }
        
        $book = mysqli_fetch_assoc($result);
        
        if ($book['Available_Copies'] <= 0) {
            sendError("Book is not available for borrowing", 400);
        }
        
        // Check if student already has this book borrowed
        $stmt = $db->prepare("SELECT Record_Id FROM RECORDS WHERE Student_Id = ? AND Book_Id = ? AND Status IN ('borrowed', 'overdue')");
        mysqli_stmt_bind_param($stmt, "ii", $student_id, $book_id);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) > 0) {
            sendError("Student already has this book borrowed", 400);
        }
        
        // Calculate due date (14 days from now)
        $date_borrowed = date('Y-m-d');
        $date_due = date('Y-m-d', strtotime('+14 days'));
        
        // Start transaction
        mysqli_begin_transaction($db->getConnection());
        
        try {
            // Insert borrowing record
            $stmt = $db->prepare("INSERT INTO RECORDS (Student_Id, Book_Id, Date_Borrowed, Date_Due, Status) VALUES (?, ?, ?, ?, 'borrowed')");
            mysqli_stmt_bind_param($stmt, "iiss", $student_id, $book_id, $date_borrowed, $date_due);
            
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception("Failed to create borrowing record");
            }
            
            $record_id = $db->lastInsertId();
            
            // Update book available copies
            $stmt = $db->prepare("UPDATE BOOKS SET Available_Copies = Available_Copies - 1 WHERE Book_Id = ?");
            mysqli_stmt_bind_param($stmt, "i", $book_id);
            
            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception("Failed to update book availability");
            }
            
            // Commit transaction
            mysqli_commit($db->getConnection());
            
            // Fetch the created record with book and student details
            $stmt = $db->prepare("SELECT r.*, b.Book_Name, b.Author, s.FirstName, s.LastName 
                                 FROM RECORDS r 
                                 JOIN BOOKS b ON r.Book_Id = b.Book_Id 
                                 JOIN STUDENT s ON r.Student_Id = s.Student_Id 
                                 WHERE r.Record_Id = ?");
            mysqli_stmt_bind_param($stmt, "i", $record_id);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $record = mysqli_fetch_assoc($result);
            
            sendSuccess($record, "Book borrowed successfully");
            
        } catch (Exception $e) {
            mysqli_rollback($db->getConnection());
            throw $e;
        }
        
    } catch (Exception $e) {
        sendError("Failed to borrow book: " . $e->getMessage(), 500);
    }
}
?>

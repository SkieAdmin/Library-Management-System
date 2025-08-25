<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// Get book ID from URL
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));
$bookId = end($pathParts);

if (!is_numeric($bookId)) {
    sendError("Invalid book ID", 400);
}

switch ($method) {
    case 'GET':
        getBook($bookId);
        break;
    case 'PUT':
        updateBook($bookId);
        break;
    case 'DELETE':
        deleteBook($bookId);
        break;
    default:
        sendError("Method not allowed", 405);
}

function getBook($bookId) {
    try {
        $db = new Database();
        
        $stmt = $db->prepare("SELECT * FROM BOOKS WHERE Book_Id = ?");
        mysqli_stmt_bind_param($stmt, "i", $bookId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (!$result || mysqli_num_rows($result) === 0) {
            sendNotFound("Book not found");
        }
        
        $book = mysqli_fetch_assoc($result);
        sendSuccess($book);
        
    } catch (Exception $e) {
        sendError("Failed to fetch book: " . $e->getMessage(), 500);
    }
}

function updateBook($bookId) {
    requireAdmin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError("Invalid JSON input", 400);
    }
    
    try {
        $db = new Database();
        
        // Check if book exists
        $stmt = $db->prepare("SELECT Book_Id FROM BOOKS WHERE Book_Id = ?");
        mysqli_stmt_bind_param($stmt, "i", $bookId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (!$result || mysqli_num_rows($result) === 0) {
            sendNotFound("Book not found");
        }
        
        // Build update query dynamically
        $updateFields = [];
        $params = [];
        $types = '';
        
        $allowedFields = ['Book_Name', 'Author', 'Year_Published', 'ISBN', 'Total_Copies', 'Category'];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $input[$field];
                $types .= ($field === 'Year_Published' || $field === 'Total_Copies') ? 'i' : 's';
            }
        }
        
        if (empty($updateFields)) {
            sendError("No valid fields to update", 400);
        }
        
        // Check ISBN uniqueness if updating ISBN
        if (isset($input['ISBN']) && !empty($input['ISBN'])) {
            $stmt = $db->prepare("SELECT Book_Id FROM BOOKS WHERE ISBN = ? AND Book_Id != ?");
            mysqli_stmt_bind_param($stmt, "si", $input['ISBN'], $bookId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            
            if (mysqli_num_rows($result) > 0) {
                sendValidationError(['ISBN' => 'ISBN already exists']);
            }
        }
        
        // Update available copies if total copies changed
        if (isset($input['Total_Copies'])) {
            $stmt = $db->prepare("SELECT Total_Copies, Available_Copies FROM BOOKS WHERE Book_Id = ?");
            mysqli_stmt_bind_param($stmt, "i", $bookId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $currentBook = mysqli_fetch_assoc($result);
            
            $borrowedCopies = $currentBook['Total_Copies'] - $currentBook['Available_Copies'];
            $newAvailableCopies = max(0, $input['Total_Copies'] - $borrowedCopies);
            
            $updateFields[] = "Available_Copies = ?";
            $params[] = $newAvailableCopies;
            $types .= 'i';
        }
        
        $params[] = $bookId;
        $types .= 'i';
        
        $sql = "UPDATE BOOKS SET " . implode(', ', $updateFields) . " WHERE Book_Id = ?";
        $stmt = $db->prepare($sql);
        
        if (!$stmt) {
            sendError("Database error", 500);
        }
        
        mysqli_stmt_bind_param($stmt, $types, ...$params);
        
        if (mysqli_stmt_execute($stmt)) {
            // Fetch updated book
            $stmt = $db->prepare("SELECT * FROM BOOKS WHERE Book_Id = ?");
            mysqli_stmt_bind_param($stmt, "i", $bookId);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $book = mysqli_fetch_assoc($result);
            
            sendSuccess($book, "Book updated successfully");
        } else {
            sendError("Failed to update book", 500);
        }
        
    } catch (Exception $e) {
        sendError("Failed to update book: " . $e->getMessage(), 500);
    }
}

function deleteBook($bookId) {
    requireAdmin();
    
    try {
        $db = new Database();
        
        // Check if book exists
        $stmt = $db->prepare("SELECT Book_Id FROM BOOKS WHERE Book_Id = ?");
        mysqli_stmt_bind_param($stmt, "i", $bookId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (!$result || mysqli_num_rows($result) === 0) {
            sendNotFound("Book not found");
        }
        
        // Check if book has active borrowing records
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM RECORDS WHERE Book_Id = ? AND Status IN ('borrowed', 'overdue')");
        mysqli_stmt_bind_param($stmt, "i", $bookId);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        
        if ($row['count'] > 0) {
            sendError("Cannot delete book with active borrowing records", 400);
        }
        
        // Delete the book
        $stmt = $db->prepare("DELETE FROM BOOKS WHERE Book_Id = ?");
        mysqli_stmt_bind_param($stmt, "i", $bookId);
        
        if (mysqli_stmt_execute($stmt)) {
            sendSuccess(null, "Book deleted successfully");
        } else {
            sendError("Failed to delete book", 500);
        }
        
    } catch (Exception $e) {
        sendError("Failed to delete book: " . $e->getMessage(), 500);
    }
}
?>

<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Method not allowed", 405);
}

requireAuth();

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['Record_Id'])) {
    sendValidationError(['Record_Id' => 'Record ID is required']);
}

$record_id = (int)$input['Record_Id'];
$user = getCurrentUser();

try {
    $db = new Database();
    
    // Get record details
    $stmt = $db->prepare("SELECT r.*, b.Book_Name FROM RECORDS r JOIN BOOKS b ON r.Book_Id = b.Book_Id WHERE r.Record_Id = ?");
    mysqli_stmt_bind_param($stmt, "i", $record_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result || mysqli_num_rows($result) === 0) {
        sendNotFound("Record not found");
    }
    
    $record = mysqli_fetch_assoc($result);
    
    // Check permissions (students can only return their own books)
    if ($user['role'] !== 'admin' && $record['Student_Id'] != $user['id']) {
        sendError("You can only return your own books", 403);
    }
    
    // Check if book is already returned
    if ($record['Status'] === 'returned') {
        sendError("Book is already returned", 400);
    }
    
    // Start transaction
    mysqli_begin_transaction($db->getConnection());
    
    try {
        // Update record status and return date
        $return_date = date('Y-m-d');
        $stmt = $db->prepare("UPDATE RECORDS SET Date_Returned = ?, Status = 'returned' WHERE Record_Id = ?");
        mysqli_stmt_bind_param($stmt, "si", $return_date, $record_id);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Failed to update record");
        }
        
        // Update book available copies
        $stmt = $db->prepare("UPDATE BOOKS SET Available_Copies = Available_Copies + 1 WHERE Book_Id = ?");
        mysqli_stmt_bind_param($stmt, "i", $record['Book_Id']);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Failed to update book availability");
        }
        
        // Commit transaction
        mysqli_commit($db->getConnection());
        
        sendSuccess([
            'Record_Id' => $record_id,
            'Date_Returned' => $return_date,
            'Book_Name' => $record['Book_Name']
        ], "Book returned successfully");
        
    } catch (Exception $e) {
        mysqli_rollback($db->getConnection());
        throw $e;
    }
    
} catch (Exception $e) {
    sendError("Failed to return book: " . $e->getMessage(), 500);
}
?>

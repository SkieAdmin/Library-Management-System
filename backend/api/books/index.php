<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getBooks();
        break;
    case 'POST':
        createBook();
        break;
    default:
        sendError("Method not allowed", 405);
}

function getBooks() {
    try {
        $db = new Database();
        
        // Get search and filter parameters
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $category = isset($_GET['category']) ? trim($_GET['category']) : '';
        $available_only = isset($_GET['available_only']) ? $_GET['available_only'] === 'true' : false;
        
        $sql = "SELECT Book_Id, Book_Name, Author, Year_Published, ISBN, Available_Copies, Total_Copies, Category, Created_At FROM BOOKS";
        $conditions = [];
        $params = [];
        $types = '';
        
        if (!empty($search)) {
            $conditions[] = "(Book_Name LIKE ? OR Author LIKE ? OR ISBN LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= 'sss';
        }
        
        if (!empty($category)) {
            $conditions[] = "Category = ?";
            $params[] = $category;
            $types .= 's';
        }
        
        if ($available_only) {
            $conditions[] = "Available_Copies > 0";
        }
        
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $sql .= " ORDER BY Book_Name ASC";
        
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
            sendError("Failed to fetch books", 500);
        }
        
        $books = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $books[] = $row;
        }
        
        sendSuccess($books);
        
    } catch (Exception $e) {
        sendError("Failed to fetch books: " . $e->getMessage(), 500);
    }
}

function createBook() {
    requireAdmin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError("Invalid JSON input", 400);
    }
    
    // Validate required fields
    $required = ['Book_Name', 'Author', 'Year_Published', 'Total_Copies'];
    $errors = [];
    
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . " is required";
        }
    }
    
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    try {
        $db = new Database();
        
        $book_name = trim($input['Book_Name']);
        $author = trim($input['Author']);
        $year_published = (int)$input['Year_Published'];
        $isbn = isset($input['ISBN']) ? trim($input['ISBN']) : null;
        $total_copies = (int)$input['Total_Copies'];
        $category = isset($input['Category']) ? trim($input['Category']) : null;
        
        // Check if ISBN already exists (if provided)
        if ($isbn) {
            $stmt = $db->prepare("SELECT Book_Id FROM BOOKS WHERE ISBN = ?");
            mysqli_stmt_bind_param($stmt, "s", $isbn);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            
            if (mysqli_num_rows($result) > 0) {
                sendValidationError(['ISBN' => 'ISBN already exists']);
            }
        }
        
        // Insert new book
        $sql = "INSERT INTO BOOKS (Book_Name, Author, Year_Published, ISBN, Available_Copies, Total_Copies, Category) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        
        if (!$stmt) {
            sendError("Database error", 500);
        }
        
        mysqli_stmt_bind_param($stmt, "ssissis", $book_name, $author, $year_published, $isbn, $total_copies, $total_copies, $category);
        
        if (mysqli_stmt_execute($stmt)) {
            $book_id = $db->lastInsertId();
            
            // Fetch the created book
            $stmt = $db->prepare("SELECT * FROM BOOKS WHERE Book_Id = ?");
            mysqli_stmt_bind_param($stmt, "i", $book_id);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $book = mysqli_fetch_assoc($result);
            
            sendSuccess($book, "Book created successfully");
        } else {
            sendError("Failed to create book", 500);
        }
        
    } catch (Exception $e) {
        sendError("Failed to create book: " . $e->getMessage(), 500);
    }
}
?>

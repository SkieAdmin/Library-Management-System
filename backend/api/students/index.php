<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getStudents();
        break;
    case 'POST':
        createStudent();
        break;
    default:
        sendError("Method not allowed", 405);
}

function getStudents() {
    requireAdmin();
    
    try {
        $db = new Database();
        
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $course = isset($_GET['course']) ? trim($_GET['course']) : '';
        $year = isset($_GET['year']) ? trim($_GET['year']) : '';
        
        $sql = "SELECT Student_Id, FirstName, LastName, Year, Course, Email, Role, Created_At FROM STUDENT";
        $conditions = [];
        $params = [];
        $types = '';
        
        if (!empty($search)) {
            $conditions[] = "(FirstName LIKE ? OR LastName LIKE ? OR Email LIKE ?)";
            $searchParam = "%$search%";
            $params[] = $searchParam;
            $params[] = $searchParam;
            $params[] = $searchParam;
            $types .= 'sss';
        }
        
        if (!empty($course)) {
            $conditions[] = "Course = ?";
            $params[] = $course;
            $types .= 's';
        }
        
        if (!empty($year)) {
            $conditions[] = "Year = ?";
            $params[] = $year;
            $types .= 's';
        }
        
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
        
        $sql .= " ORDER BY FirstName ASC, LastName ASC";
        
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
            sendError("Failed to fetch students", 500);
        }
        
        $students = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $students[] = $row;
        }
        
        sendSuccess($students);
        
    } catch (Exception $e) {
        sendError("Failed to fetch students: " . $e->getMessage(), 500);
    }
}

function createStudent() {
    requireAdmin();
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        sendError("Invalid JSON input", 400);
    }
    
    // Validate required fields
    $required = ['FirstName', 'LastName', 'Year', 'Course', 'Email', 'Password'];
    $errors = [];
    
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty(trim($input[$field]))) {
            $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . " is required";
        }
    }
    
    // Validate email format
    if (isset($input['Email']) && !filter_var($input['Email'], FILTER_VALIDATE_EMAIL)) {
        $errors['Email'] = "Invalid email format";
    }
    
    // Validate password length
    if (isset($input['Password']) && strlen($input['Password']) < 6) {
        $errors['Password'] = "Password must be at least 6 characters long";
    }
    
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    try {
        $db = new Database();
        
        $firstName = trim($input['FirstName']);
        $lastName = trim($input['LastName']);
        $year = trim($input['Year']);
        $course = trim($input['Course']);
        $email = trim($input['Email']);
        $password = hashPassword($input['Password']);
        $role = isset($input['Role']) && $input['Role'] === 'admin' ? 'admin' : 'student';
        
        // Check if email already exists
        $stmt = $db->prepare("SELECT Student_Id FROM STUDENT WHERE Email = ?");
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if (mysqli_num_rows($result) > 0) {
            sendValidationError(['Email' => 'Email already exists']);
        }
        
        // Insert new student
        $sql = "INSERT INTO STUDENT (FirstName, LastName, Year, Course, Email, Password, Role) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        
        if (!$stmt) {
            sendError("Database error", 500);
        }
        
        mysqli_stmt_bind_param($stmt, "sssssss", $firstName, $lastName, $year, $course, $email, $password, $role);
        
        if (mysqli_stmt_execute($stmt)) {
            $student_id = $db->lastInsertId();
            
            // Fetch the created student (without password)
            $stmt = $db->prepare("SELECT Student_Id, FirstName, LastName, Year, Course, Email, Role, Created_At FROM STUDENT WHERE Student_Id = ?");
            mysqli_stmt_bind_param($stmt, "i", $student_id);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $student = mysqli_fetch_assoc($result);
            
            sendSuccess($student, "Student created successfully");
        } else {
            sendError("Failed to create student", 500);
        }
        
    } catch (Exception $e) {
        sendError("Failed to create student: " . $e->getMessage(), 500);
    }
}
?>

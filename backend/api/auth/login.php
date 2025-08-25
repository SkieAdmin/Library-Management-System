<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Method not allowed", 405);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email']) || !isset($input['password'])) {
    sendValidationError(['email' => 'Email is required', 'password' => 'Password is required']);
}

$email = trim($input['email']);
$password = $input['password'];

if (empty($email) || empty($password)) {
    sendValidationError(['email' => 'Email cannot be empty', 'password' => 'Password cannot be empty']);
}

try {
    $db = new Database();
    
    // Prepare statement to find user by email
    $stmt = $db->prepare("SELECT Student_Id, FirstName, LastName, Email, Password, Role FROM STUDENT WHERE Email = ?");
    if (!$stmt) {
        sendError("Database error", 500);
    }
    
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if (!$result || mysqli_num_rows($result) === 0) {
        sendError("Invalid email or password", 401);
    }
    
    $user = mysqli_fetch_assoc($result);
    
    // Verify password
    if (!verifyPassword($password, $user['Password'])) {
        sendError("Invalid email or password", 401);
    }
    
    // Set session
    setUserSession($user);
    
    // Return user data (without password)
    unset($user['Password']);
    
    sendSuccess([
        'user' => $user,
        'message' => 'Login successful'
    ]);
    
} catch (Exception $e) {
    sendError("Login failed: " . $e->getMessage(), 500);
}
?>

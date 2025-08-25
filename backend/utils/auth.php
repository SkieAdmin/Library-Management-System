<?php
// Authentication utilities
session_start();

function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function isLoggedIn() {
    return isset($_SESSION['user_id']) && isset($_SESSION['user_role']);
}

function requireAuth() {
    if (!isLoggedIn()) {
        sendUnauthorized("Please log in to access this resource");
    }
}

function requireAdmin() {
    requireAuth();
    if ($_SESSION['user_role'] !== 'admin') {
        sendError("Admin access required", 403);
    }
}

function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'role' => $_SESSION['user_role'],
        'name' => $_SESSION['user_name'] ?? '',
        'email' => $_SESSION['user_email'] ?? ''
    ];
}

function setUserSession($user) {
    $_SESSION['user_id'] = $user['Student_Id'];
    $_SESSION['user_role'] = $user['Role'];
    $_SESSION['user_name'] = $user['FirstName'] . ' ' . $user['LastName'];
    $_SESSION['user_email'] = $user['Email'];
}

function clearUserSession() {
    session_unset();
    session_destroy();
}
?>

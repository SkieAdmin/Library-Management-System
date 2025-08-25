<?php
// CORS configuration for the API
function setCorsHeaders() {
    // Allow requests from the frontend
    header("Access-Control-Allow-Origin: http://localhost:8077");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");

    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// Set CORS headers for all API requests
setCorsHeaders();
?>

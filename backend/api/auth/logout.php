<?php
require_once '../../config/cors.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError("Method not allowed", 405);
}

// Clear user session
clearUserSession();

sendSuccess(null, "Logged out successfully");
?>

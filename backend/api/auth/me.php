<?php
require_once '../../config/cors.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError("Method not allowed", 405);
}

requireAuth();

$user = getCurrentUser();
sendSuccess($user);
?>

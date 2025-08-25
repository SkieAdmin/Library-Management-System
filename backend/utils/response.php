<?php
// Utility functions for API responses
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function sendSuccess($data = null, $message = "Success") {
    sendResponse([
        'success' => true,
        'message' => $message,
        'data' => $data
    ], 200);
}

function sendError($message, $statusCode = 400, $errors = null) {
    sendResponse([
        'success' => false,
        'message' => $message,
        'errors' => $errors
    ], $statusCode);
}

function sendUnauthorized($message = "Unauthorized access") {
    sendError($message, 401);
}

function sendNotFound($message = "Resource not found") {
    sendError($message, 404);
}

function sendValidationError($errors) {
    sendError("Validation failed", 422, $errors);
}
?>

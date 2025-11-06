<?php
// path: Wanderlusttrails/Backend/config/auth/validate_token.php

// Allow CORS from frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require_once 'jwt_helper.php'; // Include the JWT helper for token validation
require_once __DIR__ . "/../inc_logger.php";  // Add logging

Logger::log("Token validation endpoint accessed - Method: {$_SERVER['REQUEST_METHOD']}");


// Get the Authorization header from the request
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
Logger::log("Authorization header received: " . ($token ? substr($token, 0, 10) . "..." : 'none'));

// Check if token is provided
if (!$token) {
    echo json_encode(['success' => false, 'message' => 'No token provided']);
    Logger::log("No token provided");
    http_response_code(401); // Unauthorized
    exit;
}

// Validate token using a helper function (JWT decode and verify signature)
$isValid = validateJWT($token); // Implement this function in jwt_helper.php

if ($isValid) {
    echo json_encode(['success' => true, 'message' => 'Token is valid', 'userId' => $isValid->userId, 'exp' => $isValid->exp]);
    Logger::log("Token is valid");
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    http_response_code(401); // Unauthorized
    Logger::log("Invalid token");
}
?>

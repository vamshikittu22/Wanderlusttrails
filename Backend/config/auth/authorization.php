<?php
//path: Wanderlusttrails/Backend/config/auth/authorization.php

require_once __DIR__ . "/../inc_logger.php";
include 'jwt_helper.php';

Logger::log("authorization Started");
// Function to validate JWT token
function authorizeRequest() {
    $headers = apache_request_headers(); // Get all headers from the request
    if (!isset($headers['Authorization'])) { // Check if Authorization header is present
        Logger::log("Authorization header missing");
        echo json_encode(['error' => 'Authorization header missing']);
        exit;
    }
// Check if the token is in the correct format
    $token = str_replace('Bearer ', '', $headers['Authorization']); // Extract token from Bearer scheme
    Logger::log("Validating token: " . substr($token, 0, 10) . "...");
    $decoded = validateJWT($token); // Call the validateJWT function to decode and verify the token

    if ($decoded === null) { // If token is invalid or expired
        Logger::log("Invalid or expired token");
        echo json_encode(['error' => 'Invalid or expired token']); 
        exit;
    }

    Logger::log("Token validated successfully for userId: {$decoded->userId}");
    return $decoded; // Return decoded token data
}
?>

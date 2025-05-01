<?php
//path: Wanderlusttrails/Backend/config/auth/validate_token.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require_once  'jwt_helper.php'; // Include the JWT helper for token validation
// Get the Authorization header
$headers = apache_request_headers();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if (!$token) {
    echo json_encode(['success' => false, 'message' => 'No token provided']);
    http_response_code(401);
    exit;
}

// Validate token (e.g., check against a sessions table or decode JWT)
// This is a placeholder; implement your token validation logic
$isValid = validateJWT($token); // Replace with actual validation

if ($isValid) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid token']);
    http_response_code(401);
}
?>
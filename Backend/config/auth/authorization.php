<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

require_once __DIR__ . "/../inc_logger.php";
include 'jwt_helper.php';

Logger::log("authorization Started");

function authorizeRequest() {
    $headers = apache_request_headers();
    if (!isset($headers['Authorization'])) {
        Logger::log("Authorization header missing");
        echo json_encode(['error' => 'Authorization header missing']);
        exit;
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    Logger::log("Validating token: " . substr($token, 0, 10) . "...");
    $decoded = validateJWT($token);

    if ($decoded === null) {
        Logger::log("Invalid or expired token");
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    Logger::log("Token validated successfully for userId: {$decoded->userId}");
    return $decoded;
}
?>
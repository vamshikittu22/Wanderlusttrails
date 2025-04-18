<?php
//path: Wanderlusttrails/Backend/config/auth/logout.php
// This file handles user logout by destroying the session.
// It returns a JSON response indicating the logout status.

// Allow CORS for development
header("Access-Control-Allow-Origin: http://localhost:5173"); // Adjust to your frontend's origin
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once __DIR__ . "/../inc_logger.php";
Logger::log("logout API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for logout");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

session_start();
session_unset();
session_destroy();

Logger::log("User logged out successfully");
echo json_encode(["success" => true, "message" => "Logged out successfully"]);
?>
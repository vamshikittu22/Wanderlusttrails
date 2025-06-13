<?php
// path: Wanderlusttrails/Backend/config/AdminDashboard/manageUsers/getUsers.php
// Fetches all users for admin.

// Set CORS headers and content type
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php"; // Logger for logging
require_once __DIR__ . "/inc_UsersOpsModel.php"; // UserOpsModel for user operations

Logger::log("getUsers API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle OPTIONS method for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getUsers");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Only allow GET requests for this API
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Instantiate the user operations model
$userOpsModel = new UserOpsModel();
$users = $userOpsModel->getUsers(); // Fetch users from DB

Logger::log("getUsers result: " . (empty($users['data']) ? "No users found" : count($users['data']) . " users"));

if ($users['success']) {
    http_response_code(200);
    echo json_encode($users['data']); // Send users data as JSON response
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $users['message']]); // Send error message JSON
}
exit;
?>

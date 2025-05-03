<?php
//path: Wanderlusttrails/Backend/config/AdminDashboard/manageUsers/getUsers.php
// Fetches all users for admin.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php"; // Logger class for logging
require_once __DIR__ . "/inc_UsersOpsModel.php"; // UserOpsModel class for user operations

Logger::log("getUsers API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS for preflight checks
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getUsers");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}
// create an instance of UserOpsModel and call getUsers method
$userOpsModel = new UserOpsModel(); //instance of UserOpsModel class
$users = $userOpsModel->getUsers(); // Call the getUsers method

Logger::log("getUsers result: " . (empty($users['data']) ? "No users found" : count($users['data']) . " users"));
if ($users['success']) {
    http_response_code(200);
    echo json_encode($users['data']); // Return the users data as JSON
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $users['message']]); // Return the error message as JSON
} 
exit;
?>
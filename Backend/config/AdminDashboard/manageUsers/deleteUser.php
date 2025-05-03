<?php
//path: Wanderlusttrails/Backend/config/AdminDashboard/manageUsers/deleteUser.php
// Deletes a user for admin.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php"; // Logger class for logging
require_once __DIR__ . "/inc_UsersOpsModel.php"; // UserOpsModel class for user operations

Logger::log("deleteUser API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS for preflight checks
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for deleteUser");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}
//rawInput is the raw POST data
$rawInput = file_get_contents("php://input");
Logger::log("Raw input: " . ($rawInput ?: "Empty"));
// Check if the raw input is empty
$data = json_decode($rawInput, true);
if ($data === null) {
    Logger::log("JSON decode failed. Possible malformed JSON.");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON format"]);
    exit;
}
// Check if user_id is present and valid
$userId = $data['user_id'] ?? '';
if (empty($userId) || !is_numeric($userId)) {
    Logger::log("Missing or invalid user_id: " . json_encode($data));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid numeric user ID is required"]);
    exit;
}
// Sanitize user_id to prevent SQL injection
$userId = (int)$userId; // Cast to int
Logger::log("Deleting user_id: $userId");
// Create an instance of UserOpsModel and call deleteUser method
$userOpsModel = new UserOpsModel(); //instance of UserOpsModel class
$result = $userOpsModel->deleteUser($userId); // Call the deleteUser method

Logger::log("deleteUser result for user_id: $userId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);
echo json_encode($result); // Return the result as JSON
exit; 
?>
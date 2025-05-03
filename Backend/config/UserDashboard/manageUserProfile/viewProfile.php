<?php
// Backend/config/UserDashboard/manageUserProfile/viewProfile.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../../inc_logger.php"; // Include the logger file
require_once __DIR__ . "/inc_UserProfileModel.php"; // Include the UserProfileModel file

Logger::log("viewProfile API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for viewProfile");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['userID'])) {
        Logger::log("Missing userID parameter");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "User ID is required"]);
        exit;
    }

    $userId = trim($_GET['userID']); // Sanitize the userID parameter
    Logger::log("Fetching profile for userID: $userId");

    $userProfileModel = new UserProfileModel(); // Create an instance of the UserProfileModel class
    $result = $userProfileModel->viewProfile($userId); // Call the viewProfile method to get the user profile

    Logger::log("viewProfile result for userID: $userId - " . ($result['success'] ? "Success" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : ($result['message'] === "User not found" ? 404 : 400));
    echo json_encode($result); // Return the result as JSON
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]); // Return 405 Method Not Allowed 
exit;
?>
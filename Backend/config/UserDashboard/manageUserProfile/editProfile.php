<?php
// Backend/config/UserDashboard/manageUserProfile/editProfile.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../../inc_logger.php"; //include the logger file
require_once __DIR__ . "/inc_UserProfileModel.php"; //include the UserProfileModel file

Logger::log("editProfile API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for editProfile");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true); // Decode the JSON data from the request body
    Logger::log("POST Data - userID: " . ($data['userID'] ?? 'none'));
// Check if the required fields are present in the request data
    if (!$data || !isset($data['userID']) || !isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email']) || !isset($data['dob']) || !isset($data['gender']) || !isset($data['nationality']) || !isset($data['phone']) || !isset($data['street']) || !isset($data['city']) || !isset($data['state']) || !isset($data['zip'])) {
        Logger::log("Missing required fields");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit;
    }
// Sanitize and validate the input data
    $userId = trim($data['userID']);
    $firstName = trim($data['firstName']);
    $lastName = trim($data['lastName']);
    $email = trim($data['email']);
    $dob = trim($data['dob']);
    $gender = trim($data['gender']);
    $nationality = trim($data['nationality']);
    $phone = trim($data['phone']);
    $street = trim($data['street']);
    $city = trim($data['city']);
    $state = trim($data['state']);
    $zip = trim($data['zip']);

    $userProfileModel = new UserProfileModel(); // Create an instance of the UserProfileModel class
    $result = $userProfileModel->updateProfile($userId, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip); // Call the updateProfile method to update the user profile

    Logger::log("editProfile result for userID: $userId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result); // Return the result as JSON
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);  // Return 405 Method Not Allowed
exit;
?>
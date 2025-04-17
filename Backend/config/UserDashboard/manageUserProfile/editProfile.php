<?php
// Backend/config/UserDashboard/manageUserProfile/editProfile.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/inc_UserProfileModel.php";

Logger::log("editProfile API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for editProfile");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - userID: " . ($data['userID'] ?? 'none'));

    if (!$data || !isset($data['userID']) || !isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email']) || !isset($data['dob']) || !isset($data['gender']) || !isset($data['nationality']) || !isset($data['phone']) || !isset($data['street']) || !isset($data['city']) || !isset($data['state']) || !isset($data['zip'])) {
        Logger::log("Missing required fields");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit;
    }

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

    $userProfileModel = new UserProfileModel();
    $result = $userProfileModel->updateProfile($userId, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);

    Logger::log("editProfile result for userID: $userId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>
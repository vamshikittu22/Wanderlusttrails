<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include("./inc_UserProfileModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $userId = $data['userID'] ?? '';
    $firstName = $data['firstName'] ?? '';
    $lastName = $data['lastName'] ?? '';
    $email = $data['email'] ?? '';
    $dob = $data['dob'] ?? '';
    $gender = $data['gender'] ?? '';
    $nationality = $data['nationality'] ?? '';
    $phone = $data['phone'] ?? '';
    $street = $data['street'] ?? '';
    $city = $data['city'] ?? '';
    $state = $data['state'] ?? '';
    $zip = $data['zip'] ?? '';

    $userProfileModel = new UserProfileModel();
    $result = $userProfileModel->updateProfile($userId, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);
    echo json_encode($result);
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>
<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// This file handles user registration by accepting POST requests with user data.
// It validates the data, encrypts the password, and stores the user information in the database.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
Logger::log("signupuser API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for signupuser");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_userModel.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Email: " . ($data['email'] ?? 'none') . ", FirstName: " . ($data['firstName'] ?? 'none'));

    // Validate incoming data
    if (!$data || !isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email']) || !isset($data['password'])) {
        Logger::log("Missing required fields: " . json_encode(array_keys($data)));
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "First name, last name, email, and password are required"]);
        exit;
    }

    $firstName = trim($data['firstName']);
    $lastName = trim($data['lastName']);
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    $dob = trim($data['dob'] ?? '');
    $gender = trim($data['gender'] ?? '');
    $nationality = trim($data['nationality'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $street = trim($data['street'] ?? '');
    $city = trim($data['city'] ?? '');
    $state = trim($data['state'] ?? '');
    $zip = trim($data['zip'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Logger::log("Invalid email format: $email");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email format"]);
        exit;
    }

    // Instantiate UserModel
    $userModel = new UserModel();
    $result = $userModel->registerUser($firstName, $lastName, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);

    Logger::log("signupuser result for email: $email - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result);
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>
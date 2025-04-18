<?php
//path: Wanderlusttrails/Backend/config/auth/login.php
// This file handles user login by validating credentials and generating a JWT token.
// It returns a JSON response with user details and token on success.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/jwt_helper.php";

Logger::log("login API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for login");
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none'));

    if (!$data || !isset($data['identifier']) || !isset($data['password'])) {
        Logger::log("Missing identifier or password");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Identifier and password are required"]);
        exit;
    }

    $identifier = $data['identifier'];
    $password = $data['password'];

    $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

    if (!$isEmail && !$isPhone) {
        Logger::log("Invalid email or phone format: $identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email or phone format"]);
        exit;
    }

    $db = new DatabaseClass();

    $query = "SELECT id, firstname, lastname, email, phone, password, role, dob, gender, nationality, street, city, state, zip 
              FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?");
    $result = $db->fetchQuery($query, "s", $identifier);

    if (empty($result)) {
        Logger::log("User not found for identifier: $identifier");
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $user = $result[0];

    if (!password_verify($password, $user['password'])) {
        Logger::log("Incorrect password for identifier: $identifier");
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect password"]);
        exit;
    }

    $token = generateJWT($user['id']);
    Logger::log("Login successful for user_id: {$user['id']}");

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "token" => $token,
        "id" => $user['id'],
        "firstname" => $user['firstname'],
        "lastname" => $user['lastname'],
        "email" => $user['email'],
        "phone" => $user['phone'],
        "role" => $user['role'],
        "dob" => $user['dob'],
        "gender" => $user['gender'],
        "nationality" => $user['nationality'],
        "street" => $user['street'],
        "city" => $user['city'],
        "state" => $user['state'],
        "zip" => $user['zip']
    ]);
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>
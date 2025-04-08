<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_databaseClass.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['identifier']) || !isset($data['currentPassword'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Identifier and current password are required"]);
        exit;
    }

    $identifier = $data['identifier'];
    $currentPassword = $data['currentPassword'];

    $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

    if (!$isEmail && !$isPhone) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email or phone format"]);
        exit;
    }

    $db = new DatabaseClass();

    $query = "SELECT password FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?");
    $user = $db->fetchQuery($query, "s", $identifier);

    if (empty($user)) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    if (password_verify($currentPassword, $user[0]['password'])) {
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Password verified"]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect current password"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>
<?php
// updateUserRole.php

header("Access-Control-Allow-Origin: http://localhost:5173"); // Allow the frontend origin
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// If the request is an OPTIONS request (preflight), terminate it early
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include("./inc_UserOpsModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Validate incoming data from $_POST
    $userId = $_POST['id'] ?? '';
    $role = $_POST['role'] ?? '';

    if (empty($userId) || empty($role)) {
        echo json_encode(["success" => false, "message" => "User ID and role are required."]);
        exit;
    }

    $userOpsModel = new UserOpsModel();
    $result = $userOpsModel->updateUserRole($userId, $role);

    if ($result['success']) {
        echo json_encode(["success" => true, "message" => "User role updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => $result['message']]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>

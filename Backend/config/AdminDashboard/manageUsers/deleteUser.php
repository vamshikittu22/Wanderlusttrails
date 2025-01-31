<?php
// deleteUser.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include("inc_UserOpsModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Validate incoming data from $_POST
    $userId = $_POST['user_id'] ?? '';

    if (empty($userId)) {
        echo json_encode(["success" => false, "message" => "User ID is required."]);
        exit;
    }

    $userOpsModel = new UserOpsModel();
    $result = $userOpsModel->deleteUser($userId);

    if ($result['success']) {
        echo json_encode(["success" => true, "message" => "User deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => $result['message']]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>

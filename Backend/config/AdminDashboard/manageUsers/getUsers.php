<?php
// getUsers.php

// header("Access-Control-Allow-Origin: *");
// header("Content-Type: application/json; charset=UTF-8");
// header("Access-Control-Allow-Methods: GET");
// header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


// Allow all domains (you can change '*' to a specific domain for security)
header("Access-Control-Allow-Origin: *");

// Allow specific HTTP methods (GET, POST, PUT, DELETE, etc.)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Allow specific headers (add more headers as needed)
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");


include("./inc_UsersOpsModel.php");

$userOpsModel = new UserOpsModel();
$users = $userOpsModel->getUsers();

if ($users['success']) {
    echo json_encode($users['data']);
} else {
    echo json_encode(["success" => false, "message" => $users['message']]);
}
?>

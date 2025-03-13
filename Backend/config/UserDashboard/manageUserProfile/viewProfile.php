<?php
header("Access-Control-Allow-Origin: http://localhost:5173"); // Match your frontend port
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

include("./inc_UserProfileModel.php");

if (isset($_GET['userID'])) {
    $userId = $_GET['userID'];
    $userProfileModel = new UserProfileModel();
    $result = $userProfileModel->viewProfile($userId);
    echo json_encode($result); // Consistent response
} else {
    echo json_encode(["success" => false, "message" => "User ID is required"]);
}
?>
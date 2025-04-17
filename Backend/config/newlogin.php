<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

header("Access-Control-Allow-Origin: *"); // Enable CORS for development
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include the User model
include("inc_UserModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Decode JSON input
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Get user input
    $identifier = $data['identifier'] ?? null;
    $password = $data['password'] ?? null;
    
    echo json_encode("Identifier: $identifier"); // Log identifier
    echo json_encode("Password: $password"); // Log password

    if (!$identifier || !$password) {
        echo json_encode("Missing input"); // Log if input is missing
    }

    // Create UserModel instance and attempt login
    $userModel = new UserModel();
    $result = $userModel->loginUser($identifier, $password);

    echo json_encode($result);
} else {
    // Handle invalid request method
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>

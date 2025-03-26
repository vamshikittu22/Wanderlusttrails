<?php
// Allow CORS for development
header("Access-Control-Allow-Origin: http://localhost:5173"); // Adjust to your frontend's origin
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Your logout code here
session_start();
session_unset();
session_destroy();

echo json_encode(["success" => true, "message" => "Logged out successfully"]);
?>
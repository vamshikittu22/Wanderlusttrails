<?php
// path: Backend/config/auth/forgotPassword.php
// Handles forgot password - checks for multiple accounts with same email

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Correct path
require_once __DIR__ . "/inc_authHelper.php"; // This file needs to exist!
require_once __DIR__ . "/../incMailerHelper.php"; // Fixed path (remove /config/)
require_once __DIR__ . "/../inc_databaseClass.php"; // Correct path

Logger::log("forgotPassword API Started");

// Handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Get data
$data = json_decode(file_get_contents("php://input"), true);
$identifier = $data['identifier'] ?? '';
$username = $data['username'] ?? null;

if (empty($identifier)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Identifier is required"]);
    exit;
}

$db = new DatabaseClass();
$authHelper = new AuthHelper();

// Check if identifier is an email
$isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);

if ($isEmail) {
    // Check how many accounts exist with this email
    $query = "SELECT 
                username, firstName, lastName 
                FROM users 
                WHERE email = ?";
    $result = $db->fetchQuery($query, "s", $identifier);
    
    if (empty($result)) {
        Logger::log("No accounts found for email: $identifier");
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "No account found with this email"]);
        exit;
    }
    
    // If multiple accounts exist and no username provided
    if (count($result) > 1 && !$username) {
        Logger::log("Multiple accounts found for email: $identifier");
        $usernames = array_map(function($user) {
            return [
                "username" => $user['username'],
                "displayName" => $user['firstName'] . " " . $user['lastName']
            ];
        }, $result);
        
        http_response_code(200);
        echo json_encode([
            "success" => false,
            "requiresUsername" => true,
            "message" => "Multiple accounts found. Please select your username.",
            "accounts" => $usernames
        ]);
        exit;
    }
    
    // If multiple accounts and username provided
    if (count($result) > 1 && $username) {
        $identifier = $username;
        Logger::log("Using username for multiple email accounts: $username");
    }
}

// Get user email
$email = $authHelper->getUserEmail($identifier);

if (!$email) {
    Logger::log("No email found for identifier: $identifier");
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

// Generate OTP
$otp = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
Logger::log("OTP generated for $identifier: $otp");

// Log OTP
file_put_contents(__DIR__ . "/../logs/otp.log", "OTP for $identifier: $otp (valid for 10 minutes)\n", FILE_APPEND);

// Delete old OTPs
$db->executeQuery("DELETE FROM 
                        otps 
                        WHERE identifier = ?",
                        "s", $identifier);

// Store new OTP
$createdAt = date('Y-m-d H:i:s');
$expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));
$insertResult = $db->executeQuery(
                        "INSERT INTO 
                        otps (identifier, otp, created_at, expires_at) 
                        VALUES (?, ?, ?, ?)",
                        "ssss", $identifier, $otp, $createdAt, $expiresAt);

if (!$insertResult['success']) {
    Logger::log("Failed to store OTP");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to generate OTP"]);
    exit;
}

// Send OTP email
$subject = "Your OTP for Password Reset - Wanderlust Trails";
$body = "
    <h2>Password Reset Request</h2>
    <h3>Username: $username </b></h3> 
    <p>Your OTP is: <strong style='font-size: 24px; color: #2C94D8;'>$otp</strong></p>
    <p>This OTP is valid for <strong style='font-size: 14px; color: #E4080A;'> 10 minutes. </strong></p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,<br>Wanderlust Trails Team</p>
";
$altBody = "Your OTP is: $otp. Valid for 10 minutes.";

$mailResult = sendMail($email, "", $subject, $body, $altBody);

if ($mailResult["success"]) {
    Logger::log("OTP sent to: $email");
    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "message" => "OTP sent successfully to your email",
        "identifier" => $identifier
    ]);
} else {
    Logger::log("Failed to send OTP to: $email");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to send OTP"]);
}
exit;
?>

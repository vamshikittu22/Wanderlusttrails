<?php
// path: Backend/config/auth/verifyOtp.php
// Verifies OTP and resets user password, then sends confirmation email

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/inc_authHelper.php";
require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/../incMailerHelper.php"; // Add mail helper

Logger::log("verifyOtp API Started - Method: " . $_SERVER['REQUEST_METHOD']);

// Handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for verifyOtp");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Parse JSON body
$data = json_decode(file_get_contents("php://input"), true);
Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none'));

// Validate required fields
if (!$data || !isset($data['identifier']) || !isset($data['otp']) || !isset($data['newPassword'])) {
    Logger::log("Missing identifier, otp, or newPassword");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Identifier, OTP, and new password are required"]);
    exit;
}

// Sanitize inputs
$identifier = trim($data['identifier']);
$otp = trim($data['otp']);
$newPassword = $data['newPassword'];

// Validate using AuthHelper
$authHelper = new AuthHelper();

if (!$authHelper->isValidIdentifier($identifier)) {
    Logger::log("Invalid identifier format: $identifier");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid identifier format"]);
    exit;
}

if (!$authHelper->isValidOtp($otp)) {
    Logger::log("Invalid OTP format: $otp");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "OTP must be a 6-digit number"]);
    exit;
}

if (strlen($newPassword) < 8) {
    Logger::log("Password too short for identifier: $identifier");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password must be at least 8 characters"]);
    exit;
}

// Verify OTP
$db = new DatabaseClass();
$query = "SELECT 
            otp, expires_at 
            FROM otps 
            WHERE identifier = ? 
            AND otp = ?";

$result = $db->fetchQuery($query, "ss", $identifier, $otp);

if (empty($result)) {
    Logger::log("Invalid OTP for identifier: $identifier");
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid OTP"]);
    exit;
}

// Check expiry
$expiresAt = strtotime($result[0]['expires_at']);
$currentTime = time();

if ($currentTime > $expiresAt) {
    Logger::log("OTP expired for identifier: $identifier");
    $db->executeQuery("DELETE FROM otps WHERE identifier = ?", "s", $identifier);
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "OTP expired"]);
    exit;
}

// Get user details before updating (for email)
$user = $authHelper->getUserByIdentifier($identifier);
if (!$user) {
    Logger::log("User not found for identifier: $identifier");
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

$userEmail = $user['email'];
$firstName = $user['firstName'] ?? '';
$lastName = $user['lastName'] ?? '';
$userName = $user['username'] ?? '';

// Hash new password
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

// Determine field type
$isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
$isPhone = preg_match('/^[0-9]{10}$/', $identifier);
$field = $isEmail ? "email" : ($isPhone ? "phone" : "userName");

// Update password
$updateQuery = "UPDATE 
                    users 
                    SET password = ? 
                    WHERE $field = ?";
$updateResult = $db->executeQuery($updateQuery, "ss", $hashedPassword, $identifier);

if ($updateResult['success']) {
    // Delete used OTP
    $db->executeQuery("DELETE FROM 
                        otps WHERE identifier = ?",
                        "s", $identifier);
    
    Logger::log("Password reset successfully for identifier: $identifier");

    // Send password change confirmation email
    $subject = "Password Changed Successfully - Wanderlust Trails";
    $body = "
        <h2>Password Changed Successfully</h2>
        <p>Hello $firstName $lastName,</p>
        <p>Your password for your Wanderlust Trails account has been successfully changed.</p>
        <p><strong>Account Details:</strong></p>
        <ul>
            <li><strong>Username:</strong> $userName</li>
            <li><strong>Email:</strong> $userEmail</li>
            <li><strong>Changed on:</strong> " . date('F j, Y, g:i a') . "</li>
        </ul>
        <p>If you did not make this change, please contact our support team immediately at support@wanderlusttrails.com</p>
        <p>For your security:</p>
        <ul>
            <li>Never share your password with anyone</li>
            <li>Use a strong, unique password</li>
            <li>Enable two-factor authentication if available</li>
        </ul>
        <p>Best regards,<br>Wanderlust Trails Team</p>
    ";
    $altBody = "Password Changed Successfully\n\nHello $firstName $lastName,\n\nYour password has been changed successfully on " . date('F j, Y, g:i a') . ".\n\nIf you didn't make this change, contact support immediately.\n\nBest regards,\nWanderlust Trails Team";

    // Send confirmation email
    $mailResult = sendMail($userEmail, $firstName, $subject, $body, $altBody);

    if ($mailResult["success"]) {
        Logger::log("Password change confirmation email sent to: $userEmail");
    } else {
        Logger::log("Failed to send confirmation email to: $userEmail - Error: {$mailResult['message']}");
    }

    // Return success response
    http_response_code(200);
    echo json_encode([
        "success" => true, 
        "message" => "Password reset successfully",
        "mailSuccess" => $mailResult["success"],
        "mailMessage" => $mailResult["message"]
    ]);
} else {
    Logger::log("Failed to reset password for identifier: $identifier");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to reset password"]);
}
exit;
?>

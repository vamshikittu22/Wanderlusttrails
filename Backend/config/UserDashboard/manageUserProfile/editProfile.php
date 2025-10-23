<?php
// Backend/config/UserDashboard/manageUserProfile/editProfile.php
// This endpoint handles user profile updates and sends confirmation email

// Set CORS headers to allow requests from frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Include required files
require_once __DIR__ . "/../../inc_logger.php"; // Logger for tracking API calls
require_once __DIR__ . "/inc_UserProfileModel.php"; // Model for profile operations
require_once __DIR__ . "/../../incMailerHelper.php"; // Reusable mail helper for sending emails

Logger::log("editProfile API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for editProfile");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Only allow POST requests for profile updates
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode JSON data from request body
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - userID: " . ($data['userID'] ?? 'none'));

    // Validate that all required fields are present (including username)
    if (!$data || !isset($data['userID']) || !isset($data['firstName']) || !isset($data['lastName']) || 
        !isset($data['username']) || !isset($data['email']) || !isset($data['dob']) || 
        !isset($data['gender']) || !isset($data['nationality']) || !isset($data['phone']) || 
        !isset($data['street']) || !isset($data['city']) || !isset($data['state']) || !isset($data['zip'])) {
        Logger::log("Missing required fields");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "All fields are required"]);
        exit;
    }

    // Sanitize and trim all input data to prevent malicious input
    $userId = trim($data['userID']);
    $firstName = trim($data['firstName']);
    $lastName = trim($data['lastName']);
    $username = trim($data['username']); // Username field
    $email = trim($data['email']);
    $dob = trim($data['dob']);
    $gender = trim($data['gender']);
    $nationality = trim($data['nationality']);
    $phone = trim($data['phone']);
    $street = trim($data['street']);
    $city = trim($data['city']);
    $state = trim($data['state']);
    $zip = trim($data['zip']);

    // Create instance of UserProfileModel to handle database operations
    $userProfileModel = new UserProfileModel();
    
    // Update user profile in database (now includes username)
    $result = $userProfileModel->updateProfile($userId, $firstName, $lastName, $username, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);

    Logger::log("editProfile result for userID: $userId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));

    // If profile update is successful, send confirmation email
    if ($result['success']) {
        // Prepare profile update notification email
        $subject = "Profile Updated Successfully - Wanderlust Trails";
        
        // HTML email body with all updated information
        $body = "
            <h2>Profile Update Notification</h2>
            <p>Hello $firstName $lastName,</p>
            <p>Your profile has been successfully updated on Wanderlust Trails.</p>
            <p><strong>Updated Information:</strong></p>
            <ul>
                <li><strong>Name:</strong> $firstName $lastName</li>
                <li><strong>Username:</strong> @$username</li>
                <li><strong>Email:</strong> $email</li>
                <li><strong>Phone:</strong> $phone</li>
                <li><strong>Date of Birth:</strong> $dob</li>
                <li><strong>Gender:</strong> $gender</li>
                <li><strong>Nationality:</strong> $nationality</li>
                <li><strong>Address:</strong> $street, $city, $state $zip</li>
                <li><strong>Updated on:</strong> " . date('F j, Y, g:i a') . "</li>
            </ul>
            <p>If you did not make this change, please contact our support team immediately at support@wanderlusttrails.com</p>
            <p><strong>Security Tips:</strong></p>
            <ul>
                <li>Keep your account information up to date</li>
                <li>Review your profile regularly</li>
                <li>Use a strong, unique password</li>
            </ul>
            <p>Best regards,<br>Wanderlust Trails Team</p>
        ";
        
        // Plain text version for email clients that don't support HTML
        $altBody = "Profile Update Notification\n\n";
        $altBody .= "Hello $firstName $lastName,\n\n";
        $altBody .= "Your profile has been successfully updated on " . date('F j, Y, g:i a') . ".\n\n";
        $altBody .= "Updated Information:\n";
        $altBody .= "Name: $firstName $lastName\n";
        $altBody .= "Username: @$username\n";
        $altBody .= "Email: $email\n";
        $altBody .= "Phone: $phone\n";
        $altBody .= "Date of Birth: $dob\n";
        $altBody .= "Gender: $gender\n";
        $altBody .= "Nationality: $nationality\n";
        $altBody .= "Address: $street, $city, $state $zip\n\n";
        $altBody .= "If you did not make this change, please contact support immediately.\n\n";
        $altBody .= "Best regards,\nWanderlust Trails Team";

        // Send confirmation email using reusable mail helper
        $mailResult = sendMail($email, $firstName, $subject, $body, $altBody);

        // Log email sending result for debugging
        if ($mailResult["success"]) {
            Logger::log("Profile update confirmation email sent to: $email");
        } else {
            Logger::log("Failed to send profile update email to: $email - Error: {$mailResult['message']}");
        }

        // Return success response with both profile update and email status
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => $result['message'],
            "mailSuccess" => $mailResult["success"],
            "mailMessage" => $mailResult["message"]
        ]);
    } else {
        // Profile update failed, return error response
        http_response_code(400);
        echo json_encode($result);
    }
    exit;
}

// If request method is not POST, return 405 Method Not Allowed
Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>

<?php
// path: Wanderlusttrails/Backend/config/auth/signupuser.php
// Enhanced with detailed logging to debug signup issues

// Allow cross-origin requests and set content-type to JSON
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
Logger::log("=== SIGNUP API STARTED ===");
Logger::log("Method: {$_SERVER['REQUEST_METHOD']}");
Logger::log("Request URI: {$_SERVER['REQUEST_URI']}");
Logger::log("Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));

// Handle OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS preflight request");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_userModel.php";
require_once __DIR__ . "/../inc_validationClass.php";
require_once __DIR__ . "../../incMailerHelper.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Raw input
    $rawInput = file_get_contents("php://input");
    Logger::log("Raw POST input length: " . strlen($rawInput) . " bytes");
    
    // Get the data sent with the POST request
    $data = json_decode($rawInput, true);
    
    // JSON decode status
    if ($data === null) {
        $jsonError = json_last_error_msg();
        Logger::log("❌ JSON DECODE FAILED: $jsonError");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON: $jsonError"]);
        exit;
    }
    
    Logger::log("✅ JSON decoded successfully");
    Logger::log("POST Data - Email: " . ($data['email'] ?? 'none') . ", FirstName: " . ($data['firstName'] ?? 'none') . ", Username: " . ($data['username'] ?? 'none'));

    // Initialize ValidationClass instance
    $validator = new ValidationClass();

    // Validate all required fields
    $requiredCheck = $validator->validateRequiredFields($data, [
        'firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword',
        'dob', 'gender', 'nationality', 'phone', 'street', 'city', 'state', 'zip'
    ]);
    
    if (!$requiredCheck['success']) {
        Logger::log("❌ Validation failed (required fields): " . $requiredCheck['message']);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => $requiredCheck['message']]);
        exit;
    }
    Logger::log("✅ All required fields present");

    // Check if password and confirmPassword match
    if ($data['password'] !== $data['confirmPassword']) {
        Logger::log("❌ Password mismatch for username: " . $data['username']);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Password and confirm password do not match"]);
        exit;
    }
    Logger::log("✅ Passwords match");

    // Validate email format
    $emailCheck = $validator->validateEmail($data['email']);
    if (!$emailCheck['success']) {
        Logger::log("❌ Invalid email format: " . $data['email']);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => $emailCheck['message']]);
        exit;
    }
    Logger::log("✅ Email format valid");

    // Validate phone number format if provided
    if (!empty($data['phone'])) {
        $phoneCheck = $validator->validatePhone($data['phone']);
        if (!$phoneCheck['success']) {
            Logger::log("❌ Invalid phone format: " . $data['phone']);
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $phoneCheck['message']]);
            exit;
        }
        Logger::log("✅ Phone format valid");
    }

    // Validate date of birth format
    if (!empty($data['dob'])) {
        $dobCheck = $validator->validateDateOfBirth($data['dob']);
        if (!$dobCheck['success']) {
            Logger::log("❌ Invalid DOB format: " . $data['dob']);
            http_response_code(400);
            echo json_encode(["success" => false, "message" => $dobCheck['message']]);
            exit;
        }
        Logger::log("✅ DOB format valid");
    }

    // Sanitize the input data
    $firstName = trim($data['firstName']);
    $lastName = trim($data['lastName']);
    $username = trim($data['username']);
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];
    $dob = trim($data['dob'] ?? '');
    $gender = trim($data['gender'] ?? '');
    $nationality = trim($data['nationality'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $street = trim($data['street'] ?? '');
    $city = trim($data['city'] ?? '');
    $state = trim($data['state'] ?? '');
    $zip = trim($data['zip'] ?? '');

    Logger::log("Attempting to register user: $email");

    // Instantiate UserModel and register user
    $userModel = new UserModel();
    $result = $userModel->registerUser($firstName, $lastName, $username, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);

    // ✅ LOG: Registration result
    Logger::log("User registration result: " . json_encode($result));

    if ($result['success']) {
        Logger::log("✅ User registered successfully: $email");
        
        // Prepare welcome email
        $subject = "Welcome to Wanderlust Trails!";
        $body = "
            <h2>Welcome to Wanderlust Trails, $firstName!</h2>
            <p>Hello $firstName $lastName,</p>
            <p>Thank you for signing up with Wanderlust Trails. We're excited to have you on board!</p>
            <p>Your account has been created successfully with the following details:</p>
            <ul>
                <li><strong>Username:</strong> $username</li>
                <li><strong>Email:</strong> $email</li>
            </ul>
            <p>You can now log in and start exploring our travel packages and services.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>Wanderlust Trails Team</p>
        ";
        $altBody = "Welcome to Wanderlust Trails!\n\nHello $firstName $lastName,\n\nThank you for signing up. Your account has been created successfully.\n\nUsername: $username\nEmail: $email\n\nBest regards,\nWanderlust Trails Team";

        // Send welcome email
        $mailResult = sendMail($email, $firstName, $subject, $body, $altBody);

        // ✅ LOG: Email sending result
        if ($mailResult["success"]) {
            Logger::log("✅ Welcome email sent successfully to: $email");
        } else {
            Logger::log("❌ Failed to send welcome email to: $email - Error: {$mailResult['message']}");
        }

        // ✅ FIXED: Use HTTP 200 instead of 201 for better jQuery compatibility
        http_response_code(200);
        
        // ✅ FIXED: Send user-friendly message
        $response = [
            "success" => true,
            "message" => "User registered successfully!",
            "mailSuccess" => $mailResult["success"],
            "mailMessage" => $mailResult["message"]
        ];
        
        Logger::log("Sending success response: " . json_encode($response));
        echo json_encode($response);
    } else {
        Logger::log("❌ User registration failed: " . $result['message']);
        http_response_code(400);
        echo json_encode($result);
    }
    exit;
}

// If not POST or OPTIONS, return error
Logger::log("❌ Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>

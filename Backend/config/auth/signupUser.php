<?php
// path: Wanderlusttrails/Backend/config/signupuser.php
// This file handles user registration by accepting POST requests with user data.
// It validates the data, encrypts the password, and stores the user information in the database.
// After successful registration, it sends a welcome email to the user.

// Allow cross-origin requests and set content-type to JSON
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include logger class for logging
Logger::log("signupuser API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for signupuser");
    http_response_code(200);  // Successful preflight response
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_userModel.php"; // Include user model for database operations
require_once __DIR__ . "/../inc_validationClass.php"; // Include validation class for validation operations
require_once __DIR__ . "/../config/incMailerHelper.php"; // Include reusable mail helper for sending emails

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Get the data sent with the POST request
    $data = json_decode(file_get_contents("php://input"), true); 
    Logger::log("POST Data - Email: " . ($data['email'] ?? 'none') . ", FirstName: " . ($data['firstName'] ?? 'none'));

    // Initialize ValidationClass instance for validation checks
    $validator = new ValidationClass();

    // Validate all required fields
    $requiredCheck = $validator->validateRequiredFields($data, [
        'firstName',
        'lastName',
        'userName',
        'email',
        'password',
        'confirmPassword',
        'dob',
        'gender',
        'nationality',
        'phone',
        'street',
        'city',
        'state',
        'zip'
    ]);
    if (!$requiredCheck['success']) {
        Logger::log("Validation failed: " . $requiredCheck['message']);
        http_response_code(400);  // Bad request
        echo json_encode(["success" => false, "message" => $requiredCheck['message']]);
        exit;
    }

    // Check if password and confirmPassword match
    if ($data['password'] !== $data['confirmPassword']) {
        Logger::log("Password and confirmPassword do not match for email: " . $data['email']);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Password and confirm password do not match"]);
        exit;
    }

    // Validate email format
    $emailCheck = $validator->validateEmail($data['email']);
    if (!$emailCheck['success']) {
        Logger::log("Invalid email format: " . $data['email']);
        http_response_code(400);  // Bad request, invalid email format
        echo json_encode(["success" => false, "message" => $emailCheck['message']]);
        exit;
    }

    // Validate phone number format if provided
    if (!empty($data['phone'])) {
        $phoneCheck = $validator->validatePhone($data['phone']);
        if (!$phoneCheck['success']) {
            Logger::log("Invalid phone format: " . $data['phone']);
            http_response_code(400);  // Bad request, invalid phone format
            echo json_encode(["success" => false, "message" => $phoneCheck['message']]);
            exit;
        }
    }

    // Validate date of birth format if provided
    if (!empty($data['dob'])) {
        $dobCheck = $validator->validateDateOfBirth($data['dob']);
        if (!$dobCheck['success']) {
            Logger::log("Invalid date of birth format: " . $data['dob']);
            http_response_code(400);  // Bad request, invalid date of birth format
            echo json_encode(["success" => false, "message" => $dobCheck['message']]);
            exit;
        }
    }

    // Sanitize the input data before using it in the database
    $firstName = trim($data['firstName']);
    $lastName = trim($data['lastName']);
    $userName = trim($data['userName']);
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password']; // do not trim password
    $dob = trim($data['dob'] ?? '');  
    $gender = trim($data['gender'] ?? '');
    $nationality = trim($data['nationality'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $street = trim($data['street'] ?? '');
    $city = trim($data['city'] ?? '');
    $state = trim($data['state'] ?? '');
    $zip = trim($data['zip'] ?? '');

    // Instantiate UserModel class to interact with the database for user registration
    $userModel = new UserModel();
    $result = $userModel->registerUser($firstName, $lastName, $userName, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip); 

    // Log the result of the user registration process
    Logger::log("signupuser result for email: $email - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));

    // If registration is successful, send a welcome email
    if ($result['success']) {
        // Prepare welcome email subject and body
        $subject = "Welcome to Wanderlust Trails!";
        $body = "
            <h2>Welcome to Wanderlust Trails, $firstName!</h2>
            <p>Hello $firstName $lastName,</p>
            <p>Thank you for signing up with Wanderlust Trails. We're excited to have you on board!</p>
            <p>Your account has been created successfully with the following details:</p>
            <ul>
                <li><strong>Username:</strong> $userName</li>
                <li><strong>Email:</strong> $email</li>
            </ul>
            <p>You can now log in and start exploring our travel packages and services.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>Wanderlust Trails Team</p>
        ";
        $altBody = "Welcome to Wanderlust Trails!\n\nHello $firstName $lastName,\n\nThank you for signing up. Your account has been created successfully.\n\nUsername: $userName\nEmail: $email\n\nBest regards,\nWanderlust Trails Team";

        // Send welcome email using the reusable mail helper
        $mailResult = sendMail($email, $firstName, $subject, $body, $altBody);

        // Log the email sending result
        if ($mailResult["success"]) {
            Logger::log("Welcome email sent successfully to: $email");
        } else {
            Logger::log("Failed to send welcome email to: $email - Error: {$mailResult['message']}");
        }

        // Send response with registration success and email status
        http_response_code(201);  // HTTP 201 for successful creation
        echo json_encode([
            "success" => true,
            "message" => $result['message'],
            "mailSuccess" => $mailResult["success"],
            "mailMessage" => $mailResult["message"]
        ]);
    } else {
        // Registration failed, send error response
        http_response_code(400);  // HTTP 400 for bad request
        echo json_encode($result);
    }
    exit;
}

// If the request method is not POST, log the invalid method and send a 405 Method Not Allowed response
Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>

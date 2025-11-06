<?php
// path: Wanderlusttrails/Backend/config/auth/login.php
// This file handles user login. It validates credentials, fetches user data from the database,
// verifies the password, generates a JWT token, and initializes session variables for the user.

session_start(); // Start the session to store user data after login

// CORS headers to allow requests from the frontend (React app running at localhost:5173)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Import necessary helper classes and functions
require_once __DIR__ . "/../inc_logger.php";             // Custom logging class for tracking API events
require_once __DIR__ . "/../inc_databaseClass.php";      // Custom database abstraction class
require_once __DIR__ . "/../inc_validationClass.php";    // Custom validation functions
require_once __DIR__ . "/jwt_helper.php";                // Helper for creating JWT tokens

Logger::log("login API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle preflight (OPTIONS) request sent by browser before actual POST
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for login");
    http_response_code(200);
    exit;
}

// Handle login logic only if request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Decode incoming JSON request into associative array
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Username: " . ($data['identifier'] ?? 'none'));

    $validator = new ValidationClass(); // Create validator instance

    // Validate presence of required fields using ValidationClass
    $requiredCheck = $validator->validateRequiredFields($data, ['identifier', 'password']);
    if (!$requiredCheck['success']) {
        // If any required field is missing, return error response
        Logger::log("Validation failed: " . $requiredCheck['message']);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => $requiredCheck['message']]);
        exit;
    }

    // Extract identifier (now username) and password from request
    $identifier = $data['identifier'];
    $password = $data['password'];

    // Validate username (basic check for length and non-empty)
    if (strlen($identifier) < 3 || strlen($identifier) > 50) {
        Logger::log("Invalid username format: $identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Username must be between 3 and 50 characters"]);
        exit;
    }

    $db = new DatabaseClass(); // Create database connection instance

    // Prepare a query to fetch user by username
    $query = "SELECT id, firstname, lastname, userName, email, phone, password, role, dob, gender, nationality, street, city, state, zip    
                FROM users 
                WHERE userName = ?";

    // Execute the query with the username
    $result = $db->fetchQuery($query, "s", $identifier);

    if (empty($result)) {
        // If no user found with the given username, return not found error
        Logger::log("User not found for username: $identifier");
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $user = $result[0]; // Fetch the matched user record

    // Verify submitted password against the hashed password stored in DB
    if (!password_verify($password, $user['password'])) {
        Logger::log("Incorrect password for username: $identifier");
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect password"]);
        exit;
    }

    // Generate a JWT token with user ID as payload
    $token = generateJWT($user['id']);
    Logger::log("Login successful for user_id: {$user['id']}");

    // Store important user details in session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_phone'] = $user['phone'];
    $_SESSION['user_name'] = $user['userName'];
    $_SESSION['token'] = $token;

    // Respond with success message, user data, and token
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "token" => $token,
        "id" => $user['id'],
        "firstname" => $user['firstname'],
        "lastname" => $user['lastname'],
        "userName" => $user['userName'],
        "email" => $user['email'],
        "phone" => $user['phone'],
        "role" => $user['role'],
        "dob" => $user['dob'],
        "gender" => $user['gender'],
        "nationality" => $user['nationality'],
        "street" => $user['street'],
        "city" => $user['city'],
        "state" => $user['state'],
        "zip" => $user['zip']
    ]);
    exit;
}

// If method is not POST or OPTIONS, return 405 Method Not Allowed
Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>

<?php
//path: Wanderlusttrails/Backend/config/auth/login.php
// This file handles user login by validating credentials and generating a JWT token.
// It returns a JSON response with user details and token on success.
session_start() ; // Start the session to manage user authentication
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes
require_once __DIR__ . "/../inc_databaseClass.php"; // Include the database class for database operations
require_once __DIR__ . "/jwt_helper.php"; // Include the JWT helper for token generation

Logger::log("login API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for login");
    http_response_code(200);
    exit;
}
// Check if the request method is POST (actual request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true); // Decode the JSON request body into an associative array
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none'));
    // Validate the input data
    if (!$data || !isset($data['identifier']) || !isset($data['password'])) {
        Logger::log("Missing identifier or password");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Identifier and password are required"]);
        exit;
    }
// Get the identifier (email or phone) and password from the request data
    $identifier = $data['identifier'];
    $password = $data['password'];

    $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);  // Check if the identifier is a valid email address
    $isPhone = preg_match('/^[0-9]{10}$/', $identifier);  // Check if the identifier is a valid phone number (10 digits)

    if (!$isEmail && !$isPhone) {
        Logger::log("Invalid email or phone format: $identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email or phone format"]);
        exit;
    }
//prepare the SQL query to fetch user details based on identifier (email or phone)
    $db = new DatabaseClass(); // Create an instance of the DatabaseClass to interact with the database
    $query = "SELECT id, firstname, lastname, email, phone, password, role, dob, gender, nationality, street, city, state, zip 
              FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?"); // Prepare the SQL query to fetch user details based on identifier (email or phone)
    $result = $db->fetchQuery($query, "s", $identifier); // Execute the query and fetch the result

    if (empty($result)) {
        Logger::log("User not found for identifier: $identifier");
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $user = $result[0]; // Get the user details from the result
// Check if the password matches the hashed password stored in the database
    if (!password_verify($password, $user['password'])) {
        Logger::log("Incorrect password for identifier: $identifier");
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect password"]);
        exit;
    }

    $token = generateJWT($user['id']); // Generate a JWT token for the user using their ID
    Logger::log("Login successful for user_id: {$user['id']}");

    // Set session variables for the logged-in user
    $_SESSION['user_id'] = $user['id']; // Store the user ID in the session
    $_SESSION['user_role'] = $user['role']; // Store the user role in the session
    $_SESSION['user_email'] = $user['email']; // Store the user email in the session
    $_SESSION['user_phone'] = $user['phone']; // Store the user phone in the session
    $_SESSION['user_name'] = $user['firstname'] . " " . $user['lastname']; // Store the user name in the session
    $_SESSION['token'] = $token; // Store the user date of birth in the session

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "token" => $token,
        "id" => $user['id'],
        "firstname" => $user['firstname'],
        "lastname" => $user['lastname'],
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
    ]); // Return the user details and token in the response
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]); // Return a 405 Method Not Allowed response
exit;
?>
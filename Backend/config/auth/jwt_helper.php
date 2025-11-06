<?php
//path: Wanderlusttrails/Backend/config/auth/jwt_helper.php
// This file handles JWT generation and validation for user authentication.
// It uses the Firebase JWT library to create and verify tokens.

require_once __DIR__ . "/../inc_logger.php";
require_once '../../vendor/autoload.php';
use Firebase\JWT\JWT;

$key = 'Wanderlusttrails_SecretKey_Vamshi_Krishna_Pullaiahgari';
 // Secret key for JWT

// Function to generate a JWT token for a given user ID
function generateJWT($userId) {
    Logger::log("Generating JWT for userId: $userId");

    global $key;

    $issuedAt = time();
    $expirationTime = $issuedAt + 9000; // Token valid for 2.5 hours (9000 seconds)
    $payload = array(
        "iat" => $issuedAt,            // Issued at: current time
        "exp" => $expirationTime,      // Expiration time
        "userId" => $userId            // User identifier included in the token
    );

    // Encode the payload to generate the token with the specified algorithm HS256
    $jwt = JWT::encode($payload, $key, 'HS256');
    Logger::log("JWT generated successfully for userId: $userId");
    return $jwt;
}

// Function to validate a JWT token
function validateJWT($token) {
    global $key;
    Logger::log("Validating JWT: " . substr($token, 0, 10) . "..."); // Log only first part of token for security
    try {
        // Decode and verify the token using the secret key and algorithm HS256
        $decoded = JWT::decode($token, $key, array('HS256'));
        Logger::log("JWT validated successfully for userId: {$decoded->userId}");
        return $decoded; // Return decoded token object if valid
    } catch (Exception $e) {
        // If decoding or verification fails, log error and return null
        Logger::log("JWT validation failed: {$e->getMessage()}");
        return null;
    }
}
?>

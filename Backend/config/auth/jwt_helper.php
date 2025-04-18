<?php
//path: Wanderlusttrails/Backend/config/auth/jwt_helper.php
// This file handles JWT generation and validation for user authentication.
// It uses the Firebase JWT library to create and verify tokens.

require_once __DIR__ . "/../inc_logger.php";
require_once '../../vendor/autoload.php';
use Firebase\JWT\JWT;

$key = 'Wanderlusttrails_SecretKey_Vamshi_Krishna_Pullaiahgari'; // Secret key for JWT

function generateJWT($userId) {
    Logger::log("Generating JWT for userId: $userId");
    
    global $key;

    $issuedAt = time();
    $expirationTime = $issuedAt + 9000; // Token valid for 2.5 hours
    $payload = array(
        "iat" => $issuedAt,
        "exp" => $expirationTime,
        "userId" => $userId
    );

    // Encode the payload to generate the token with the specified algorithm
    $jwt = JWT::encode($payload, $key, 'HS256');
    Logger::log("JWT generated successfully for userId: $userId");
    return $jwt;
}

function validateJWT($token) {
    Logger::log("Validating JWT: " . substr($token, 0, 10) . "...");
    try {
        $decoded = JWT::decode($token, 'your-secret-key', array('HS256'));
        Logger::log("JWT validated successfully for userId: {$decoded->userId}");
        return $decoded;
    } catch (Exception $e) {
        Logger::log("JWT validation failed: {$e->getMessage()}");
        return null;
    }
}
?>
<?php
// jwt_helper.php

require_once '../../vendor/autoload.php';
use Firebase\JWT\JWT;

$key = 'Wanderlusttrails_SecretKey_Vamshi_Krishna_Pullaiahgari'; // Secret key for JWT

function generateJWT($userId) {
    
    global $key;

    $issuedAt = time();
    $expirationTime = $issuedAt + 3600;  // Token expires in 1 hour
    $payload = array(
        "iat" => $issuedAt,
        "exp" => $expirationTime,
        "userId" => $userId
    );

    // Encode the payload to generate the token with the specified algorithm
    return JWT::encode($payload, $key, 'HS256');
}

function validateJWT($token) {
    try {
        $decoded = JWT::decode($token, 'your-secret-key', array('HS256'));
        return $decoded;
    } catch (Exception $e) {
        return null;
    }
}

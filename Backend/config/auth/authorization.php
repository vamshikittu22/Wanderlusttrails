<?php
// authorization.php

include 'jwt_helper.php';

function authorizeRequest() {
    $headers = apache_request_headers();
    if (!isset($headers['Authorization'])) {
        echo json_encode(['error' => 'Authorization header missing']);
        exit;
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $decoded = validateJWT($token);

    if ($decoded === null) {
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }

    return $decoded;
}
?>

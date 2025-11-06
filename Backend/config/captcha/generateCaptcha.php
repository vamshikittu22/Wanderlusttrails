<?php
session_start();

require_once __DIR__ . '/../inc_logger.php';

// Set CORS headers to allow requests from http://localhost:5173
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log('Generate - Handling OPTIONS preflight');
    http_response_code(204);
    exit;
}

// Log script execution and request details
Logger::log('Generate - Script executed: ' . __FILE__);
Logger::log('Generate - Request Method: ' . $_SERVER['REQUEST_METHOD']);

// Log session details
Logger::log('Generate - Session ID: ' . session_id());
if (isset($_SESSION)) {
    Logger::log('Generate - Session data: ' . print_r($_SESSION, true));
} else {
    Logger::log('Generate - Session not started');
}

// Generate new CAPTCHA
$captcha = '';
$chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ($i = 0; $i < 6; $i++) {
    $captcha .= $chars[mt_rand(0, strlen($chars) - 1)];
}
$_SESSION['captcha'] = $captcha; // Stored for reference, verification is frontend-only
Logger::log('Generate - Generated CAPTCHA: ' . $captcha);

// Return the CAPTCHA as JSON
echo json_encode(['captcha' => $captcha, 'success' => true]);
?>

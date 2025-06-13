<?php
// path: Wanderlusttrails/Backend/config/auth/session.php
// This file checks if a user is logged in by verifying the session data.
// It returns a JSON response indicating the login status and user information if logged in.

session_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once __DIR__ . "/../inc_logger.php";
Logger::log("session API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if (isset($_SESSION['user_id'])) {
    Logger::log("Session found for user_id: {$_SESSION['user_id']}");
    echo json_encode(["loggedIn" => true, "user" => $_SESSION]);
} else {
    Logger::log("No active session found");
    echo json_encode(["loggedIn" => false]);
}
?>

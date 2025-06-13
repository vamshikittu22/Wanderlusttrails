<?php
// path: Wanderlusttrails/Backend/config/AdminDashboard/manageDestinations/viewPackage.php
// Fetches all packages for admin.

// Set CORS headers and content type
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php";    // Logger for logging
require_once __DIR__ . "/inc_PackageModel.php";    // PackageModel for package operations

Logger::log("viewPackage API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle OPTIONS method for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for viewPackage");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Allow only GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Instantiate the PackageModel and fetch all packages
$packageModel = new PackageModel();
$result = $packageModel->viewAllPackages();

Logger::log("viewPackage result: " . (empty($result['data']) ? "No packages found" : count($result['data']) . " packages"));

// Return the response with appropriate HTTP status code
if ($result['success']) {
    http_response_code(200);
    echo json_encode($result['data']);  // Return package data as JSON
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => $result['message']]); // Return error message
}

exit;
?>

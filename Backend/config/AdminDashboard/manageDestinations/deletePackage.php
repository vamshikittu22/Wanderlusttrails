<?php
// path: Wanderlusttrails/Backend/config/AdminDashboard/manageDestinations/deletePackage.php
// API endpoint to delete a travel package

// Set CORS headers to allow requests from frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 1 day

require_once __DIR__ . "/../../inc_logger.php";    // Logger for debugging and event tracing
require_once __DIR__ . "/inc_PackageModel.php";    // Package model to interact with packages table

Logger::log("deletePackage API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for deletePackage");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Only allow POST requests for deleting package
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Read raw JSON input from request body
$rawInput = file_get_contents("php://input");
Logger::log("Raw input: " . ($rawInput ?: "Empty"));

// Decode JSON input into associative array
$data = json_decode($rawInput, true);
if ($data === null) {
    Logger::log("JSON decode failed. Possible malformed JSON.");
    http_response_code(400); // Bad Request
    echo json_encode(["success" => false, "message" => "Invalid JSON format"]);
    exit;
}

// Validate that 'id' field is present and numeric
$packageId = $data['id'] ?? '';
if (empty($packageId) || !is_numeric($packageId)) {
    Logger::log("Missing or invalid package_id: " . json_encode($data));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid numeric package ID is required"]);
    exit;
}

// Sanitize the package ID by casting to integer
$packageId = (int)$packageId;
Logger::log("Deleting package_id: $packageId");

// Instantiate PackageModel and call deletePackage method
$packageModel = new PackageModel();
$result = $packageModel->deletePackage($packageId);

Logger::log("deletePackage result for package_id: $packageId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));

// Set HTTP status code based on success or failure
http_response_code($result['success'] ? 200 : 400);

// Return the result as JSON
echo json_encode($result);
exit;
?>

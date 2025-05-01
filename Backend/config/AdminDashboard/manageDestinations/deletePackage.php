<?php
//path: Wanderlusttrails/Backend/config/AdminDashboard/manageDestinations/deletePackage.php
// Deletes a package.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/inc_PackageModel.php";

Logger::log("deletePackage API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for deletePackage");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$rawInput = file_get_contents("php://input");
Logger::log("Raw input: " . ($rawInput ?: "Empty"));

$data = json_decode($rawInput, true);
if ($data === null) {
    Logger::log("JSON decode failed. Possible malformed JSON.");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON format"]);
    exit;
}

$packageId = $data['id'] ?? '';
if (empty($packageId) || !is_numeric($packageId)) {
    Logger::log("Missing or invalid package_id: " . json_encode($data));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid numeric package ID is required"]);
    exit;
}

$packageId = (int)$packageId;
Logger::log("Deleting package_id: $packageId");

$packageModel = new PackageModel();
$result = $packageModel->deletePackage($packageId);

Logger::log("deletePackage result for package_id: $packageId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);
echo json_encode($result);
exit;
?>
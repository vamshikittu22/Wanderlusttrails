<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// Fetches travel packages with optional sorting, returns JSON response.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/inc_logger.php";

Logger::log("travelPackages API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for travelPackages");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$sortOrder = isset($_GET['sort']) ? $_GET['sort'] : 'none';
Logger::log("Received sort parameter: '$sortOrder'");

$conn = new mysqli("localhost", "root", "", "wanderlusttrails");
if ($conn->connect_error) {
    Logger::log("Database connection failed: {$conn->connect_error}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$sql = "SELECT id, name, description, location, price, image_url FROM packages";
switch ($sortOrder) {
    case "price_asc":
        $sql .= " ORDER BY CAST(price AS DECIMAL(10,2)) ASC";
        break;
    case "price_desc":
        $sql .= " ORDER BY CAST(price AS DECIMAL(10,2)) DESC";
        break;
    case "name_asc":
        $sql .= " ORDER BY name ASC";
        break;
    case "name_desc":
        $sql .= " ORDER BY name DESC";
        break;
    default:
        break;
}

Logger::log("Executing SQL query: $sql");
$result = $conn->query($sql);

$travelData = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $travelData[] = $row;
    }
}

Logger::log("travelPackages result: " . json_encode([
    "data_count" => count($travelData),
    "sample" => $travelData ? array_slice($travelData, 0, 1) : []
]));

$conn->close();
http_response_code(200);
echo json_encode($travelData);
exit;
?>
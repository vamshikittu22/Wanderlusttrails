<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// Updates a package for admin.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/inc_PackageModel.php";

Logger::log("editPackage API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for editPackage");
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

$id = $_POST['id'] ?? '';
$packageName = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$location = $_POST['location'] ?? '';
$price = $_POST['price'] ?? '';

Logger::log("Received data - id: $id, name: $packageName, location: $location, price: $price, image: " . (isset($_FILES['image']) ? $_FILES['image']['name'] : 'none') . ", image_url: " . ($_POST['image_url'] ?? 'none'));

if (empty($id) || !is_numeric($id) || empty($packageName) || empty($description) || empty($location) || empty($price) || !is_numeric($price) || $price <= 0) {
    Logger::log("Validation failed: Missing or invalid fields");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "All fields are required and price must be a positive number"]);
    exit;
}

$packageModel = new PackageModel();
$imageUrl = $_POST['image_url'] ?? '';
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $image = $_FILES['image'];
    $uploadDir = __DIR__ . '/../../../../Assets/Images/packages/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $imageName = time() . '_' . basename($image['name']);
    $uploadPath = $uploadDir . $imageName;
    if (move_uploaded_file($image['tmp_name'], $uploadPath)) {
        $imageUrl = $imageName;
        Logger::log("Image uploaded successfully: $imageUrl");
    } else {
        Logger::log("Image upload failed");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Failed to upload image"]);
        exit;
    }
} else {
    // Fetch existing image_url if no new image
    $query = "SELECT image_url FROM packages WHERE id = ?";
    $result = $packageModel->db->fetchQuery($query, "i", $id);
    if ($result) {
        $imageUrl = $result[0]['image_url'];
        Logger::log("No new image uploaded, using existing: $imageUrl");
    } else {
        Logger::log("No existing image found for id: $id");
        $imageUrl = '';
    }
}

$result = $packageModel->editPackage($id, $packageName, $description, $location, $price, $imageUrl);

Logger::log("editPackage result for id: $id - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);
if ($result['success']) {
    echo json_encode(["success" => true, "message" => "Package updated successfully", "image_url" => $imageUrl]);
} else {
    echo json_encode(["success" => false, "message" => $result['message']]);
}
exit;
?>
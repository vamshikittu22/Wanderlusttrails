<?php
// path: Wanderlusttrails/Backend/config/AdminDashboard/manageDestinations/insertPackage.php
// Inserts a new travel package for admin.

// Set CORS headers and content type
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php";   // Logger for logging
require_once __DIR__ . "/inc_PackageModel.php";   // PackageModel for package operations

Logger::log("insertPackage API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle OPTIONS preflight request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for insertPackage");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Only allow POST requests for package insertion
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Retrieve POST data from the request
$packageName = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$location = $_POST['location'] ?? '';
$price = $_POST['price'] ?? '';

Logger::log("Received data - name: $packageName, location: $location, price: $price");

// Validate required fields and price
if (empty($packageName) || empty($description) || empty($location) || empty($price) || !is_numeric($price) || $price <= 0) {
    Logger::log("Validation failed: Missing or invalid fields");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "All fields are required and price must be a positive number"]);
    exit;
}

// Handle image upload or accept an existing image URL
$imageUrl = $_POST['imageurl'] ?? ''; // Get existing image URL if provided

// Set a default image if no image is uploaded
$defaultImage = 'default.jpg'; // You can change this to your default image name

if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $image = $_FILES['image'];
    $uploadDir = __DIR__ . '/../../../../Assets/Images/packages/';

    // Create the directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate a unique filename to avoid overwriting
    $imageName = time() . '_' . basename($image['name']);
    $uploadPath = $uploadDir . $imageName;

    // Move the uploaded file to the destination directory
    if (move_uploaded_file($image['tmp_name'], $uploadPath)) {
        $imageUrl = $imageName;
        Logger::log("Image uploaded successfully: $imageUrl");
    } else {
        Logger::log("Image upload failed");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Failed to upload image"]);
        exit;
    }
} elseif (empty($imageUrl)) {
    // If no image uploaded and no URL provided, return error
    $imageUrl = $defaultImage;
    Logger::log("No image provided, using default: $imageUrl");
}

// Create an instance of the PackageModel and insert the package
$packageModel = new PackageModel();
$result = $packageModel->insertPackage($packageName, $description, $location, $price, $imageUrl);

Logger::log("insertPackage result: " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);

// Respond with success or failure message and image URL if success
if ($result['success']) {
    echo json_encode([
        "success" => true,
        "message" => "Package added successfully",
        "image_url" => $imageUrl
    ]);
} else {
    echo json_encode(["success" => false, "message" => $result['message']]);
}

exit;
?>

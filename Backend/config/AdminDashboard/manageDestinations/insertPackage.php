<?php
// insertPackage.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include("inc_PackageModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Validate incoming data from $_POST
    $packageName = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $location = $_POST['location'] ?? '';
    $price = $_POST['price'] ?? '';

    // Validate required fields
    if (empty($packageName) || empty($description) || empty($location) || empty($price)) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    // Check if the image was uploaded successfully
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image = $_FILES['image'];
        
        // Define upload directory and file path
        $uploadDir = 'packages/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Create the directory if it doesn't exist
        }

        $imageTempPath = $image['tmp_name'];
        $imageName = basename($image['name']); // Add timestamp for unique file name
        $uploadPath = $uploadDir . $imageName;

        // Move the uploaded file to the server
        if (move_uploaded_file($imageTempPath, $uploadPath)) {
            // Generate the public URL for the image
            $imageUrl = $imageName;

            // Save package details including image URL into the database
            $packageModel = new PackageModel();
            $result = $packageModel->insertPackage($packageName, $description, $location, $price, $imageUrl);

            if ($result) {
                echo json_encode(["success" => true, "message" => "Package added successfully", "image_url" => $imageUrl]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to save package details in the database."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Failed to upload image."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Image is required."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>

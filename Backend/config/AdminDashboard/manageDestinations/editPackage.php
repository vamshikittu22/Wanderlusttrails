<?php
// editPackage.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include("inc_PackageModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Validate incoming data from $_POST
    $id = $_POST['id'] ?? $_POST['currenteditid'] ?? '';  // Check for both fields
    $packageName = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $location = $_POST['location'] ?? '';
    $price = $_POST['price'] ?? '';

    // Validate required fields
    if (empty($id) || empty($packageName) || empty($description) || empty($location) || empty($price)) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }


    $imageUrl = null; // Default to null, will fetch existing if no new image is uploaded
    // Check if the image was uploaded successfully
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $image = $_FILES['image'];
        
        // Define upload directory and file path
        $uploadDir = '../../../../Assets/Images/packages/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Create the directory if it doesn't exist
        }

        $imageTempPath = $image['tmp_name'];
        $imageName = time().'_'.basename($image['name']); // Add timestamp for unique file name
        $uploadPath = $uploadDir . $imageName;

        // Move the uploaded file to the server
        if (move_uploaded_file($imageTempPath, $uploadPath)) {
            // Generate the public URL for the image
            $imageUrl = $imageName;

            // Update package details including the image URL into the database
            $packageModel = new PackageModel();
            $result = $packageModel->editPackage($id, $packageName, $description, $location, $price, $imageUrl);

            if ($result) {
                echo json_encode(["success" => true, "message" => "Package updated successfully", "image_url" => $imageUrl]);
            } else {
                echo json_encode(["success" => false, "message" => "Failed to update package details in the database."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Failed to upload image."]);
        }
    } else {


        // If no image was uploaded, we can either skip the update of the image or keep the existing one.
        // If no image is uploaded, we assume imageUrl remains unchanged.
        
        // Fetch existing image_url if no new image is uploaded
        $query = "SELECT image_url FROM packages WHERE id = ?";
        $currentImage = $packageModel->db->fetchQuery($query, "i", $id);
        $imageUrl = $currentImage ? $currentImage[0]['image_url'] : null;


        // Update package details without the image
        $packageModel = new PackageModel();
        $result = $packageModel->editPackage($id, $packageName, $description, $location, $price, $imageUrl);

        if ($result) {
            echo json_encode(["success" => true, "message" => "Package updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update package details in the database."]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>

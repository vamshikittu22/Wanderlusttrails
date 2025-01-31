<?php
// viewPackages.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include the necessary files
include("inc_PackageModel.php");

// Initialize the PackageModel
$packageModel = new PackageModel();

// Fetch all packages
$result = $packageModel->viewAllPackages();

if ($result['success']) {
    // Return the packages as a JSON response to the frontend
    echo json_encode($result['data']);
} else {
    // Return an error message if no packages are found
    echo json_encode(["success" => false, "message" => $result['message']]);
}
?>

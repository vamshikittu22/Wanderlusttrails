<?php
// viewProfile.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include the necessary files
include("inc_UserProfileModel.php");

// Check if user ID is provided via GET
if (isset($_GET['userID'])) {
    $userId = $_GET['userID'];
    
    // Initialize the UserProfileModel
    $userProfileModel = new UserProfileModel();
    
    // Fetch the user profile based on user ID
    $result = $userProfileModel->viewProfile($userId);
    
    if ($result['success']) {
        // Return the user profile data as a JSON response
        echo json_encode($result['data']);
    } else {
        // Return an error message if the profile is not found
        echo json_encode(["success" => false, "message" => $result['message']]);
    }
} else {
    // Return an error if user ID is not provided
    echo json_encode(["success" => false, "message" => "User ID is required"]);
}
?>

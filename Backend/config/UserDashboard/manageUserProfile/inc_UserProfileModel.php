<?php
// Backend/config/UserDashboard/manageUserProfile/inc_UserProfileModel.php
include("../../inc_databaseClass.php");
require_once __DIR__ . "/../../inc_logger.php";

// UserProfileModel class  
class UserProfileModel {
    private $db; // Database connection instance

    public function __construct() { // Constructor to initialize the database connection
        $this->db = new DatabaseClass(); // Create a new instance of the DatabaseClass
        Logger::log("UserProfileModel instantiated");
    }

    // Method to view user profile
    public function viewProfile($userId) {
        Logger::log("viewProfile started for userId: $userId");

        if (empty($userId)) {
            Logger::log("User ID is empty");
            return ["success" => false, "message" => "User ID is required"];
        }

        //prepare the SQL query to fetch user profile details
        $query = "SELECT id, firstName, lastName, userName, email, dob, gender, nationality, phone, street, city, state, zip FROM users WHERE id = ?"; // SQL query to fetch user profile details
        $types = "i"; // Data types for the query parameters (i = integer)
        $user = $this->db->fetchQuery($query, $types, $userId); // Execute the query and fetch the result

        if ($user && count($user) > 0) {
            Logger::log("Profile fetched successfully for userId: $userId");
            return ["success" => true, "data" => $user];
        } else {
            Logger::log("User not found for userId: $userId");
            return ["success" => false, "message" => "User not found"];
        }
    }

    // Method to update user profile
    public function updateProfile($userId, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        Logger::log("updateProfile started for userId: $userId");
            //required fields check
        if (empty($userId) || empty($firstName) || empty($lastName) || empty($email) || empty($dob) || empty($gender) || empty($nationality) || empty($phone) || empty($street) || empty($city) || empty($state) || empty($zip)) {
            Logger::log("Missing required fields for userId: $userId");
            return ["success" => false, "message" => "All fields are required"];
        }
//prepare the SQL query to update user profile details
        $query = "UPDATE users SET firstName = ?, lastName = ?, email = ?, dob = ?, gender = ?, nationality = ?, phone = ?, 
                        street = ?, city = ?, state = ?, zip = ? WHERE id = ?"; // SQL query to update user profile details
        $types = "sssssssssssi"; // Data types for the query parameters (s = string, i = integer)
        $result = $this->db->executeQuery($query, $types, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip, $userId); // Execute the query to update the user profile

        if ($result['success']) {
            Logger::log("Profile updated successfully for userId: $userId");
            return ["success" => true, "message" => "Profile updated successfully"]; // Return success message
        } else {
            Logger::log("Failed to update profile for userId: $userId - Error: {$result['message']}");
            return ["success" => false, "message" => $result['message'] ?? "Failed to update profile"]; // Return error message
        }
    }
}
?>
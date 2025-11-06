<?php
// Backend/config/UserDashboard/manageUserProfile/inc_UserProfileModel.php
// This model handles all user profile database operations

include("../../inc_databaseClass.php"); // Include database connection class
require_once __DIR__ . "/../../inc_logger.php"; // Include logger for tracking

/**
 * UserProfileModel class
 * Handles viewing and updating user profile information
 */
class UserProfileModel {
    private $db; // Database connection instance

    /**
     * Constructor - Initialize database connection
     */
    public function __construct() {
        $this->db = new DatabaseClass(); // Create new database instance
        Logger::log("UserProfileModel instantiated");
    }

    /**
     * View user profile by user ID
     */
    public function viewProfile($userId) {
        Logger::log("viewProfile started for userId: $userId");

        // Validate that user ID is provided
        if (empty($userId)) {
            Logger::log("User ID is empty");
            return ["success" => false, "message" => "User ID is required"];
        }

        // Prepare SQL query to fetch user profile details (including username)
        // Select all necessary fields except password for security
        $query = "SELECT id, firstName, lastName, username, email, dob, gender, nationality, phone, street, city, state, zip 
                  FROM users WHERE id = ?";
        $types = "i"; // Parameter type: i = integer
        
        // Execute query and fetch result
        $user = $this->db->fetchQuery($query, $types, $userId);

        // Check if user was found
        if ($user && count($user) > 0) {
            Logger::log("Profile fetched successfully for userId: $userId");
            return ["success" => true, "data" => $user];
        } else {
            Logger::log("User not found for userId: $userId");
            return ["success" => false, "message" => "User not found"];
        }
    }

    /**
     * Update user profile information
     */
    public function updateProfile($userId, $firstName, $lastName, $username, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        Logger::log("updateProfile started for userId: $userId");
        
        // Validate that all required fields are provided (including username)
        if (empty($userId) || empty($firstName) || empty($lastName) || empty($username) || 
            empty($email) || empty($dob) || empty($gender) || empty($nationality) || 
            empty($phone) || empty($street) || empty($city) || empty($state) || empty($zip)) {
            Logger::log("Missing required fields for userId: $userId");
            return ["success" => false, "message" => "All fields are required"];
        }

        // Prepare SQL query to update user profile (now includes username)
        // Updates all profile fields except password
        $query = "UPDATE users SET 
                    firstName = ?, 
                    lastName = ?, 
                    username = ?,
                    email = ?, 
                    dob = ?, 
                    gender = ?, 
                    nationality = ?, 
                    phone = ?, 
                    street = ?, 
                    city = ?, 
                    state = ?, 
                    zip = ? 
                  WHERE id = ?";
        
        // Parameter types: s = string, i = integer (12 strings + 1 integer)
        $types = "ssssssssssssi";
        
        // Execute update query with all parameters (username is now included)
        $result = $this->db->executeQuery($query, $types, $firstName, $lastName, $username, $email, $dob, 
                                          $gender, $nationality, $phone, $street, $city, $state, $zip, $userId);

        // Check if update was successful
        if ($result['success']) {
            Logger::log("Profile updated successfully for userId: $userId");
            return ["success" => true, "message" => "Profile updated successfully"];
        } else {
            Logger::log("Failed to update profile for userId: $userId - Error: {$result['message']}");
            return ["success" => false, "message" => $result['message'] ?? "Failed to update profile"];
        }
    }
}
?>

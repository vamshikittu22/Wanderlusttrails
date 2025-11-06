<?php
// path: Backend/config/auth/inc_userModel.php
// User registration model - ONLY handles user registration

include("../inc_databaseClass.php");
require_once __DIR__ . "/../inc_logger.php";

/**
 * UserModel class - Handles user registration ONLY
 * Other auth operations moved to separate files
 */
class UserModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
        Logger::log("UserModel instantiated");
    }

    /**
     * Register a new user in the database
     * @return array - Success/failure result with user data
     */
    public function registerUser($firstName, $lastName, $username, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        Logger::log("registerUser started for email: $email");

        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Logger::log("Invalid email format: $email");
            return ["success" => false, "message" => "Invalid email format"];
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Insert user
        $query = "INSERT INTO 
                        users (firstName, lastName, userName, email, password, dob, gender, nationality, phone, street, city, state, zip) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $result = $this->db->executeQuery($query, "sssssssssssss", $firstName, $lastName, $username, $email, $hashedPassword, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);
        
        Logger::log("registerUser result for email: $email - " . ($result['success'] ? "Success" : "Failed"));
        return $result;
    }
}
?>

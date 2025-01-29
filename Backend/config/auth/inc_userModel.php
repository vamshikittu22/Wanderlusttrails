<?php 
// inc_userModel.php

// Include the database class
include("../inc_databaseClass.php");

class UserModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    public function registerUser($firstName, $lastName, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        // Validate user input
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ["success" => false, "message" => "Invalid email format. use the correct email again"];
        }

        // Check for existing user with the same email
        if ($this->isEmailTaken($email)) {
            return ["success" => false, "message" => "Email is already in use. try with a new email"];
        }

        // Hash the password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Insert new user into the database
        $query = "INSERT INTO users (firstName, lastName, email, password, dob, gender, nationality, phone, street, city, state, zip) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $types = "ssssssssssss";
        return $this->db->executeQuery($query, $types, $firstName, $lastName, $email, $hashedPassword, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);
    }

    private function isEmailTaken($email) {
        // Prepare SQL statement
        $sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        $connection = $this->db->connect();
        
        // Prepare statement to prevent SQL injection
        $stmt = $connection->prepare($sql);

        if ($stmt === false) {
            // If statement preparation fails, log and return false
            error_log("Failed to prepare statement: " . $connection->error);
            return true; // assuming email is taken
        }

        // Bind parameters and execute the query
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->bind_result($count);
        $stmt->fetch();

        // If email is already taken
        if ($count > 0) {
            return true;
        }

        return false;
    }
}
?>
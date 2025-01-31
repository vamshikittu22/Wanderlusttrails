<?php
// inc_UserProfileModel.php

// Include the database class
include("../../inc_databaseClass.php");

class UserProfileModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    // Fetch user profile details
    public function getUserProfile($userId) {
        if (empty($userId)) {
            return ["success" => false, "message" => "User ID is required"];
        }

        $query = "SELECT id, firstname, lastname, email, phone FROM users WHERE id = ?";
        $types = "i";
        $user = $this->db->fetchQuery($query, $types, $userId);

        if ($user) {
            return ["success" => true, "data" => $user];
        } else {
            return ["success" => false, "message" => "User not found"];
        }
    }

    // Update user profile
    public function updateUserProfile($userId, $firstname, $lastname, $email, $phone) {
        if (empty($userId) || empty($firstname) || empty($lastname) || empty($email) || empty($phone)) {
            return ["success" => false, "message" => "All fields are required"];
        }

        $query = "UPDATE users SET firstname = ?, lastname = ?, email = ?, phone = ?, address = ? WHERE id = ?";
        $types = "sssssi";
        $result = $this->db->executeQuery($query, $types, $firstname, $lastname, $email, $phone, $userId);

        if ($result) {
            return ["success" => true, "message" => "Profile updated successfully"];
        } else {
            return ["success" => false, "message" => "Failed to update profile"];
        }
    }
}
?>

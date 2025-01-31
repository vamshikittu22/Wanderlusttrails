<?php
// inc_UserOpsModel.php

// Include the database class
include("../../inc_databaseClass.php");

class UserOpsModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    // Get all users
    public function getUsers() {
        // Prepare SQL query to fetch all users
        $query = "SELECT id, firstName, lastName, email, role FROM users";
        $types = "";

        // Execute the query
        $users = $this->db->fetchQuery($query, $types);

        if ($users) {
            return ["success" => true, "data" => $users];
        } else {
            return ["success" => false, "message" => "No users found"];
        }
    }

    // Update user role
    public function updateUserRole($userId, $role) {
        // Ensure the userId and role are provided
        if (empty($userId) || empty($role)) {
            return ["success" => false, "message" => "User ID and role are required"];
        }

        // Prepare SQL query to update the user role
        $query = "UPDATE users SET role = ? WHERE id = ?";
        $types = "si"; // string for role, integer for userId

        // Execute the query
        $result = $this->db->executeQuery($query, $types, $role, $userId);

        if ($result['success']) {
            return ["success" => true, "message" => "User role updated successfully"];
        } else {
            return ["success" => false, "message" => "Failed to update user role"];
        }
    }

    // Delete user
    public function deleteUser($userId) {
        // Ensure the userId is provided
        if (empty($userId)) {
            return ["success" => false, "message" => "User ID is required"];
        }

        // Prepare SQL query to delete the user
        $query = "DELETE FROM users WHERE id = ?";
        $types = "i"; // integer for userId

        // Execute the query
        $result = $this->db->executeQuery($query, $types, $userId);

        if ($result['success']) {
            return ["success" => true, "message" => "User deleted successfully"];
        } else {
            return ["success" => false, "message" => "Failed to delete user"];
        }
    }
}
?>

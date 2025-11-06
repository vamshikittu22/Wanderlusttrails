<?php
// path: Wanderlusttrails/Backend/config/AdminDashboard/manageUsers/inc_UsersOpsModel.php
// Handles user operations for admin.

// Include Logger and Database helper classes
require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/../../inc_databaseClass.php";

// UserOpsModel class for managing user operations like fetching users, updating roles, and deleting users
class UserOpsModel {
    private $db; // Database connection object

    // Constructor initializes the database connection and logs instantiation
    public function __construct() {
        Logger::log("UserOpsModel instantiated");
        $this->db = new DatabaseClass(); // Create a new instance of DatabaseClass to interact with DB
    }

    // Method to fetch all users with their id, first name, last name, email, and role
    public function getUsers() {
        Logger::log("getUsers started");
        $query = "SELECT 
                    id, firstName, lastName, email, role 
                  FROM users"; // SQL query to select all users
        $types = ""; // No parameters needed for this query
        $users = $this->db->fetchQuery($query, $types); // Execute the query

        if ($users) {
            Logger::log("getUsers retrieved " . count($users) . " users");
            return ["success" => true, "data" => $users]; // Return success and user list
        }
        Logger::log("getUsers failed: No users found");
        return ["success" => false, "message" => "No users found"]; // No users in DB
    }

    // Method to update the role of a user by user ID
    public function updateUserRole($userId, $role) {
        Logger::log("updateUserRole started for user_id: $userId, role: $role");

        // Validate presence of userId and role
        if (empty($userId) || empty($role)) {
            Logger::log("updateUserRole failed: User ID and role are required");
            return ["success" => false, "message" => "User ID and role are required"];
        }

        // Prepare SQL to update the role for a specific user
        $query = "UPDATE users 
                    SET role = ? 
                    WHERE id = ?";
        $types = "si"; // role is string, id is integer
        $result = $this->db->executeQuery($query, $types, $role, $userId); // Execute query with params

        if ($result['success']) {
            Logger::log("updateUserRole succeeded for user_id: $userId");
            return ["success" => true, "message" => "User role updated successfully"];
        }

        Logger::log("updateUserRole failed for user_id: $userId - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to update user role"];
    }

    // Method to delete a user by user ID
    public function deleteUser($userId) {
        Logger::log("deleteUser started for user_id: $userId");

        // Validate userId presence
        if (empty($userId)) {
            Logger::log("deleteUser failed: User ID is required");
            return ["success" => false, "message" => "User ID is required"];
        }

        // Prepare SQL query to delete user by id
        $query = "DELETE FROM users WHERE id = ?";
        $types = "i"; // id is integer
        $result = $this->db->executeQuery($query, $types, $userId); // Execute delete query

        if ($result['success']) {
            Logger::log("deleteUser succeeded for user_id: $userId");
            return ["success" => true, "message" => "User deleted successfully"];
        }

        Logger::log("deleteUser failed for user_id: $userId - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to delete user"];
    }
}
?>

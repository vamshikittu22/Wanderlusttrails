<?php
//path: Wanderlusttrails/Backend/config/AdminDashboard/manageUsers/inc_UsersOpsModel.php
// Handles user operations for admin.

require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/../../inc_databaseClass.php";

// UserOpsModel class for managing user operations
class UserOpsModel {
    private $db; // Database connection object

    // Constructor to initialize the database connection
    public function __construct() {
        Logger::log("UserOpsModel instantiated");
        $this->db = new DatabaseClass(); // Create a new instance of the DatabaseClass
    }
// Method to get users from the database
    public function getUsers() {
        Logger::log("getUsers started");
        //prepare the SQL query to select all users
        $query = "SELECT id, firstName, lastName, email, role FROM users"; // SQL query to select all users
        $types = ""; // No parameters for this query
        $users = $this->db->fetchQuery($query, $types); // Execute the query and fetch results

        if ($users) {
            Logger::log("getUsers retrieved " . count($users) . " users");
            return ["success" => true, "data" => $users]; // Return success message with user data
        }
        Logger::log("getUsers failed: No users found");
        return ["success" => false, "message" => "No users found"]; // Return failure message if no users found
    }
// Method to update user role in the database
    public function updateUserRole($userId, $role) {
        Logger::log("updateUserRole started for user_id: $userId, role: $role");
        // Validate input fields
        if (empty($userId) || empty($role)) {
            Logger::log("updateUserRole failed: User ID and role are required");
            return ["success" => false, "message" => "User ID and role are required"]; 
        }  
        //prepare the SQL query to update user role
        $query = "UPDATE users SET role = ? WHERE id = ?"; // SQL query to update user role
        $types = "si"; // Data types for the query parameters (string for role, int for userId)
        $result = $this->db->executeQuery($query, $types, $role, $userId); // Execute the query

        if ($result['success']) {
            Logger::log("updateUserRole succeeded for user_id: $userId");
            return ["success" => true, "message" => "User role updated successfully"]; // Return success message
        }
        Logger::log("updateUserRole failed for user_id: $userId - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to update user role"]; // Return failure message
    }
    // Method to delete a user from the database
    public function deleteUser($userId) {
        Logger::log("deleteUser started for user_id: $userId");
        // Validate input field
        if (empty($userId)) {
            Logger::log("deleteUser failed: User ID is required");
            return ["success" => false, "message" => "User ID is required"];
        }
        //prepare the SQL query to delete a user
        $query = "DELETE FROM users WHERE id = ?"; // SQL query to delete a user
        $types = "i";   // Data type for the query parameter (int for userId)
        $result = $this->db->executeQuery($query, $types, $userId); // Execute the query

        if ($result['success']) {
            Logger::log("deleteUser succeeded for user_id: $userId");
            return ["success" => true, "message" => "User deleted successfully"]; // Return success message
        }
        Logger::log("deleteUser failed for user_id: $userId - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to delete user"]; // Return failure message
    } 
}
?>
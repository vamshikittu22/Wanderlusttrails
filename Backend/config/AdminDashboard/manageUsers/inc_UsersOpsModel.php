<?php
//path: Wanderlusttrails/Backend/config/AdminDashboard/manageUsers/inc_UsersOpsModel.php
// Handles user operations for admin.

require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/../../inc_databaseClass.php";

class UserOpsModel {
    private $db;

    public function __construct() {
        Logger::log("UserOpsModel instantiated");
        $this->db = new DatabaseClass();
    }

    public function getUsers() {
        Logger::log("getUsers started");
        $query = "SELECT id, firstName, lastName, email, role FROM users";
        $types = "";
        $users = $this->db->fetchQuery($query, $types);

        if ($users) {
            Logger::log("getUsers retrieved " . count($users) . " users");
            return ["success" => true, "data" => $users];
        }
        Logger::log("getUsers failed: No users found");
        return ["success" => false, "message" => "No users found"];
    }

    public function updateUserRole($userId, $role) {
        Logger::log("updateUserRole started for user_id: $userId, role: $role");
        if (empty($userId) || empty($role)) {
            Logger::log("updateUserRole failed: User ID and role are required");
            return ["success" => false, "message" => "User ID and role are required"];
        }

        $query = "UPDATE users SET role = ? WHERE id = ?";
        $types = "si";
        $result = $this->db->executeQuery($query, $types, $role, $userId);

        if ($result['success']) {
            Logger::log("updateUserRole succeeded for user_id: $userId");
            return ["success" => true, "message" => "User role updated successfully"];
        }
        Logger::log("updateUserRole failed for user_id: $userId - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to update user role"];
    }

    public function deleteUser($userId) {
        Logger::log("deleteUser started for user_id: $userId");
        if (empty($userId)) {
            Logger::log("deleteUser failed: User ID is required");
            return ["success" => false, "message" => "User ID is required"];
        }

        $query = "DELETE FROM users WHERE id = ?";
        $types = "i";
        $result = $this->db->executeQuery($query, $types, $userId);

        if ($result['success']) {
            Logger::log("deleteUser succeeded for user_id: $userId");
            return ["success" => true, "message" => "User deleted successfully"];
        }
        Logger::log("deleteUser failed for user_id: $userId - " . ($result['message'] ?? "Unknown error"));
        return ["success" => false, "message" => $result['message'] ?? "Failed to delete user"];
    }
}
?>
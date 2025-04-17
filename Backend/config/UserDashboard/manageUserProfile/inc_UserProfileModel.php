<?php
// Backend/config/UserDashboard/manageUserProfile/inc_UserProfileModel.php
include("../../inc_databaseClass.php");
require_once __DIR__ . "/../../inc_logger.php";

class UserProfileModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
        Logger::log("UserProfileModel instantiated");
    }

    public function viewProfile($userId) {
        Logger::log("viewProfile started for userId: $userId");

        if (empty($userId)) {
            Logger::log("User ID is empty");
            return ["success" => false, "message" => "User ID is required"];
        }

        $query = "SELECT id, firstName, lastName, email, dob, gender, nationality, phone, street, city, state, zip FROM users WHERE id = ?";
        $types = "i";
        $user = $this->db->fetchQuery($query, $types, $userId);

        if ($user && count($user) > 0) {
            Logger::log("Profile fetched successfully for userId: $userId");
            return ["success" => true, "data" => $user];
        } else {
            Logger::log("User not found for userId: $userId");
            return ["success" => false, "message" => "User not found"];
        }
    }

    public function updateProfile($userId, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        Logger::log("updateProfile started for userId: $userId");

        if (empty($userId) || empty($firstName) || empty($lastName) || empty($email) || empty($dob) || empty($gender) || empty($nationality) || empty($phone) || empty($street) || empty($city) || empty($state) || empty($zip)) {
            Logger::log("Missing required fields for userId: $userId");
            return ["success" => false, "message" => "All fields are required"];
        }

        $query = "UPDATE users SET firstName = ?, lastName = ?, email = ?, dob = ?, gender = ?, nationality = ?, phone = ?, street = ?, city = ?, state = ?, zip = ? WHERE id = ?";
        $types = "sssssssssssi";
        $result = $this->db->executeQuery($query, $types, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip, $userId);

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
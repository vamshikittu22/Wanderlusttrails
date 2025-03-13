<?php
include("../../inc_databaseClass.php");

class UserProfileModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    public function viewProfile($userId) {
        if (empty($userId)) {
            return ["success" => false, "message" => "User ID is required"];
        }
        $query = "SELECT id, firstName, lastName, email, dob, gender, nationality, phone, street, city, state, zip FROM users WHERE id = ?";
        $types = "i";
        $user = $this->db->fetchQuery($query, $types, $userId);
        if ($user && count($user) > 0) {
            return ["success" => true, "data" => $user];
        } else {
            return ["success" => false, "message" => "User not found"];
        }
    }

    public function updateProfile($userId, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip) {
        if (empty($userId) || empty($firstName) || empty($lastName) || empty($email) || empty($dob) || empty($gender) || empty($phone) || empty($nationality) || empty($street) || empty($city) || empty($state) || empty($zip)) {
            return ["success" => false, "message" => "All fields are required"];
        }
        $query = "UPDATE users SET firstName = ?, lastName = ?, email = ?, dob = ?, gender = ?, nationality = ?, phone = ?, street = ?, city = ?, state = ?, zip = ? WHERE id = ?";
        $types = "sssisssssssi"; // Adjusted for dob as string
        $result = $this->db->executeQuery($query, $types, $firstName, $lastName, $email, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip, $userId);
        if ($result['success']) {
            return ["success" => true, "message" => "Profile updated successfully"];
        } else {
            return ["success" => false, "message" => $result['message'] ?? "Failed to update profile"];
        }
    }
}
?>
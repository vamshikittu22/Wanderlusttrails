<?php
// signupuser.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include("inc_UserModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate incoming data
    $firstName = $data['firstName'] ?? '';
    $lastName = $data['lastName'] ?? '';
    $email = filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL);
    $password = $data['password'] ?? '';
    $dob = $data['dob'] ?? '';
    $gender = $data['gender'] ?? '';
    $nationality = $data['nationality'] ?? '';
    $phone = $data['phone'] ?? '';
    $street = $data['street'] ?? '';
    $city = $data['city'] ?? '';
    $state = $data['state'] ?? '';
    $zip = $data['zip'] ?? '';

    // Instantiate UserModel
    $userModel = new UserModel();
    $result = $userModel->registerUser($firstName, $lastName, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);

    echo json_encode($result);
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>

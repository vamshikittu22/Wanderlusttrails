<?php
// auth.php

// Enable CORS for testing (only during development)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$servername = "localhost"; // XAMPP default
$username = "root"; // XAMPP default
$password = ""; // XAMPP default
$dbname = "wanderlust"; //  database name

$conn = new mysqli($servername, $username, $password, $dbname);

// Check database connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Read JSON data from the request
$data = json_decode(file_get_contents("php://input"), true);

// validate incoming data 
$firstName = $data['firstName']; 
$lastName = $data['lastName'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_BCRYPT); // Encrypt password
$dob = $data['dob'];
$gender = $data['gender'];
$nationality = $data['nationality'];
$phone = $data['phone'];
$street = $data['street'];
$city = $data['city'];
$state = $data['state'];
$zip = $data['zip'];


// Insert user data into the database
$stmt = $conn->prepare("INSERT INTO users (firstName, lastName, email, password, dob, gender, nationality, phone, street, city, state, zip) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssssssssss", $firstName, $lastName, $email, $password, $dob, $gender, $nationality, $phone, $street, $city, $state, $zip);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "User registered successfully!"]);
} else {
    // error handling: Showing the specific SQL error
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]); 
}

$stmt->close();
$conn->close();
?>
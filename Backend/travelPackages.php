<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connect to MySQL database
$conn = new mysqli('localhost', 'root', '', 'wanderlust');

// Check for connection error
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch data from the database
$sql = "SELECT * FROM packages";
$result = $conn->query($sql);

$travelData = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $travelData[] = $row;
    }
}

// Close connection
$conn->close();

// Return data as JSON
echo json_encode($travelData);
?>

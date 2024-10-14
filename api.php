<?php
header("Access-Control-Allow-Origin: *"); // Allow cross-origin requests for development
header("Content-Type: application/json");

// Sample data
$response = array("message" => "Hello from PHP API using Vite!");

// Send JSON response
echo json_encode($response);
?>

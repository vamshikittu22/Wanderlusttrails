<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connect to MySQL database
$conn = new mysqli('localhost', 'root', '', 'wanderlusttrails');

// Check for connection error
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch the sort parameter from the URL
$sortOrder = isset($_GET['sort']) ? $_GET['sort'] : 'none'; // 'none', 'price_asc', 'price_desc', 'name_asc', 'name_desc'

// Build the SQL query with sorting
$sql = "SELECT * FROM packages";

// Modify the SQL query based on the sorting order
switch ($sortOrder) {
    case 'price_asc':
        $sql .= " ORDER BY CAST(price AS DECIMAL(10,2)) ASC";
        break;
    case 'price_desc':
        $sql .= " ORDER BY CAST(price AS DECIMAL(10,2)) DESC";
        break;
    case 'name_asc':
        $sql .= " ORDER BY name ASC";
        break;
    case 'name_desc':
        $sql .= " ORDER BY name DESC";
        break;
    default:
        break; // No sorting if $sortOrder is 'none' or invalid
}

// Execute the query and fetch data
$result = $conn->query($sql);

$travelData = array();
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
       // $row['image'] = base64_encode($row['image']); // Convert binary to Base64
        $travelData[] = $row;
    }
}

// Close connection
$conn->close();

// Log the query for debugging
error_log("Executed SQL Query: " . $sql);

// Return data as JSON
echo json_encode($travelData);
?>

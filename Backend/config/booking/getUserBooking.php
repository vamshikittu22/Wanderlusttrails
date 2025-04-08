
<?php
// Backend/config/booking/getUserBookings.php (Note the plural "Bookings")

/*******
 * API Endpoint to Fetch User Bookings for WanderlustTrails
 *******/

header("Access-Control-Allow-Origin: http://localhost:5173"); // Specific origin for security
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

file_put_contents(__DIR__ . "/../logs/debug.log", "getUserBookings API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Handling OPTIONS request\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_bookingModel.php";

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : '';
    
    // Validate user_id
    if (empty($userId) || !is_numeric($userId)) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid or missing user_id: " . $userId . "\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid numeric user_id is required"]);
        exit;
    }

    $userId = (int)$userId; // Cast to integer for safety
    file_put_contents(__DIR__ . "/../logs/debug.log", "Fetching bookings for user_id: $userId\n", FILE_APPEND);
    
    $bookingModel = new BookingModel();
    $result = $bookingModel->getUserBookings($userId);

    if ($result['success']) {
        if (empty($result['data'])) {
            file_put_contents(__DIR__ . "/../logs/debug.log", "No bookings found for user_id: $userId\n", FILE_APPEND);
            http_response_code(200); // Still success, just no data
            echo json_encode(["success" => true, "data" => [], "message" => "No bookings found"]);
        } else {
            file_put_contents(__DIR__ . "/../logs/debug.log", "Bookings fetched successfully for user_id: $userId\n", FILE_APPEND);
            http_response_code(200);
            echo json_encode($result);
        }
    } else {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Error fetching bookings for user_id: $userId - " . json_encode($result) . "\n", FILE_APPEND);
        http_response_code(500); // Internal server error for model failure
        echo json_encode($result);
    }
    exit;
}

file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>
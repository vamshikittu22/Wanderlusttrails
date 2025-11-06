<?php
// Set CORS headers to allow requests from your frontend (localhost:5173)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

    $autoloadPath = __DIR__ . '/../../vendor/autoload.php';
    
    if (!file_exists($autoloadPath) || !is_readable($autoloadPath)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Composer autoloader not found'
        ]);
        exit;
    }
    
    require_once $autoloadPath;


// Load database config and mail helper
$includePath = __DIR__ . "/../../db/inc_dbconfig.php";
if (!file_exists($includePath) || !is_readable($includePath)) {
    // If DB config is missing, return error
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database config file not found or not readable at $includePath"]);
    exit;
}
require_once $includePath;
require_once __DIR__ . '/../incMailerHelper.php'; // Reusable mail helper

// Connect to the database
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    // If DB connection fails, return error
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Read JSON POST data from request body
$data = json_decode(file_get_contents('php://input'), true);

// --- Build email details based on request type ---
if (isset($data['todo_id'])) {
    // Handle todo reminder email
    $todoId = (int)$data['todo_id'];
    if (!$todoId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Todo ID is required']);
        exit;
    }
    // Fetch todo and user details from DB
    $sql = "SELECT t.*, u.email, u.firstName, u.lastName FROM todos t JOIN users u ON t.user_id = u.id WHERE t.id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to prepare SQL statement: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $todoId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Todo not found']);
        exit;
    }
    $todo = $result->fetch_assoc();
    $email = $todo['email'];
    $firstName = $todo['firstName'] ?? 'User';
    $task = $todo['task'];
    $dueDate = $todo['due_date'];
    // Prepare email subject and body
    $subject = "Reminder: Upcoming Todo - " . htmlspecialchars($task);
    $body = "<h2>Todo Reminder</h2><p>Hello {$firstName},</p><p>This is a reminder about your upcoming todo:</p><p><strong>Task:</strong> " . htmlspecialchars($task) . "</p><p><strong>Due Date:</strong> " . htmlspecialchars($dueDate) . "</p><p>Please complete it on time!</p><p>Best regards,<br>Wanderlust Trails Team</p>";
    $altBody = "Todo Reminder\nHello {$firstName},\nYour todo '{$task}' is due on {$dueDate}. Please complete it on time!";
    // Send the email using the helper
    $mailResult = sendMail($email, $firstName, $subject, $body, $altBody);
    // If email sent, update reminder_sent flag in DB
    if ($mailResult["success"]) {
        $updateSql = "UPDATE todos SET reminder_sent = 1 WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        if ($updateStmt) {
            $updateStmt->bind_param("i", $todoId);
            $updateStmt->execute();
            $updateStmt->close();
        }
    }
    // Return JSON response
    echo json_encode([
        'success' => $mailResult["success"],
        'message' => $mailResult["message"],
        'todo_id' => $todoId
    ]);
    exit;
}

if (isset($data['booking_id'])) {
    // Handle booking reminder email
    $bookingId = (int)$data['booking_id'];
    if (!$bookingId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
        exit;
    }
    // Fetch booking and user details from DB
    $sql = "SELECT b.*, u.email, u.firstName, u.lastName FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to prepare SQL statement: ' . $conn->error]);
        exit;
    }
    $stmt->bind_param("i", $bookingId);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Booking not found']);
        exit;
    }
    $booking = $result->fetch_assoc();
    $email = $booking['email'];
    $firstName = $booking['firstName'] ?? '';
    $lastName = $booking['lastName'] ?? '';
    $name = trim("$firstName $lastName") ?: substr($email, 0, strpos($email, '@'));
    $bookingType = $booking['booking_type'] ?? 'Unknown';
    $totalPrice = $booking['total_price'] ?? 0;
    $startDate = $data['start_date'] ?? '';
    $endDate = $data['end_date'] ?? '';
    // Prepare email subject and body
    $subject = "Booking Reminder for #$bookingId";
    $body = "<h2>Booking Reminder</h2><p>Dear {$name},</p><p>This is a reminder for your upcoming booking:</p><ul><li><strong>Booking ID:</strong> #$bookingId</li><li><strong>Booking Type:</strong> {$bookingType}</li><li><strong>Start Date:</strong> {$startDate}</li><li><strong>End Date:</strong> {$endDate}</li><li><strong>Total Price:</strong> $" . number_format($totalPrice, 2) . "</li></ul><p>Please ensure you are prepared for your trip. Contact us if you need to make changes.</p><p>Best regards,<br>WanderlustTrails Team</p>";
    $altBody = "Booking Reminder\nDear {$name},\nYour booking #{$bookingId} ({$bookingType}) starts on {$startDate} and ends on {$endDate}. Total price: $" . number_format($totalPrice, 2) . ".";
    // Send the email using the helper
    $mailResult = sendMail($email, $name, $subject, $body, $altBody);
    // If email sent, update reminder_sent flag in DB
    if ($mailResult["success"]) {
        $updateSql = "UPDATE bookings SET reminder_sent = 1 WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        if ($updateStmt) {
            $updateStmt->bind_param("i", $bookingId);
            $updateStmt->execute();
            $updateStmt->close();
        }
    }
    // Return JSON response
    echo json_encode([
        'success' => $mailResult["success"],
        'message' => $mailResult["message"],
        'booking_id' => $bookingId
    ]);
    exit;
}

// If no valid mailing action specified, return error
http_response_code(400);
echo json_encode(['success' => false, 'message' => 'No valid mailing action specified.']);
$conn->close();
?>

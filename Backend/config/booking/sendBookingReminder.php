<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
include_once __DIR__ . '/../inc_logger.php';

// Set CORS headers to allow requests from http://localhost:5173
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Added Authorization for potential future use

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header("Access-Control-Max-Age: 86400"); // Cache preflight response for 24 hours
    echo json_encode(["message" => "CORS preflight request successful"]);
    exit;
}

// Define path to database config file and check if readable before including
$includePath = __DIR__ . "/../../db/inc_dbconfig.php";
if (!file_exists($includePath) || !is_readable($includePath)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database config file not found or not readable at $includePath"]);
    exit;
}
require_once $includePath;

// Include PHPMailer via Composer autoload
require_once '../../vendor/autoload.php';

// Establish database connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check for connection errors and respond accordingly
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Log successful DB connection for debugging
Logger::log("Database connection established successfully");

// Read JSON POST data from request body
$data = json_decode(file_get_contents('php://input'), true);

// Log received data for debugging
Logger::log('[sendBookingReminder.php] Received data: ' . print_r($data, true));

// Extract and validate bookingid
    $bookingId = isset($data['bookingid']) ? intval($data['bookingid']) : null;

    // ✅ Better validation with debug logging
    if (!$bookingId || $bookingId <= 0) {
        http_response_code(400);
        Logger::log("sendBookingReminder.php - Booking ID validation failed. Received: " . var_export($bookingId, true));
        echo json_encode([
            "success" => false, 
            "message" => "Booking ID is required and must be a positive integer",
            "debug" => "bookingId=" . var_export($bookingId, true)
        ]);
        exit;
    }

// Extract optional fields
$userId = isset($data['user_id']) ? (int)$data['user_id'] : null;
$userFullName = $data['userFullName'] ?? 'Guest';
$startDate = $data['start_date'] ?? '';
$endDate = $data['end_date'] ?? '';
Logger::log("Preparing to send reminder for booking_id: $bookingId, user_id: $userId");

// Prepare SQL to get booking details and associated user's email and name
$sql = "SELECT b.*, u.email, u.firstName, u.lastName 
        FROM bookings b 
        JOIN users u ON b.user_id = u.id 
        WHERE b.id = ?";
$stmt = $conn->prepare($sql);

// Check for SQL prepare errors
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to prepare SQL statement: ' . $conn->error]);
    exit;
}

// Bind booking_id parameter to the prepared statement and execute
$stmt->bind_param("i", $bookingId);
$stmt->execute();

// Get the result set from the executed query
$result = $stmt->get_result();
Logger::log('Fetched booking details for booking_id: ' . $bookingId);

// Check if booking exists; if not, respond with 404
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Booking not found']);
    exit;
}

// Fetch booking record data
$booking = $result->fetch_assoc();
Logger::log('Booking data: ' . print_r($booking, true));

// Extract email, booking details, and user name from result
$email = $booking['email'];
$bookingType = $booking['booking_type'] ?? 'Unknown';
$totalPrice = $booking['total_price'] ?? 0;
$firstName = $booking['firstName'] ?? '';
$lastName = $booking['lastName'] ?? '';
$name = trim("$firstName $lastName") ?: substr($email, 0, strpos($email, '@'));

// Close the select statement
$stmt->close();

// Create a new PHPMailer instance
$mail = new PHPMailer(true);
Logger::log('Preparing to send email to ' . $email);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    
    //get mail & password from mail_config.php
    $mailConfig = require __DIR__ . '/../mail_config.php';
    $mail->Username = $mailConfig['MAIL_USERNAME'];
    $mail->Password = $mailConfig['MAIL_PASSWORD'];

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('wanderlusttrailsproject@gmail.com', 'WanderlustTrails');
    $mail->addAddress($email, $name);

    $mail->isHTML(true);
    $mail->Subject = "Booking Reminder for #$bookingId";
    $mail->Body = "
        <h2>Booking Reminder</h2>
        <p>Dear {$name},</p>
        <p>This is a reminder for your upcoming booking:</p>
        <ul>
            <li><strong>Booking ID:</strong> #$bookingId</li>
            <li><strong>Booking Type:</strong> {$bookingType}</li>
            <li><strong>Start Date:</strong> {$startDate}</li>
            <li><strong>End Date:</strong> {$endDate}</li>
            <li><strong>Total Price:</strong> $" . number_format($totalPrice, 2) . "</li>
        </ul>
        <p>Please ensure you are prepared for your trip. Contact us if you need to make changes.</p>
        <p>Best regards,<br>WanderlustTrails Team</p>
    ";
    $mail->AltBody = "Booking Reminder for #$bookingId\n\nDear {$name},\n\nThis is a reminder for your upcoming booking:\nBooking Type: {$bookingType}\nStart Date: {$startDate}\nEnd Date: {$endDate}\nTotal Price: $" . number_format($totalPrice, 2) . "\n\nPlease ensure you are prepared for your trip. Contact us if you need to make changes.\n\nBest regards,\nWanderlustTrails Team";

    $mail->send();
    Logger::log('[sendBookingReminder.php] Email sent successfully');

    $update_sql = "UPDATE bookings SET reminder_sent = 1 WHERE id = ?";
    $update_stmt = $conn->prepare($update_sql);

    if (!$update_stmt) {
        Logger::log('[sendBookingReminder.php] Failed to prepare update SQL statement: ' . $conn->error);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update reminder status: ' . $conn->error]);
        exit;
    }

    $update_stmt->bind_param("i", $bookingId);
    $update_stmt->execute();
    $update_stmt->close();
    Logger::log('[sendBookingReminder.php] Reminder sent and updated for booking_id: ' . $bookingId);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Reminder sent successfully']);
} catch (Exception $e) {
    Logger::log('[sendBookingReminder.php] Email could not be sent. Mailer Error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}

// Close database connection
$conn->close();
?>
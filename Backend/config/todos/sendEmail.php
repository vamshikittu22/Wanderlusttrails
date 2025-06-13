<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Set CORS headers to allow requests from your frontend at localhost:5173
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
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
error_log('[sendBookingReminder.php] Database connection established');

// Read JSON POST data from request body
$data = json_decode(file_get_contents('php://input'), true);

// Log received data for debugging
error_log('[sendBookingReminder.php] Received data: ' . print_r($data, true));

// Extract booking_id from the decoded JSON, cast to int; fallback to null if missing
$bookingId = isset($data['booking_id']) ? (int)$data['booking_id'] : null;

// Validate that booking_id is provided, otherwise respond with 400 error
if (!$bookingId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
    exit;
}

// Extract optional fields
$userId = isset($data['user_id']) ? (int)$data['user_id'] : null;
$userFullName = $data['userFullName'] ?? 'Guest';
$startDate = $data['start_date'] ?? '';
$endDate = $data['end_date'] ?? '';

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

// Check if booking exists; if not, respond with 404
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Booking not found']);
    exit;
}

// Fetch booking record data
$booking = $result->fetch_assoc();

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

try {
    // Set up SMTP configuration for sending mail via Gmail SMTP server
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'wanderlusttrailsproject@gmail.com'; // SMTP username (email)
    $mail->Password = 'rlpw frou gnni ftmv'; // SMTP password (app password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Enable TLS encryption
    $mail->Port = 587; // SMTP port

    // Set the sender's email and name
    $mail->setFrom('wanderlusttrailsproject@gmail.com', 'WanderlustTrails');

    // Add recipient email and name
    $mail->addAddress($email, $name);

    // Set email format to HTML
    $mail->isHTML(true);

    // Email subject
    $mail->Subject = "Booking Reminder for #$bookingId";

    // HTML email body
    $mail->Body = "
        <h2>Booking Reminder</h2>
        <p>Dear {$name},</p>
        <p>This is a reminder for your upcoming booking:</p>
        <ul>
            <li><strong>Booking ID:</strong> #$bookingId</li>
            <li><strong>Booking Type:</strong> {$bookingType}</li>
            <li><strong>Start Date:</strong> {$startDate}</li>
            <li><strong>End Date:</strong> {$endDate}</li>
            <li><strong>Total Price:</strong> $${number_format($totalPrice, 2)}</li>
        </ul>
        <p>Please ensure you are prepared for your trip. Contact us if you need to make changes.</p>
        <p>Best regards,<br>WanderlustTrails Team</p>
    ";

    // Plain text email body for non-HTML email clients
    $mail->AltBody = "Booking Reminder for #$bookingId\n\nDear {$name},\n\nThis is a reminder for your upcoming booking:\nBooking Type: {$bookingType}\nStart Date: {$startDate}\nEnd Date: {$endDate}\nTotal Price: $${number_format($totalPrice, 2)}\n\nPlease ensure you are prepared for your trip. Contact us if you need to make changes.\n\nBest regards,\nWanderlustTrails Team";

    // Send the email
    $mail->send();

    // Update the booking's reminder_sent flag to 1 after successful email sending
    $update_sql = "UPDATE bookings SET reminder_sent = 1 WHERE id = ?";
    $update_stmt = $conn->prepare($update_sql);

    // Check update SQL preparation failure
    if (!$update_stmt) {
        error_log('[sendBookingReminder.php] Failed to prepare update SQL statement: ' . $conn->error);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update reminder status: ' . $conn->error]);
        exit;
    }

    // Bind booking_id parameter and execute update query
    $update_stmt->bind_param("i", $bookingId);
    $update_stmt->execute();
    $update_stmt->close();

    // Log success for debug
    error_log("[sendBookingReminder.php] Reminder sent and updated for booking_id: $bookingId");

    // Respond with success JSON
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Reminder sent successfully']);
} catch (Exception $e) {
    // Log error if mail sending fails
    error_log('[sendBookingReminder.php] Email could not be sent. Mailer Error: ' . $mail->ErrorInfo);
    // Respond with failure JSON and error message
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}

// Close database connection
$conn->close();
?>
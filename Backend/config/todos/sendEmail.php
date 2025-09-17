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
error_log('[sendEmail.php] Database connection established');

// Read JSON POST data from request body
$data = json_decode(file_get_contents('php://input'), true);

// Log received data for debugging
error_log('[sendEmail.php] Received data: ' . print_r($data, true));

// Check if this is a todo reminder or booking reminder
if (isset($data['todo_id'])) {
    // Handle todo reminder
    $todoId = (int)$data['todo_id'];
    
    // Validate that todo_id is provided and valid
    if (!$todoId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Todo ID is required']);
        exit;
    }
    
    // Get todo details
    $sql = "SELECT t.*, u.email, u.firstName, u.lastName 
            FROM todos t 
            JOIN users u ON t.user_id = u.id 
            WHERE t.id = ?";
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
    
    // Format the email
    $subject = "Reminder: Upcoming Todo - " . htmlspecialchars($task);
    $message = "
    <html>
    <head>
        <title>Todo Reminder</title>
    </head>
    <body>
        <h2>Todo Reminder</h2>
        <p>Hello {$firstName},</p>
        <p>This is a reminder about your upcoming todo:</p>
        <p><strong>Task:</strong> " . htmlspecialchars($task) . "</p>
        <p><strong>Due Date:</strong> " . htmlspecialchars($dueDate) . "</p>
        <p>Please complete it on time!</p>
        <p>Best regards,<br>Wanderlust Trails Team</p>
    </body>
    </html>
    ";
    
} elseif (isset($data['booking_id'])) {
    // Handle booking reminder
    $bookingId = (int)$data['booking_id'];
    
    if (!$bookingId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Booking ID is required']);
        exit;
    }
    
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
    $startDate = $data['start_date'] ?? '';
    $endDate = $data['end_date'] ?? '';

    // Format the email
    $subject = "Booking Reminder for #$bookingId";
    $message = "
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

} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Either todo_id or booking_id is required']);
    exit;
}

// Send the email using PHPMailer
try {
    $mail = new PHPMailer(true);
    
    // Server settings
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'wanderlusttrailsproject@gmail.com'; // SMTP username (email)
    $mail->Password = 'rlpw frou gnni ftmv'; // SMTP password (app password)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // Recipients
    $mail->setFrom('wanderlusttrailsproject@gmail.com', 'WanderlustTrails');
    $mail->addAddress($email, $firstName);
    
    // Content
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $message;
    
    $mail->send();
    
    // If it was a todo reminder, update the reminder_sent flag
    if (isset($todoId)) {
        $updateSql = "UPDATE todos SET reminder_sent = 1 WHERE id = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("i", $todoId);
        $updateStmt->execute();
    } elseif (isset($bookingId)) {
        // Update the booking's reminder_sent flag to 1 after successful email sending
        $update_sql = "UPDATE bookings SET reminder_sent = 1 WHERE id = ?";
        $update_stmt = $conn->prepare($update_sql);

        // Check update SQL preparation failure
        if (!$update_stmt) {
            error_log('[sendEmail.php] Failed to prepare update SQL statement: ' . $conn->error);
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update reminder status: ' . $conn->error]);
            exit;
        }

        // Bind booking_id parameter and execute update query
        $update_stmt->bind_param("i", $bookingId);
        $update_stmt->execute();
        $update_stmt->close();
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Email reminder sent successfully',
        'todo_id' => $todoId ?? null,
        'booking_id' => $bookingId ?? null
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Message could not be sent. Mailer Error: ' . $mail->ErrorInfo
    ]);
}

// Close database connection
$conn->close();
?>
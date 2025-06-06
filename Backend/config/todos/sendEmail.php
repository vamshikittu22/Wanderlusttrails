<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

$includePath = __DIR__ . "/../../db/inc_dbconfig.php";
if (!file_exists($includePath) || !is_readable($includePath)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database config file not found or not readable at $includePath"]);
    exit;
}
require_once $includePath;

require_once '../../vendor/autoload.php';

// Establish database connection
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

error_log('[sendEmail.php] Database connection established');

$data = json_decode(file_get_contents('php://input'), true);
error_log('[sendEmail.php] Received data: ' . print_r($data, true));

$todo_id = isset($data['todo_id']) ? (int)$data['todo_id'] : null;

if (!$todo_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Todo ID is required']);
    exit;
}

// Updated query to select firstName and lastName instead of name
$sql = "SELECT t.*, u.email, u.firstName, u.lastName FROM todos t JOIN users u ON t.user_id = u.id WHERE t.id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to prepare SQL statement: ' . $conn->error]);
    exit;
}
$stmt->bind_param("i", $todo_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Todo not found']);
    exit;
}

$todo = $result->fetch_assoc();
$email = $todo['email'];
$task = $todo['task'];
$due_date = $todo['due_date'];
// Construct name from firstName and lastName, fallback to email if either is missing
$firstName = $todo['firstName'] ?? '';
$lastName = $todo['lastName'] ?? '';
$name = trim("$firstName $lastName") ?: substr($email, 0, strpos($email, '@'));

$stmt->close();

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'wanderlusttrailsproject@gmail.com'; // Your email address
    $mail->Password = 'rlpw frou gnni ftmv'; // Your app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Use the sender's email from the configured account
    $mail->setFrom('wanderlusttrailsproject@gmail.com', 'WanderlustTrails');
    $mail->addAddress($email, $name);

    $mail->isHTML(true);
    $mail->Subject = 'Reminder: Your Todo is Due Soon!';
    $mail->Body = "
        <h2>Todo Reminder</h2>
        <p>Dear {$name},</p>
        <p>This is a reminder for your todo:</p>
        <p><strong>Task:</strong> {$task}</p>
        <p><strong>Due Date:</strong> {$due_date}</p>
        <p>Please complete it on time!</p>
        <p>Best regards,<br>WanderlustTrails Team</p>
    ";
    $mail->AltBody = "Todo Reminder\n\nDear {$name},\n\nThis is a reminder for your todo:\nTask: {$task}\nDue Date: {$due_date}\n\nPlease complete it on time!\n\nBest regards,\nWanderlustTrails Team";

    $mail->send();

    // Update reminder_sent flag after successful email send
    $update_sql = "UPDATE todos SET reminder_sent = 1 WHERE id = ?";
    $update_stmt = $conn->prepare($update_sql);
    if (!$update_stmt) {
        error_log('[sendEmail.php] Failed to prepare update SQL statement: ' . $conn->error);
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to update reminder status: ' . $conn->error]);
        exit;
    }
    $update_stmt->bind_param("i", $todo_id);
    $update_stmt->execute();
    $update_stmt->close();

    error_log("[sendEmail.php] Reminder sent and updated for todo_id: $todo_id");

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} catch (Exception $e) {
    error_log('[sendEmail.php] Email could not be sent. Mailer Error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"]);
}

$conn->close();
?>
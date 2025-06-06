<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once '../../vendor/autoload.php';
require_once '../../db/inc_dbconfig.php';

// Establish database connection
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    error_log('[scheduleReminders.php] Database connection failed: ' . $conn->connect_error);
    echo "Database connection failed: " . $conn->connect_error;
    exit;
}

error_log('[scheduleReminders.php] Database connection established');

// Calculate tomorrow's date
$tomorrow = date('Y-m-d', strtotime('+1 day'));
error_log('[scheduleReminders.php] Checking todos due on: ' . $tomorrow);

// Fetch todos due tomorrow that haven't had a reminder sent
$sql = "SELECT t.*, u.email, u.firstName, u.lastName FROM todos t JOIN users u ON t.user_id = u.id WHERE t.due_date = ? AND t.reminder_sent = 0";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log('[scheduleReminders.php] Failed to prepare SQL statement: ' . $conn->error);
    echo "Failed to prepare SQL statement: " . $conn->error;
    exit;
}
$stmt->bind_param("s", $tomorrow);
$stmt->execute();
$result = $stmt->get_result();

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'wanderlusttrailsproject@gmail.com'; // Your email address
    $mail->Password = 'rlpw frou gnni ftmv'; // Your app password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Set the sender email to match the SMTP username
    $mail->setFrom('wanderlusttrailsproject@gmail.com', 'WanderlustTrails');

    if ($result->num_rows > 0) {
        while ($todo = $result->fetch_assoc()) {
            $email = $todo['email'];
            $task = $todo['task'];
            $due_date = $todo['due_date'];
            // Construct name from firstName and lastName, fallback to email if missing
            $firstName = $todo['firstName'] ?? '';
            $lastName = $todo['lastName'] ?? '';
            $name = trim("$firstName $lastName") ?: substr($email, 0, strpos($email, '@'));
            $todo_id = $todo['id'];

            error_log("[scheduleReminders.php] Sending reminder for todo_id: $todo_id to $email");

            // Send email
            $mail->addAddress($email, $name);
            $mail->isHTML(true);
            $mail->Subject = 'Reminder: Your Todo is Due Tomorrow!';
            $mail->Body = "
                <h2>Todo Reminder</h2>
                <p>Dear {$name},</p>
                <p>This is a reminder that your todo is due tomorrow:</p>
                <p><strong>Task:</strong> {$task}</p>
                <p><strong>Due Date:</strong> {$due_date}</p>
                <p>Please complete it on time!</p>
                <p>Best regards,<br>WanderlustTrails Team</p>
            ";
            $mail->AltBody = "Todo Reminder\n\nDear {$name},\n\nThis is a reminder that your todo is due tomorrow:\nTask: {$task}\nDue Date: {$due_date}\n\nPlease complete it on time!\n\nBest regards,\nWanderlustTrails Team";

            $mail->send();

            // Update reminder_sent flag
            $update_sql = "UPDATE todos SET reminder_sent = 1 WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);
            if (!$update_stmt) {
                error_log('[scheduleReminders.php] Failed to prepare update SQL statement: ' . $conn->error);
                echo "Failed to prepare update SQL statement: " . $conn->error;
                exit;
            }
            $update_stmt->bind_param("i", $todo_id);
            $update_stmt->execute();
            $update_stmt->close();

            error_log("[scheduleReminders.php] Reminder sent and updated for todo_id: $todo_id");

            $mail->clearAddresses();
        }
        echo "Reminders sent successfully.";
    } else {
        error_log('[scheduleReminders.php] No todos due tomorrow with reminder_sent = 0');
        echo "No reminders to send.";
    }
} catch (Exception $e) {
    error_log('[scheduleReminders.php] Error sending reminders: ' . $mail->ErrorInfo);
    echo "Error sending reminders: " . $mail->ErrorInfo;
}

$stmt->close();
$conn->close();
?>
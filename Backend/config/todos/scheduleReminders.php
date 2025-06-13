<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load PHPMailer and database config via Composer autoload and local config file
require_once '../../vendor/autoload.php';
require_once '../../db/inc_dbconfig.php';

// Establish database connection using mysqli
$conn = new mysqli($host, $username, $password, $dbname);

// Check if the connection failed, log and exit if yes
if ($conn->connect_error) {
    error_log('[scheduleReminders.php] Database connection failed: ' . $conn->connect_error);
    echo "Database connection failed: " . $conn->connect_error;
    exit;
}

// Log successful database connection
error_log('[scheduleReminders.php] Database connection established');

// Calculate tomorrow's date in Y-m-d format
$tomorrow = date('Y-m-d', strtotime('+1 day'));
error_log('[scheduleReminders.php] Checking todos due on: ' . $tomorrow);

// Prepare SQL to select todos due tomorrow with reminder_sent = 0, joining with user info for email and name
$sql = "SELECT t.*, u.email, u.firstName, u.lastName 
        FROM todos t 
        JOIN users u ON t.user_id = u.id 
        WHERE t.due_date = ? AND t.reminder_sent = 0";

// Prepare the statement to prevent SQL injection
$stmt = $conn->prepare($sql);

// Check if statement preparation failed, log error and exit
if (!$stmt) {
    error_log('[scheduleReminders.php] Failed to prepare SQL statement: ' . $conn->error);
    echo "Failed to prepare SQL statement: " . $conn->error;
    exit;
}

// Bind the parameter for the prepared statement (tomorrow's date)
$stmt->bind_param("s", $tomorrow);

// Execute the query
$stmt->execute();

// Get the result set from the executed statement
$result = $stmt->get_result();

// Initialize PHPMailer object
$mail = new PHPMailer(true);

try {
    // Server settings for PHPMailer SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'wanderlusttrailsproject@gmail.com'; // Your Gmail address
    $mail->Password = 'rlpw frou gnni ftmv'; // Your app-specific password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Use TLS encryption
    $mail->Port = 587;

    // Set sender's email and name
    $mail->setFrom('wanderlusttrailsproject@gmail.com', 'WanderlustTrails');

    // Check if any todos were fetched
    if ($result->num_rows > 0) {
        // Loop through each todo that matches the criteria
        while ($todo = $result->fetch_assoc()) {
            $email = $todo['email'];      // User's email
            $task = $todo['task'];        // Todo task description
            $due_date = $todo['due_date'];// Due date for the task

            // Create a display name from firstName and lastName; fallback to email username if empty
            $firstName = $todo['firstName'] ?? '';
            $lastName = $todo['lastName'] ?? '';
            $name = trim("$firstName $lastName") ?: substr($email, 0, strpos($email, '@'));
            
            $todo_id = $todo['id'];       // Todo record ID

            // Log sending reminder attempt
            error_log("[scheduleReminders.php] Sending reminder for todo_id: $todo_id to $email");

            // Add recipient email and name
            $mail->addAddress($email, $name);

            // Set email format to HTML
            $mail->isHTML(true);

            // Email subject line
            $mail->Subject = 'Reminder: Your Todo is Due Tomorrow!';

            // Compose HTML email body
            $mail->Body = "
                <h2>Todo Reminder</h2>
                <p>Dear {$name},</p>
                <p>This is a reminder that your todo is due tomorrow:</p>
                <p><strong>Task:</strong> {$task}</p>
                <p><strong>Due Date:</strong> {$due_date}</p>
                <p>Please complete it on time!</p>
                <p>Best regards,<br>WanderlustTrails Team</p>
            ";

            // Compose plain-text email body for non-HTML clients
            $mail->AltBody = "Todo Reminder\n\nDear {$name},\n\nThis is a reminder that your todo is due tomorrow:\nTask: {$task}\nDue Date: {$due_date}\n\nPlease complete it on time!\n\nBest regards,\nWanderlustTrails Team";

            // Send the email
            $mail->send();

            // Prepare statement to update reminder_sent flag for this todo
            $update_sql = "UPDATE todos SET reminder_sent = 1 WHERE id = ?";
            $update_stmt = $conn->prepare($update_sql);

            // Check update statement preparation failure
            if (!$update_stmt) {
                error_log('[scheduleReminders.php] Failed to prepare update SQL statement: ' . $conn->error);
                echo "Failed to prepare update SQL statement: " . $conn->error;
                exit;
            }

            // Bind todo id parameter and execute update
            $update_stmt->bind_param("i", $todo_id);
            $update_stmt->execute();
            $update_stmt->close();

            // Log successful update
            error_log("[scheduleReminders.php] Reminder sent and updated for todo_id: $todo_id");

            // Clear recipients for next iteration
            $mail->clearAddresses();
        }
        echo "Reminders sent successfully.";
    } else {
        // Log and display no reminders needed
        error_log('[scheduleReminders.php] No todos due tomorrow with reminder_sent = 0');
        echo "No reminders to send.";
    }
} catch (Exception $e) {
    // Log PHPMailer errors
    error_log('[scheduleReminders.php] Error sending reminders: ' . $mail->ErrorInfo);
    echo "Error sending reminders: " . $mail->ErrorInfo;
}

// Clean up prepared statement and database connection
$stmt->close();
$conn->close();
?>

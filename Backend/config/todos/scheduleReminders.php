<?php
// Allow script to be run from CLI or browser (no CORS needed for cron jobs)
// Set response content type to plain text for CLI/debugging
header("Content-Type: text/plain; charset=UTF-8");

// Include mail helper for sending emails
require_once __DIR__ . '/../incMailerHelper.php';
// Include DB config for database connection
$dbConfigPath = __DIR__ . "/../../db/inc_dbconfig.php";
if (!file_exists($dbConfigPath) || !is_readable($dbConfigPath)) {
    echo "DB config file not found or not readable at $dbConfigPath\n";
    exit(1);
}
require_once $dbConfigPath;

// Connect to the database
$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    echo "Database connection failed: " . $conn->connect_error . "\n";
    exit(1);
}

// Calculate tomorrow's date in Y-m-d format
$tomorrow = date('Y-m-d', strtotime('+1 day'));

// Prepare SQL to select todos due tomorrow with reminder_sent = 0, joining with user info
$sql = "SELECT t.id, t.task, t.due_date, u.email, u.firstName FROM todos t JOIN users u ON t.user_id = u.id WHERE t.due_date = ? AND t.reminder_sent = 0";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo "Failed to prepare SQL statement: " . $conn->error . "\n";
    $conn->close();
    exit(1);
}
$stmt->bind_param("s", $tomorrow);
$stmt->execute();
$result = $stmt->get_result();

// Track how many reminders were sent
$remindersSent = 0;
$reminderErrors = [];

if ($result->num_rows > 0) {
    while ($todo = $result->fetch_assoc()) {
        $todoId = $todo['id'];
        $email = $todo['email'];
        $firstName = $todo['firstName'] ?? 'User';
        $task = $todo['task'];
        $dueDate = $todo['due_date'];

        // Prepare email subject and body
        $subject = "Reminder: Your Todo is Due Tomorrow!";
        $body = "<h2>Todo Reminder</h2><p>Hello {$firstName},</p><p>This is a reminder that your todo is due tomorrow:</p><p><strong>Task:</strong> " . htmlspecialchars($task) . "</p><p><strong>Due Date:</strong> " . htmlspecialchars($dueDate) . "</p><p>Please complete it on time!</p><p>Best regards,<br>WanderlustTrails Team</p>";
        $altBody = "Todo Reminder\nHello {$firstName},\nYour todo '{$task}' is due tomorrow ({$dueDate}). Please complete it on time!";

        // Send the email using the reusable helper
        $mailResult = sendMail($email, $firstName, $subject, $body, $altBody);

        if ($mailResult["success"]) {
            // Update reminder_sent flag in DB
            $updateSql = "UPDATE todos SET reminder_sent = 1 WHERE id = ?";
            $updateStmt = $conn->prepare($updateSql);
            if ($updateStmt) {
                $updateStmt->bind_param("i", $todoId);
                $updateStmt->execute();
                $updateStmt->close();
            }
            $remindersSent++;
            echo "Reminder sent for todo_id: $todoId to $email\n";
        } else {
            $reminderErrors[] = ["todo_id" => $todoId, "email" => $email, "error" => $mailResult["message"]];
            echo "Failed to send reminder for todo_id: $todoId to $email. Error: {$mailResult["message"]}\n";
        }
    }
} else {
    echo "No todos due tomorrow with reminder_sent = 0\n";
}

// Output summary
if ($remindersSent > 0) {
    echo "Total reminders sent: $remindersSent\n";
}
if (!empty($reminderErrors)) {
    echo "Reminders failed for the following todos:\n";
    foreach ($reminderErrors as $err) {
        echo "- Todo ID: {$err["todo_id"]}, Email: {$err["email"]}, Error: {$err["error"]}\n";
    }
}

// Clean up
$stmt->close();
$conn->close();
?>

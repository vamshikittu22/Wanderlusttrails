<?php
// Allow CORS requests only from localhost:5173 (your frontend)
header("Access-Control-Allow-Origin: http://localhost:5173");
// Set response content type to JSON with UTF-8 encoding
header("Content-Type: application/json; charset=UTF-8");
// Allow POST and OPTIONS HTTP methods
header("Access-Control-Allow-Methods: POST, OPTIONS");
// Allow Content-Type header in requests
header("Access-Control-Allow-Headers: Content-Type");

// Define the path to the model file
$modelPath = __DIR__ . "/inc_todoModel.php";
// Check if the model file exists and is readable
if (!file_exists($modelPath) || !is_readable($modelPath)) {
    // Respond with 500 Internal Server Error if model file missing/unreadable
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Model file not found or not readable at $modelPath"]);
    exit;
}
// Include the todo model class file
require_once $modelPath;

// Include mail helper for sending email notifications
require_once __DIR__ . "/../incMailerHelper.php";
// Include DB config to fetch user info
$dbConfigPath = __DIR__ . "/../../db/inc_dbconfig.php";
if (!file_exists($dbConfigPath) || !is_readable($dbConfigPath)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB config file not found or not readable at $dbConfigPath"]);
    exit;
}
require_once $dbConfigPath;

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Only allow POST requests for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    // Respond with 405 Method Not Allowed for other request methods
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}
// Decode JSON payload from the POST request body
$data = json_decode(file_get_contents("php://input"), true);
// Check if JSON decoding succeeded
if (!$data) {
    // Respond with 400 Bad Request if JSON invalid
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}
// Extract fields from the decoded data with null fallback
$id = $data['id'] ?? null;
$task = $data['task'] ?? null;
$dueDate = $data['due_date'] ?? null;
// Cast is_completed to boolean if set, else null
$isCompleted = isset($data['is_completed']) ? (bool)$data['is_completed'] : null;
// Validate that 'id' is present as it is required
if (!$id) {
    // Respond with 400 Bad Request if id is missing
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required field: id"]);
    exit;
}

try {
    // Create an instance of the TodoClass from the model
    $todoClass = new TodoClass();
    // Call the updateTodo method with parameters extracted from request
    $result = $todoClass->updateTodo($id, $task, $dueDate, $isCompleted);

    // Fetch todo and user details for email notification
    $conn = new mysqli($host, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error, 500);
    }
    // Prepare SQL to get todo and user info
    $stmt = $conn->prepare("SELECT t.task, t.due_date, t.iscompleted, u.email, u.firstName FROM todos t JOIN users u ON t.user_id = u.id WHERE t.id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $todoResult = $stmt->get_result();
    if ($todoResult->num_rows === 0) {
        throw new Exception("Todo not found for email notification", 404);
    }
    $todo = $todoResult->fetch_assoc();
    $email = $todo['email'];
    $firstName = $todo['firstName'] ?? 'User';
    $task = $todo['task'];
    $dueDate = $todo['due_date'];
    $isCompleted = $todo['iscompleted'] ? 'Yes' : 'No';
    $stmt->close();
    $conn->close();

    // Prepare the email subject and body for update notification
    $subject = "Todo Updated: " . htmlspecialchars($task);
    $body = "<h2>Todo Updated</h2><p>Hello {$firstName},</p><p>Your todo has been updated:</p><p><strong>Task:</strong> " . htmlspecialchars($task) . "</p><p><strong>Due Date:</strong> " . htmlspecialchars($dueDate) . "</p><p><strong>Completed:</strong> {$isCompleted}</p><p>If you did not make this change, please contact support.</p><p>Best regards,<br>Wanderlust Trails Team</p>";
    $altBody = "Todo Updated\nHello {$firstName},\nYour todo '{$task}' (due {$dueDate}) was updated. Completed: {$isCompleted}. If you did not make this change, please contact support.";

    // Send the email using the reusable helper
    $mailResult = sendMail($email, $firstName, $subject, $body, $altBody);

    // Respond with 200 OK and the result from update operation, including mail status
    http_response_code(200);
    echo json_encode([
        "success" => $result["success"],
        "updatedTodoId" => $id,
        "mailSuccess" => $mailResult["success"],
        "mailMessage" => $mailResult["message"]
    ]);
} catch (Exception $e) {
    // If an exception occurs, use its code if it's a valid HTTP error code, otherwise 500
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    // Respond with JSON indicating failure and the exception message
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    // Log the last PHP error if any, useful for debugging
    if (function_exists('error_get_last')) {
        error_log("Last PHP error: " . json_encode(error_get_last()));
    }
}
// End script execution explicitly
exit;
?>

<?php
// Allow requests from frontend origin localhost:5173 (CORS)
header("Access-Control-Allow-Origin: http://localhost:5173");
// Set response content type to JSON UTF-8
header("Content-Type: application/json; charset=UTF-8");
// Allow POST and OPTIONS HTTP methods
header("Access-Control-Allow-Methods: POST, OPTIONS");
// Allow Content-Type header in requests
header("Access-Control-Allow-Headers: Content-Type");

// Define path to Todo model file
$modelPath = __DIR__ . "/inc_todoModel.php";
// Check if the model file exists and is readable
if (!file_exists($modelPath) || !is_readable($modelPath)) {
    // Return 500 Internal Server Error if model file is missing or unreadable
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Model file not found or not readable at $modelPath"]);
    exit;
}
// Include the Todo model class
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

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Respond with 200 OK for OPTIONS request
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Reject any request method other than POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Decode JSON input from request body
$data = json_decode(file_get_contents("php://input"), true);

// Validate JSON decoding
if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

// Extract required 'id' field from decoded data
$id = $data['id'] ?? null;

// Validate presence of 'id'
if (!$id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required field: id"]);
    exit;
}

try {
    // Instantiate the TodoClass model
    $todoClass = new TodoClass();
    // Fetch todo details before deletion for email notification
    $conn = new mysqli($host, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error, 500);
    }
    // Prepare SQL to get todo and user info
    $stmt = $conn->prepare("SELECT t.task, t.due_date, u.email, u.firstName FROM todos t JOIN users u ON t.user_id = u.id WHERE t.id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception("Todo not found for email notification", 404);
    }
    $todo = $result->fetch_assoc();
    $email = $todo['email'];
    $firstName = $todo['firstName'] ?? 'User';
    $task = $todo['task'];
    $dueDate = $todo['due_date'];
    $stmt->close();
    $conn->close();

    // Call deleteTodo method to delete the todo item by id
    $result = $todoClass->deleteTodo($id);

    // Prepare the email subject and body for deletion notification
    $subject = "Todo Deleted: " . htmlspecialchars($task);
    $body = "<h2>Todo Deleted</h2><p>Hello {$firstName},</p><p>Your todo has been deleted:</p><p><strong>Task:</strong> " . htmlspecialchars($task) . "</p><p><strong>Due Date:</strong> " . htmlspecialchars($dueDate) . "</p><p>If this was a mistake, please contact support.</p><p>Best regards,<br>Wanderlust Trails Team</p>";
    $altBody = "Todo Deleted\nHello {$firstName},\nYour todo '{$task}' (due {$dueDate}) was deleted. If this was a mistake, please contact support.";

    // Send the email using the reusable helper
    $mailResult = sendMail($email, $firstName, $subject, $body, $altBody);

    // Respond with 200 OK and result, including mail status
    http_response_code(200);
    echo json_encode([
        "success" => $result["success"],
        "mailSuccess" => $mailResult["success"],
        "mailMessage" => $mailResult["message"],
        "deletedTodoId" => $id
    ]);
} catch (Exception $e) {
    // Handle exceptions by returning the error code or 500 Internal Server Error
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    // Log last PHP error for debugging if available
    if (function_exists('error_get_last')) {
        error_log("Last PHP error: " . json_encode(error_get_last()));
    }
}
// End script execution
exit;
?>

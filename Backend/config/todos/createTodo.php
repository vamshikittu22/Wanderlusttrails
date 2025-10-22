<?php
// Allow requests from your frontend (localhost:5173)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Path to the Todo model file (handles DB logic for todos)
$modelPath = __DIR__ . "/inc_todoModel.php";
if (!file_exists($modelPath) || !is_readable($modelPath)) {
    // If the model file is missing, return an error
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Model file not found or not readable at $modelPath"]);
    exit;
}
require_once $modelPath;

// Include the reusable mail helper for sending emails
require_once __DIR__ . "/../incMailerHelper.php";

// Include DB config to connect and fetch user info
$dbConfigPath = __DIR__ . "/../../db/inc_dbconfig.php";
if (!file_exists($dbConfigPath) || !is_readable($dbConfigPath)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB config file not found or not readable at $dbConfigPath"]);
    exit;
}
require_once $dbConfigPath;

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Only allow POST requests for creating todos
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Decode the JSON payload from the request body
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

// Extract required fields from the request
$task = $data['task'] ?? null;
$dueDate = $data['due_date'] ?? null;
$userId = $data['user_id'] ?? null;

// Check for missing required fields
if (!$task || !$dueDate || !$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields: task, due_date, and user_id"]);
    exit;
}

try {
    // Create the todo using the model class
    $todoClass = new TodoClass();
    $result = $todoClass->createTodo($userId, $task, $dueDate);

    // Connect to the database to fetch user email and name
    $conn = new mysqli($host, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error, 500);
    }
    // Prepare SQL to get user info
    $stmt = $conn->prepare("SELECT email, firstName FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userResult = $stmt->get_result();
    if ($userResult->num_rows === 0) {
        throw new Exception("User not found for mailing", 404);
    }
    $user = $userResult->fetch_assoc();
    $email = $user['email'];
    $firstName = $user['firstName'] ?? 'User';
    $stmt->close();
    $conn->close();

    // Prepare the email subject and body
    $subject = "New Todo Created: " . htmlspecialchars($task);
    $body = "<h2>New Todo Created</h2><p>Hello {$firstName},</p><p>Your new todo has been created:</p><p><strong>Task:</strong> " . htmlspecialchars($task) . "</p><p><strong>Due Date:</strong> " . htmlspecialchars($dueDate) . "</p><p>Best regards,<br>Wanderlust Trails Team</p>";
    $altBody = "New Todo Created\nHello {$firstName},\nYour new todo '{$task}' is due on {$dueDate}.";

    // Send the email using the reusable helper
    $mailResult = sendMail($email, $firstName, $subject, $body, $altBody);

    // Return the result, including mail status
    // After successfully creating the todo, return the ID   
    http_response_code(201);
    echo json_encode([
        "success" => $result["success"],
        "todo_id" => $result["todo_id"], // Return the ID directly
        "todo" => [
            "id" => $result["todo_id"], // Also return it inside a todo object for consistency
            "task" => $task,
            "due_date" => $dueDate,
            "user_id" => $userId
        ],
        "mailSuccess" => $mailResult["success"],
        "mailMessage" => $mailResult["message"]
    ]);
} catch (Exception $e) {
    // Handle any errors and log them
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    if (function_exists('error_get_last')) {
        error_log("Last PHP error: " . json_encode(error_get_last()));
    }
}
// End of script
exit;
?>

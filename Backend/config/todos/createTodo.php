<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Include necessary files
$modelPath = __DIR__ . "/inc_todoModel.php";
if (!file_exists($modelPath)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Model file not found at $modelPath"]);
    exit;
}
require_once $modelPath;

$dbConfigPath = __DIR__ . "/../../db/inc_dbconfig.php";
if (!file_exists($dbConfigPath)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB config not found at $dbConfigPath"]);
    exit;
}
require_once $dbConfigPath;

$data = json_decode(file_get_contents("php://input"), true); // Decode JSON input
if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}
// Validate required fields
$task = $data['task'] ?? null;
$dueDate = $data['due_date'] ?? null;
$userId = $data['user_id'] ?? null;

if (!$task || !$dueDate || !$userId) { // Check for missing fields
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

// Create Todo
try {
    $todoClass = new TodoClass();
    $result = $todoClass->createTodo($userId, $task, $dueDate);
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "todo_id" => $result["todo_id"],
        "todo" => [
            "id" => $result["todo_id"],
            "task" => $task,
            "due_date" => $dueDate,
            "user_id" => $userId
        ]
    ]);
    
    // Email sending logic
    try {
        require_once __DIR__ . "/../incMailerHelper.php";
        $conn = new mysqli($host, $username, $password, $dbname); // DB connection
        if (!$conn->connect_error) {
            $stmt = $conn->prepare("SELECT email, firstName FROM users WHERE id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $userResult = $stmt->get_result();
            if ($userResult->num_rows > 0) { // User found
                $user = $userResult->fetch_assoc(); // Fetch user details
                $email = $user['email'];
                $firstName = $user['firstName'] ?? 'User';
                $subject = "New Todo: " . htmlspecialchars($task);
                $body = "<h2>New Todo Created</h2><p>Hello {$firstName},</p><p><strong>Task:</strong> " . htmlspecialchars($task) . "</p><p><strong>Due:</strong> " . htmlspecialchars($dueDate) . "</p>";
                $altBody = "New Todo: {$task} due on {$dueDate}";
                sendMail($email, $firstName, $subject, $body, $altBody); // Send email
            }
            $stmt->close(); // Close statement
            $conn->close(); // Close DB connection
        } 
    } catch (Exception $e) {
        error_log("Email failed: " . $e->getMessage());
    }
    
} catch (Exception $e) {
    $code = ($e->getCode() >= 400 && $e->getCode() < 600) ? $e->getCode() : 500; 
    http_response_code($code); 
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
exit;
?>

<?php
// tasks.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include("inc_taskModel.php");

// Ensure the user is authenticated (use session or JWT)
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not authenticated"]);
    exit();
}

// Instantiate TaskModel
$taskModel = new TaskModel();

$request_method = $_SERVER["REQUEST_METHOD"];
$data = json_decode(file_get_contents("php://input"), true);

// Handle POST (Add task)
if ($request_method == "POST") {
    // Validate incoming data
    $task_name = $data['task_name'] ?? '';
    $task_description = $data['task_description'] ?? '';
    $status = $data['status'] ?? 'pending';  // Default status is 'pending'

    if ($task_name && $task_description) {
        $user_id = $_SESSION['user_id'];  // Get user ID from session
        $result = $taskModel->addTask($user_id, $task_name, $task_description, $status);
        echo json_encode($result);
    } else {
        echo json_encode(["success" => false, "message" => "Task name and description are required."]);
    }
}

// Handle PUT (Update task)
if ($request_method == "PUT") {
    $task_id = $data['task_id'] ?? null;
    $task_name = $data['task_name'] ?? '';
    $task_description = $data['task_description'] ?? '';
    $status = $data['status'] ?? '';

    if ($task_id && $task_name && $task_description && $status) {
        $result = $taskModel->updateTask($task_id, $task_name, $task_description, $status);
        echo json_encode($result);
    } else {
        echo json_encode(["success" => false, "message" => "Missing required parameters."]);
    }
}

// Handle DELETE (Delete task)
if ($request_method == "DELETE") {
    $task_id = $data['task_id'] ?? null;

    if ($task_id) {
        $result = $taskModel->deleteTask($task_id);
        echo json_encode($result);
    } else {
        echo json_encode(["success" => false, "message" => "Task ID is required."]);
    }
}
?>

<?php

// todoController.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include("inc_TodoModel.php");

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Add Todo
    $data = json_decode(file_get_contents("php://input"), true);

    $userId = $data['userId'];
    $todo = $data['todo'];
    $completed = $data['completed'];

    $todoModel = new TodoModel();
    $result = $todoModel->addTodo($userId, $todo, $completed);

    echo json_encode($result);

} elseif ($_SERVER["REQUEST_METHOD"] === "GET") {
    // Get all Todos for a user
    if (isset($_GET['userId'])) {
        $userId = $_GET['userId'];

        $todoModel = new TodoModel();
        $todos = $todoModel->getTodos($userId);

        echo json_encode(["success" => true, "data" => $todos]);
    } else {
        echo json_encode(["success" => false, "message" => "User ID is required"]);
    }

} elseif ($_SERVER["REQUEST_METHOD"] === "PUT") {
    // Update Todo
    $data = json_decode(file_get_contents("php://input"), true);

    $todoId = $data['todoId'];
    $todo = $data['todo'];
    $completed = $data['completed'];

    $todoModel = new TodoModel();
    $result = $todoModel->updateTodo($todoId, $todo, $completed);

    echo json_encode($result);

} elseif ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    // Delete Todo
    $data = json_decode(file_get_contents("php://input"), true);

    $todoId = $data['todoId'];

    $todoModel = new TodoModel();
    $result = $todoModel->deleteTodo($todoId);

    echo json_encode($result);

} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>

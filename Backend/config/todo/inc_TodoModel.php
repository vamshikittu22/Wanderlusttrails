<?php

//path: Wanderlusttrails/Backend/config/todo/inc_TodoModel.php

include("inc_databaseClass.php");

class TodoModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    // Add a new todo item
    public function addTodo($userId, $todo, $completed) {
        $query = "INSERT INTO tasks (user_id, todo, completed, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())";
        $types = "iss";
        return $this->db->executeQuery($query, $types, $userId, $todo, $completed);
    }

    // Get all todos for a specific user
    public function getTodos($userId) {
        $query = "SELECT * FROM tasks WHERE user_id = ?";
        $types = "i";
        return $this->db->fetchQuery($query, $types, $userId);
    }

    // Update a todo item
    public function updateTodo($todoId, $todo, $completed) {
        $query = "UPDATE tasks SET todo = ?, completed = ?, updated_at = NOW() WHERE todo_id = ?";
        $types = "ssi";
        return $this->db->executeQuery($query, $types, $todo, $completed, $todoId);
    }

    // Delete a todo item
    public function deleteTodo($todoId) {
        $query = "DELETE FROM tasks WHERE todo_id = ?";
        $types = "i";
        return $this->db->executeQuery($query, $types, $todoId);
    }
}
?>

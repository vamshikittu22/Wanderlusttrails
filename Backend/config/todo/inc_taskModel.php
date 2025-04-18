<?php
//path: Wanderlusttrails/Backend/config/todo/inc_taskModel.php

include("inc_databaseClass.php");

class TaskModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    // Add a new task
    public function addTask($user_id, $task_name, $task_description, $status) {
        $query = "INSERT INTO tasklist (user_id, task_name, task_description, status) VALUES (?, ?, ?, ?)";
        $types = "isss";  // 'i' for integer (user_id), 's' for string (task_name, task_description, status)
        return $this->db->executeQuery($query, $types, $user_id, $task_name, $task_description, $status);
    }

    // Update a task's information
    public function updateTask($task_id, $task_name, $task_description, $status) {
        $query = "UPDATE tasklist SET task_name = ?, task_description = ?, status = ? WHERE task_id = ?";
        $types = "sssi";  // 's' for string (task_name, task_description, status), 'i' for integer (task_id)
        return $this->db->executeQuery($query, $types, $task_name, $task_description, $status, $task_id);
    }

    // Delete a task
    public function deleteTask($task_id) {
        $query = "DELETE FROM tasklist WHERE task_id = ?";
        $types = "i";  // 'i' for integer (task_id)
        return $this->db->executeQuery($query, $types, $task_id);
    }

    // Fetch all tasks for a user
    public function getUserTasks($user_id) {
        $query = "SELECT task_id, task_name, task_description, status FROM tasklist WHERE user_id = ?";
        $types = "i";  // 'i' for integer (user_id)
        return $this->db->executeQuery($query, $types, $user_id);
    }

    // Fetch a single task by ID (optional)
    public function getTaskById($task_id) {
        $query = "SELECT task_id, task_name, task_description, status FROM tasklist WHERE task_id = ?";
        $types = "i";  // 'i' for integer (task_id)
        return $this->db->executeQuery($query, $types, $task_id);
    }
}
?>

<?php
require_once __DIR__ . "/../inc_databaseClass.php";

class TodoClass {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    public function createTodo($userId, $task, $dueDate) {
        if (!$userId || !$task || !$dueDate) {
            throw new Exception("Missing required fields", 400);
        }

        if (!is_numeric($userId) || $userId <= 0) {
            throw new Exception("Invalid user_id", 400);
        }

        $date = DateTime::createFromFormat('Y-m-d', $dueDate);
        if (!$date || $date->format('Y-m-d') !== $dueDate) {
            throw new Exception("Invalid due_date format", 400);
        }

        if (!$this->db->recordExists('users', 'id', $userId, 'i')) {
            throw new Exception("User not found", 404);
        }

        $query = "INSERT INTO todos (user_id, task, due_date, created_at) VALUES (?, ?, ?, NOW())";
        $types = "iss";
        $params = [$userId, $task, $dueDate];

        $this->db->beginTransaction();
        try {
            $result = $this->db->executeQuery($query, $types, ...$params);
            if ($result['success']) {
                $this->db->commit();
                return [
                    "success" => true,
                    "message" => "Todo created successfully",
                    "todo_id" => $result['insert_id']
                ];
            } else {
                $this->db->rollback();
                throw new Exception("Failed to create todo", 500);
            }
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    public function getTodos($userId) {
        if (!is_numeric($userId) || $userId <= 0) {
            throw new Exception("Invalid user_id", 400);
        }

        if (!$this->db->recordExists('users', 'id', $userId, 'i')) {
            throw new Exception("User not found", 404);
        }

        $query = "SELECT id, user_id, task, due_date, is_completed, reminder_sent, created_at, updated_at 
                  FROM todos 
                  WHERE user_id = ? 
                  ORDER BY created_at DESC";
        $types = "i";
        $todos = $this->db->fetchQuery($query, $types, $userId);

        return $todos;
    }

    public function updateTodo($id, $task = null, $dueDate = null, $isCompleted = null) {
        if (!is_numeric($id) || $id <= 0) {
            throw new Exception("Invalid todo id", 400);
        }

        if (!$this->db->recordExists('todos', 'id', $id, 'i')) {
            throw new Exception("Todo not found", 404);
        }

        $updates = [];
        $params = [];
        $types = '';

        if ($task !== null) {
            $updates[] = "task = ?";
            $params[] = $task;
            $types .= 's';
        }

        if ($dueDate !== null) {
            $date = DateTime::createFromFormat('Y-m-d', $dueDate);
            if (!$date || $date->format('Y-m-d') !== $dueDate) {
                throw new Exception("Invalid due_date format", 400);
            }
            $updates[] = "due_date = ?";
            $params[] = $dueDate;
            $types .= 's';
        }

        if ($isCompleted !== null) {
            $updates[] = "is_completed = ?";
            $params[] = $isCompleted ? 1 : 0;
            $types .= 'i';
        }

        if (empty($updates)) {
            throw new Exception("No fields to update", 400);
        }

        $query = "UPDATE todos SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
        $types .= 'i';
        $params[] = $id;

        $this->db->beginTransaction();
        try {
            $result = $this->db->executeQuery($query, $types, ...$params);
            if ($result['success']) {
                $this->db->commit();
                return [
                    "success" => true,
                    "message" => "Todo updated successfully"
                ];
            } else {
                $this->db->rollback();
                throw new Exception("Failed to update todo", 500);
            }
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }

    public function deleteTodo($id) {
        if (!is_numeric($id) || $id <= 0) {
            throw new Exception("Invalid todo id", 400);
        }

        if (!$this->db->recordExists('todos', 'id', $id, 'i')) {
            throw new Exception("Todo not found", 404);
        }

        $query = "DELETE FROM todos WHERE id = ?";
        $types = "i";
        $params = [$id];

        $this->db->beginTransaction();
        try {
            $result = $this->db->executeQuery($query, $types, ...$params);
            if ($result['success']) {
                $this->db->commit();
                return [
                    "success" => true,
                    "message" => "Todo deleted successfully"
                ];
            } else {
                $this->db->rollback();
                throw new Exception("Failed to delete todo", 500);
            }
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
}
?>
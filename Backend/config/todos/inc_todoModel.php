<?php
require_once __DIR__ . "/../inc_databaseClass.php"; // Include the DatabaseClass for DB operations

class TodoClass {
    private $db;

    // Constructor initializes the DatabaseClass instance for DB interactions
    public function __construct() {
        $this->db = new DatabaseClass();
    }

    /**
     * Create a new todo item for a user
     * @param int $userId - ID of the user creating the todo
     * @param string $task - Task description
     * @param string $dueDate - Due date in 'Y-m-d' format
     * @return array - Result with success status and message or error
     * @throws Exception on validation or DB errors
     */
    public function createTodo($userId, $task, $dueDate) {
        // Validate required inputs
        if (!$userId || !$task || !$dueDate) {
            throw new Exception("Missing required fields", 400);
        }

        // Validate userId is a positive integer
        if (!is_numeric($userId) || $userId <= 0) {
            throw new Exception("Invalid user_id", 400);
        }

        // Validate dueDate format is YYYY-MM-DD
        $date = DateTime::createFromFormat('Y-m-d', $dueDate);
        if (!$date || $date->format('Y-m-d') !== $dueDate) {
            throw new Exception("Invalid due_date format", 400);
        }

        // Check if user exists in 'users' table
        if (!$this->db->recordExists('users', 'id', $userId, 'i')) {
            throw new Exception("User not found", 404);
        }

        // Prepare the SQL query and parameters
        $query = "INSERT INTO todos (user_id, task, due_date) VALUES (?, ?, ?)";
        $types = "iss"; // int, string, string
        $params = [$userId, $task, $dueDate];

        // Start DB transaction
        $this->db->beginTransaction();
        try {
            // Execute the insert query
            $result = $this->db->executeQuery($query, $types, ...$params);
            if ($result['success']) {
                $this->db->commit();
                // Return success with the new todo ID
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
            throw $e; // Rethrow exception for higher-level handling
        }
    }

    /**
     * Retrieve all todos for a user
     * @param int $userId - ID of the user
     * @return array - List of todos
     * @throws Exception on invalid user or DB errors
     */
    public function getTodos($userId) {
        // Validate userId
        if (!is_numeric($userId) || $userId <= 0) {
            throw new Exception("Invalid user_id", 400);
        }

        // Check if user exists
        if (!$this->db->recordExists('users', 'id', $userId, 'i')) {
            throw new Exception("User not found", 404);
        }

        // Query to fetch todos by user, ordered by creation date descending
        $query = "SELECT id, user_id, task, due_date, iscompleted, reminder_sent, createdAt, updatedAt 
                  FROM todos 
                  WHERE user_id = ? 
                  ORDER BY createdAt DESC";
        $types = "i";

        // Fetch todos and return
        $todos = $this->db->fetchQuery($query, $types, $userId);
        return $todos;
    }

    /**
     * Update an existing todo item
     * @param int $id - Todo ID
     * @param string|null $task - New task description (optional)
     * @param string|null $dueDate - New due date in 'Y-m-d' format (optional)
     * @param bool|null $isCompleted - Completion status (optional)
     * @return array - Result with success status and message
     * @throws Exception on validation or DB errors
     */
    public function updateTodo($id, $task = null, $dueDate = null, $isCompleted = null) {
        // Validate todo ID
        if (!is_numeric($id) || $id <= 0) {
            throw new Exception("Invalid todo id", 400);
        }

        // Check if todo exists
        if (!$this->db->recordExists('todos', 'id', $id, 'i')) {
            throw new Exception("Todo not found", 404);
        }

        $updates = [];
        $params = [];
        $types = '';

        // Add task update if provided
        if ($task !== null) {
            $updates[] = "task = ?";
            $params[] = $task;
            $types .= 's';
        }

        // Add due date update if provided and valid
        if ($dueDate !== null) {
            $date = DateTime::createFromFormat('Y-m-d', $dueDate);
            if (!$date || $date->format('Y-m-d') !== $dueDate) {
                throw new Exception("Invalid due_date format", 400);
            }
            $updates[] = "due_date = ?";
            $params[] = $dueDate;
            $types .= 's';
        }

        // Add completion status update if provided
        if ($isCompleted !== null) {
            $updates[] = "iscompleted = ?";
            $params[] = $isCompleted ? 1 : 0;
            $types .= 'i';
        }

        // Ensure there is at least one field to update
        if (empty($updates)) {
            throw new Exception("No fields to update", 400);
        }

        // Prepare update query with updated_at timestamp
        $query = "UPDATE todos SET " . implode(', ', $updates) . " WHERE id = ?";
        $types .= 'i'; // Add type for todo ID
        $params[] = $id;

        // Execute update in a transaction
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

    /**
     * Delete a todo item by ID
     * @param int $id - Todo ID
     * @return array - Result with success status and message
     * @throws Exception on validation or DB errors
     */
    public function deleteTodo($id) {
        // Validate todo ID
        if (!is_numeric($id) || $id <= 0) {
            throw new Exception("Invalid todo id", 400);
        }

        // Check if todo exists
        if (!$this->db->recordExists('todos', 'id', $id, 'i')) {
            throw new Exception("Todo not found", 404);
        }

        // Prepare delete query
        $query = "DELETE FROM todos WHERE id = ?";
        $types = "i";
        $params = [$id];

        // Execute deletion in a transaction
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

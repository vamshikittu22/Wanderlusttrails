import $ from 'jquery';

// Base URL for all todo-related API endpoints
const BASE_URL = 'http://localhost/WanderlustTrails/Backend/config/todos';

/**
 * todoAPI provides reusable functions to interact with the backend
 * Each function returns a Promise for async/await usage
 */
export const todoAPI = {
    /**
     * Fetch all todos for a specific user
     * @param {number} userId - The ID of the user
     * @returns {Promise} - Resolves with response data or rejects with error
     */
    getTodos: (userId) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${BASE_URL}/getTodos.php?user_id=${userId}`,
                type: 'GET',
                success: (response) => resolve(response),
                error: (xhr, status, error) => {
                    console.error('Error fetching todos:', error);
                    reject(new Error(error));
                }
            });
        });
    },

    /**
     * Create a new todo
     * @param {string} task - The todo task description
     * @param {string} dueDate - The due date in YYYY-MM-DD format
     * @param {number} userId - The ID of the user
     * @returns {Promise} - Resolves with response data or rejects with error
     */
    createTodo: (task, dueDate, userId) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${BASE_URL}/createTodo.php`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ task, due_date: dueDate, user_id: userId }),
                success: (response) => resolve(response),
                error: (xhr, status, error) => {
                    console.error('Error creating todo:', error);
                    reject(new Error(error));
                }
            });
        });
    },

    /**
     * Update an existing todo
     * @param {number} id - The todo ID
     * @param {string|null} task - The updated task (optional)
     * @param {string|null} dueDate - The updated due date (optional)
     * @param {number|null} isCompleted - The updated completion status (0 or 1, optional)
     * @returns {Promise} - Resolves with response data or rejects with error
     */
    updateTodo: (id, task = null, dueDate = null, isCompleted = null) => {
        // Build payload dynamically based on provided parameters
        const payload = { id };
        if (task !== null) payload.task = task;
        if (dueDate !== null) payload.due_date = dueDate;
        if (isCompleted !== null) payload.is_completed = isCompleted;

        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${BASE_URL}/updateTodo.php`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(payload),
                success: (response) => resolve(response),
                error: (xhr, status, error) => {
                    console.error('Error updating todo:', error);
                    reject(new Error(error));
                }
            });
        });
    },

    /**
     * Delete a todo
     * @param {number} id - The todo ID
     * @returns {Promise} - Resolves with response data or rejects with error
     */
    deleteTodo: (id) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${BASE_URL}/deleteTodo.php`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ id }),
                success: (response) => resolve(response),
                error: (xhr, status, error) => {
                    console.error('Error deleting todo:', error);
                    reject(new Error(error));
                }
            });
        });
    },

    /**
     * Send an email reminder for a specific todo
     * @param {number} todoId - The todo ID
     * @returns {Promise} - Resolves with response data or rejects with error
     */
    sendEmailReminder: (todoId) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `${BASE_URL}/sendEmail.php`,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ todo_id: todoId }),
                success: (response) => resolve(response),
                error: (xhr, status, error) => {
                    console.error('Error sending email reminder:', error);
                    reject(new Error(error));
                }
            });
        });
    }
};

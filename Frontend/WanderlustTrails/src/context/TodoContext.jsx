import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';
import { useUser } from './UserContext';

// Context for managing todo-related state and functions
const TodoContext = createContext({
    todos: [], // Initial state for todos array
    addTodo: () => {}, // Function to add a new todo
    updateTodo: () => {}, // Function to update an existing todo
    deleteTodo: () => {}, // Function to delete a todo
    toggleComplete: () => {}, // Function to toggle todo completion status
    sendEmailReminder: () => {}, // Function to send an email reminder
    checkAndSendDueDateReminders: () => {} // Function to check and send reminders
});

export function TodoProvider({ children }) {
    const [todos, setTodos] = useState([]); // State to store the list of todos
    const { user, isAuthenticated } = useUser(); // Access user authentication state

    // Normalize todo data by mapping is_completed to completed
    const normalizeTodos = (todosData) => {
        return todosData.map(todo => ({
            ...todo,
            completed: !!todo.is_completed // Convert 0/1 to boolean
        }));
    };

    // Memoize the normalized todos to prevent unnecessary transformations
    const normalizedTodos = useMemo(() => normalizeTodos(todos), [todos]);

    // Effect to load todos from localStorage and fetch from backend on mount or auth change
    useEffect(() => {
        const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
        if (storedTodos.length > 0) {
            const normalized = normalizeTodos(storedTodos);
            setTodos(normalized);
            console.log('[TodoContext] Loaded todos from localStorage:', normalized);
        }

        if (isAuthenticated && user && user.id) {
            fetchTodos();
        }
    }, [isAuthenticated, user]);

    // Effect to sync todos state with localStorage whenever it changes
    useEffect(() => {
        if (todos.length > 0) {
            localStorage.setItem('todos', JSON.stringify(todos));
            console.log('[TodoContext] Synced todos to localStorage:', todos);
        }
    }, [todos]);

    // Fetch todos from the backend
    const fetchTodos = () => {
        if (!user || !user.id) {
            toast.error('User ID not available. Please log in again.');
            return;
        }

        console.log('[TodoContext] Fetching todos for user_id:', user.id);

        $.ajax({
            url: `http://localhost/WanderlustTrails/Backend/config/todos/getTodos.php?user_id=${user.id}`,
            type: 'GET',
            success: function (response) {
                console.log('[TodoContext] Fetch response:', response);
                if (response.success) {
                    const normalized = normalizeTodos(response.data);
                    setTodos(normalized);
                    localStorage.setItem('todos', JSON.stringify(response.data));
                    console.log('[TodoContext] Set todos:', normalized);
                    toast.success('Todos fetched successfully!');
                    // Check and send reminders after fetching todos
                    checkAndSendDueDateReminders();
                } else {
                    console.error('[TodoContext] Fetch failed:', response.message);
                    toast.error(response.message || 'Failed to fetch todos.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Fetch todos error:', { status, error, response: xhr.responseText });
                toast.error('Error fetching todos: ' + error);
            }
        });
    };

    // Add a new todo to the database and update state
    const addTodo = (todo) => {
        if (!user || !user.id) {
            toast.error('User ID not available. Please log in again.');
            return;
        }

        const userId = user.id;

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/todos/createTodo.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ task: todo.todo, due_date: todo.due_date, user_id: userId }),
            success: function (response) {
                console.log('[TodoContext] Add response:', response);
                if (response.success) {
                    const newTodo = {
                        id: response.todo_id,
                        task: todo.todo,
                        due_date: todo.due_date,
                        completed: false,
                        is_completed: 0, // Ensure backend-compatible field
                        user_id: userId
                    };
                    setTodos((prev) => [newTodo, ...prev]);
                    console.log('[TodoContext] Added todo:', newTodo);
                    toast.success('Todo added successfully!');
                } else {
                    console.error('[TodoContext] Add failed:', response.message);
                    toast.error(response.message || 'Failed to add todo.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Add todo error:', { status, error, response: xhr.responseText, todo });
                toast.error('Error adding todo: ' + error);
            }
        });
    };

    // Update an existing todo in the database and state
    const updateTodo = (id, updatedTodo) => {
        if (!user || !user.id) {
            toast.error('User ID not available. Please log in again.');
            return;
        }

        console.log('[TodoContext] Updating todo with id:', id, 'with data:', updatedTodo);

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/todos/updateTodo.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id, task: updatedTodo.task, due_date: updatedTodo.due_date }),
            success: function (response) {
                if (response.success) {
                    // Fetch the updated todo to ensure sync with backend
                    $.ajax({
                        url: `http://localhost/WanderlustTrails/Backend/config/todos/getTodos.php?user_id=${user.id}`,
                        type: 'GET',
                        success: function (fetchResponse) {
                            if (fetchResponse.success) {
                                const normalized = normalizeTodos(fetchResponse.data);
                                setTodos(normalized);
                                localStorage.setItem('todos', JSON.stringify(fetchResponse.data));
                                console.log('[TodoContext] Synced todos with backend after update for id:', id);
                                toast.success('Todo updated and synced successfully!');
                                // Check and send reminders after update
                                checkAndSendDueDateReminders();
                            } else {
                                console.error('[TodoContext] Failed to fetch updated todos:', fetchResponse.message);
                                toast.error('Failed to sync todos after update.');
                            }
                        },
                        error: function (xhr, status, error) {
                            console.error('Error fetching updated todos:', { status, error, response: xhr.responseText });
                            toast.error('Error syncing todos after update: ' + error);
                        }
                    });
                } else {
                    console.error('[TodoContext] Update failed:', response.message);
                    toast.error(response.message || 'Failed to update todo.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Update todo error:', { status, error, response: xhr.responseText });
                toast.error('Error updating todo: ' + error);
            }
        });
    };

    // Delete a todo from the database and state
    const deleteTodo = (id) => {
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/todos/deleteTodo.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id }),
            success: function (response) {
                if (response.success) {
                    setTodos((prev) => prev.filter((todo) => todo.id !== id));
                    console.log('[TodoContext] Deleted todo with id:', id);
                    toast.success('Todo deleted successfully!');
                } else {
                    console.error('[TodoContext] Delete failed:', response.message);
                    toast.error(response.message || 'Failed to delete todo.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Delete todo error:', { status, error, response: xhr.responseText });
                toast.error('Error deleting todo: ' + error);
            }
        });
    };

    // Toggle the completion status of a todo
    const toggleComplete = (id) => {
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;

        const updatedCompleted = !todo.completed;
        const updatedIsCompleted = updatedCompleted ? 1 : 0;

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/todos/updateTodo.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id, is_completed: updatedIsCompleted }),
            success: function (response) {
                if (response.success) {
                    setTodos((prev) =>
                        prev.map((t) =>
                            t.id === id ? { ...t, completed: updatedCompleted, is_completed: updatedIsCompleted } : t
                        )
                    );
                    console.log('[TodoContext] Toggled completion for id:', id);
                    toast.success('Todo status updated successfully!');
                } else {
                    console.error('[TodoContext] Toggle failed:', response.message);
                    toast.error(response.message || 'Failed to update todo status.');
                }
            },
            error: function (xhr, status, error) {
                console.error('Toggle complete error:', { status, error, response: xhr.responseText });
                toast.error('Error updating todo status: ' + error);
            }
        });
    };

    // Send an email reminder for a specific todo
    const sendEmailReminder = (todoId) => {
        return new Promise((resolve, reject) => {
            if (!todoId) {
                console.error('[TodoContext] No todoId provided for email reminder');
                toast.error('Cannot send email: Todo ID is missing.');
                reject(new Error('Todo ID is missing'));
                return;
            }

            console.log('[TodoContext] Sending email reminder for todo_id:', todoId);
            console.log('[TodoContext] Payload:', JSON.stringify({ todo_id: todoId }));

            $.ajax({
                url: 'http://localhost/WanderlustTrails/Backend/config/todos/sendEmail.php',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ todo_id: todoId }),
                success: function (response) {
                    console.log('[TodoContext] Email reminder response:', response);
                    if (response.success) {
                        console.log('[TodoContext] Email reminder sent for todo_id:', todoId);
                        toast.success('Email reminder sent successfully for todo_id: ' + todoId);
                        resolve(response);
                    } else {
                        console.error('[TodoContext] Email send failed:', response.message);
                        toast.error(response.message || 'Failed to send email reminder for todo_id: ' + todoId);
                        reject(new Error(response.message || 'Failed to send email'));
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Send email reminder error:', { status, error, response: xhr.responseText });
                    toast.error('Error sending email reminder for todo_id: ' + todoId + ': ' + error);
                    reject(new Error(error));
                }
            });
        });
    };

    // Check due dates and send reminders one day before for all todos concurrently
    const checkAndSendDueDateReminders = async () => {
        if (!user || !user.id || !isAuthenticated) {
            console.log('[TodoContext] User not authenticated or ID not available, skipping reminders');
            return;
        }

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD

        console.log('[TodoContext] Checking due dates, tomorrow is:', tomorrowStr);

        // Filter todos that are due tomorrow and haven't had a reminder sent
        const todosToRemind = todos.filter(todo => 
            todo.due_date === tomorrowStr && todo.reminder_sent === 0
        );

        if (todosToRemind.length === 0) {
            console.log('[TodoContext] No todos due tomorrow with reminder_sent = 0');
            toast.info('No reminders to send for tomorrow.');
            return;
        }

        console.log('[TodoContext] Todos to remind:', todosToRemind);

        // Send all reminders concurrently using Promise.all
        try {
            const sendPromises = todosToRemind.map(todo => 
                sendEmailReminder(todo.id)
            );
            await Promise.all(sendPromises);
            console.log('[TodoContext] All reminders sent successfully');
            toast.success('All reminders sent successfully!');
        } catch (error) {
            console.error('[TodoContext] Error sending some reminders:', error);
            toast.error('Some reminders failed to send. Check logs for details.');
        }
    };

    return (
        <TodoContext.Provider value={{ todos: normalizedTodos, addTodo, updateTodo, deleteTodo, toggleComplete, sendEmailReminder, checkAndSendDueDateReminders }}>
            {children}
        </TodoContext.Provider>
    );
}

export function useTodo() {
    return useContext(TodoContext); // Hook to access todo context
}
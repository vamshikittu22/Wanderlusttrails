//path: Frontend/WanderlustTrails/src/context/TodoContext.jsx


import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useUser } from './UserContext';
import { todoAPI } from '../components/services/todoAPI';

/**
 * Create a context for managing todos across the app
 * Default values are provided for autocomplete and structure reference
 */
const TodoContext = createContext({
    todos: [],
    addTodo: () => {},
    updateTodo: () => {},
    deleteTodo: () => {},
    toggleComplete: () => {},
    sendEmailReminder: () => {},
    checkAndSendDueDateReminders: () => {}
});

/**
 * TodoProvider wraps components that need access to todo state and functions
 * It manages todos, syncs with backend, and handles localStorage
 */
export function TodoProvider({ children }) {
    // State to store all todo items
    const [todos, setTodos] = useState([]);
    
    // Get the authenticated user from UserContext
    const { user, isAuthenticated } = useUser();

    /**
     * Normalize todos by converting backend's is_completed (0/1) to frontend's completed (boolean)
     * This makes it easier to work with in React components
     * @param {Array} todosData - Array of todo objects from backend
     * @returns {Array} - Normalized array with 'completed' boolean
     */
    const normalizeTodos = (todosData) => {
        return todosData.map(todo => ({
            ...todo,
            // ✅ Handle both naming conventions for completed status
        completed: !!(todo.is_completed || todo.iscompleted),
        is_completed: todo.is_completed ?? todo.iscompleted ?? 0,
        
        // ✅ Handle both naming conventions for reminder_sent
        reminder_sent: todo.reminder_sent ?? todo.remindersent ?? 0,
        
        // ✅ Ensure user_id is consistently named
        user_id: todo.user_id ?? todo.userid
        }));
    };

    /**
     * Memoize normalized todos to avoid unnecessary recalculations
     * This optimizes performance by only recalculating when todos change
     */
    const normalizedTodos = useMemo(() => normalizeTodos(todos), [todos]);

    /**
     * Effect: Load todos from localStorage on component mount
     * Then fetch fresh data from backend if user is authenticated
     */
    useEffect(() => {
        // Try to load todos from localStorage first (for offline access)
        const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
        if (storedTodos.length > 0) {
            const normalized = normalizeTodos(storedTodos);
            setTodos(normalized);
            console.log('[TodoContext] Loaded todos from localStorage:', normalized);
        }

        // If user is authenticated, fetch fresh todos from backend
        if (isAuthenticated && user?.id) {
            fetchTodos();
        }
    }, [isAuthenticated, user]); // Run when auth state or user changes

    /**
     * Effect: Save todos to localStorage whenever they change
     * This provides offline access and persistence across page refreshes
     */
    useEffect(() => {
        if (todos.length > 0) {
            localStorage.setItem('todos', JSON.stringify(todos));
            console.log('[TodoContext] Synced todos to localStorage:', todos);
        }
    }, [todos]); // Run whenever todos array changes

    /**
     * Fetch all todos for the current user from the backend
     * Updates state and localStorage, then checks for reminder emails
     */
    const fetchTodos = async () => {
        // Ensure user is logged in
        if (!user?.id) {
            toast.error('User ID not available. Please log in again.');
            return;
        }

        try {
            // Call API to get todos
            const response = await todoAPI.getTodos(user.id);
            if (response.success) {
                const normalized = normalizeTodos(response.data);
                setTodos(normalized);
                localStorage.setItem('todos', JSON.stringify(response.data));
                console.log('[TodoContext] Fetched and set todos:', normalized);
                toast.success('Todos loaded successfully!');
                
                // Check if any todos need email reminders
                checkAndSendDueDateReminders();
            } else {
                toast.error(response.message || 'Failed to fetch todos.');
            }
        } catch (error) {
            console.error('Fetch todos error:', error);
            toast.error('Error fetching todos: ' + error.message);
        }
    };

   /**
 * Add a new todo to the backend and update local state
 * @param {Object} todo - Object containing { todo: string, due_date: string }
 */
const addTodo = async (todo) => {
    // Ensure user is logged in
    if (!user?.id) {
        toast.error('User ID not available. Please log in again.');
        return;
    }

    try {
        // Call API to create the todo
        const response = await todoAPI.createTodo(todo.todo, todo.due_date, user.id);
        console.log('[TodoContext] Add response:', response);
        
        if (response.success) {
            // Extract the todo ID from various possible response formats
            const todoId = response.todo?.id || response.todo_id;
            console.log('Success! Created todo with ID:', todoId);
            
            // Validate that we got an ID
            if (!todoId) {
                console.error('[TodoContext] No todo ID returned from backend:', response);
                toast.error('Todo was created but ID is missing. Please refresh the page.');
                // Refetch todos to sync with backend
                fetchTodos();
                return;
            }
            
            // Build the new todo object to add to state
            const newTodo = {
                id: todoId,
                task: todo.todo,
                due_date: todo.due_date,
                completed: false,
                is_completed: 0,
                reminder_sent: 0,
                user_id: user.id
            };
            
            // Add new todo to the beginning of the list
            setTodos((prev) => [newTodo, ...prev]);
            console.log('[TodoContext] Added todo:', newTodo);
            toast.success('Todo added successfully!');
        } else {
            toast.error(response.message || 'Failed to add todo.');
        }
    } catch (error) {
        console.error('Add todo error:', error);
        toast.error('Error adding todo: ' + error.message);
    }
};



    /**
     * Update an existing todo's task or due date
     * @param {number} id - The todo ID
     * @param {Object} updatedTodo - Object containing updated { task, due_date }
     */
    const updateTodo = async (id, updatedTodo) => {
        // Ensure user is logged in
        if (!user?.id) {
            toast.error('User ID not available. Please log in again.');
            return;
        }

        try {
            // Call API to update the todo
            const response = await todoAPI.updateTodo(id, updatedTodo.task, updatedTodo.due_date);
            if (response.success) {
                // Refetch all todos to ensure we're in sync with backend
                const fetchResponse = await todoAPI.getTodos(user.id);
                if (fetchResponse.success) {
                    const normalized = normalizeTodos(fetchResponse.data);
                    setTodos(normalized);
                    localStorage.setItem('todos', JSON.stringify(fetchResponse.data));
                    console.log('[TodoContext] Synced todos after update');
                    toast.success('Todo updated successfully!');
                    
                    // Check if updated todo now needs a reminder
                    checkAndSendDueDateReminders();
                }
            } else {
                toast.error(response.message || 'Failed to update todo.');
            }
        } catch (error) {
            console.error('Update todo error:', error);
            toast.error('Error updating todo: ' + error.message);
        }
    };

    /**
     * Delete a todo from backend and remove from state
     * @param {number} id - The todo ID to delete
     */
    const deleteTodo = async (id) => {
        try {
            // Call API to delete the todo
            const response = await todoAPI.deleteTodo(id);
            if (response.success) {
                // Remove the todo from state
                setTodos((prev) => prev.filter((todo) => todo.id !== id));
                console.log('[TodoContext] Deleted todo with id:', id);
                toast.success('Todo deleted successfully!');
            } else {
                toast.error(response.message || 'Failed to delete todo.');
            }
        } catch (error) {
            console.error('Delete todo error:', error);
            toast.error('Error deleting todo: ' + error.message);
        }
    };

    /**
     * Toggle the completion status of a todo (mark as done or undone)
     * @param {number} id - The todo ID
     */
    const toggleComplete = async (id) => {
        // Find the todo in state
        const todo = todos.find((t) => t.id === id);
        if (!todo) return;

        // Calculate the new completion status (0 = not done, 1 = done)
        const updatedIsCompleted = todo.completed ? 0 : 1;

        try {
            // Call API to update only the is_completed field
            const response = await todoAPI.updateTodo(id, null, null, updatedIsCompleted);
            if (response.success) {
                // Update the todo in state with new completion status
                setTodos((prev) =>
                    prev.map((t) =>
                        t.id === id ? { ...t, completed: !t.completed, is_completed: updatedIsCompleted } : t
                    )
                );
                console.log('[TodoContext] Toggled completion for id:', id);
                toast.success('Todo status updated!');
            } else {
                toast.error(response.message || 'Failed to update todo status.');
            }
        } catch (error) {
            console.error('Toggle complete error:', error);
            toast.error('Error updating todo status: ' + error.message);
        }
    };

    /**
     * Send an email reminder for a specific todo
     * @param {number} todoId - The todo ID
     * @returns {Promise} - Resolves when email is sent or rejects on error
     */
    const sendEmailReminder = async (todoId) => {
        // Validate todoId is provided
        if (!todoId) {
            toast.error('Cannot send email: Todo ID is missing.');
            throw new Error('Todo ID is missing');
        }

        try {
            // Call API to send email reminder
            const response = await todoAPI.sendEmailReminder(todoId);
            if (response.success) {
                console.log('[TodoContext] Email reminder sent for todo_id:', todoId);
                // ✅ Update local state to mark reminder as sent
            setTodos((prev) =>
                prev.map((todo) =>
                    todo.id === todoId 
                        ? { ...todo, reminder_sent: 1 } 
                        : todo
                )
            );
                toast.success('Email reminder sent!');
                return response;
            } else {
                toast.error(response.message || 'Failed to send email reminder.');
                throw new Error(response.message || 'Failed to send email');
            }
        } catch (error) {
            console.error('Send email reminder error:', error);
            toast.error('Error sending email reminder: ' + error.message);
            throw error;
        }
    };

    /**
     * Check all todos and send email reminders for those due today or tomorrow
     * Only sends for todos where reminder_sent = 0 (not yet sent)
     */
    const checkAndSendDueDateReminders = async () => {
        // Ensure user is authenticated
        if (!user?.id || !isAuthenticated) {
            console.log('[TodoContext] User not authenticated, skipping reminders');
            return;
        }

        // Calculate today and tomorrow in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        console.log('[TodoContext] Checking due dates - Today:', todayStr, 'Tomorrow:', tomorrowStr);


        // Filter todos that are due today or tomorrow and haven't been reminded yet
         const todosToRemind = todos.filter(todo => {
        const isDueToday = todo.due_date === todayStr;
        const isDueTomorrow = todo.due_date === tomorrowStr;
        const notReminded = (todo.reminder_sent === 0 || todo.reminder_sent === '0' || !todo.reminder_sent);
        
        return (isDueToday || isDueTomorrow) && notReminded;
    });

        // If no todos need reminders, exit early
        if (todosToRemind.length === 0) {
            console.log('[TodoContext] No todos due today or tomorrow need reminders');
            return;
        }

        console.log('[TodoContext] Sending reminders for', todosToRemind.length, 'todos');

        try {
            // Send all reminders in parallel using Promise.all
            await Promise.all(todosToRemind.map(todo => sendEmailReminder(todo.id)));
            console.log('[TodoContext] All reminders sent successfully');
            toast.success('All reminders sent!');
            fetchTodos(); // Refresh todos to update reminder_sent flags
        } catch (error) {
            console.error('[TodoContext] Error sending some reminders:', error);
            toast.error('Some reminders failed to send.');
        }
    };

    /**
     * Provide todo state and functions to child components via context
     */
    return (
        <TodoContext.Provider value={{ 
            todos: normalizedTodos, 
            addTodo, 
            updateTodo, 
            deleteTodo, 
            toggleComplete, 
            sendEmailReminder, 
            checkAndSendDueDateReminders 
        }}>
            {children}
        </TodoContext.Provider>
    );
}

/**
 * Custom hook to access TodoContext
 * Use this in any component that needs todo state or functions
 * Example: const { todos, addTodo } = useTodo();
 */
export function useTodo() {
    return useContext(TodoContext);
}

// import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
// import $ from 'jquery';
// import { toast } from 'react-toastify';
// import { useUser } from './UserContext';

// // Create context with default structure for todos
// const TodoContext = createContext({
//     todos: [],
//     addTodo: () => {},
//     updateTodo: () => {},
//     deleteTodo: () => {},
//     toggleComplete: () => {},
//     sendEmailReminder: () => {},
//     checkAndSendDueDateReminders: () => {}
// });

// export function TodoProvider({ children }) {
//     const [todos, setTodos] = useState([]); // State to store todo items
//     const { user, isAuthenticated } = useUser(); // Access current authenticated user

//     // Normalize todos by converting is_completed (0/1) to completed (boolean)
//     const normalizeTodos = (todosData) => {
//         return todosData.map(todo => ({
//             ...todo,
//             completed: !!todo.is_completed
//         }));
//     };

//     // Memoize normalized todos to optimize performance
//     const normalizedTodos = useMemo(() => normalizeTodos(todos), [todos]);

//     // Load todos from localStorage on mount or when auth state changes
//     useEffect(() => {
//         const storedTodos = JSON.parse(localStorage.getItem('todos')) || [];
//         if (storedTodos.length > 0) {
//             const normalized = normalizeTodos(storedTodos);
//             setTodos(normalized);
//             console.log('[TodoContext] Loaded todos from localStorage:', normalized);
//         }

//         // Fetch from backend if authenticated
//         if (isAuthenticated && user && user.id) {
//             fetchTodos();
//         }
//     }, [isAuthenticated, user]);

//     // Save todos to localStorage when they change
//     useEffect(() => {
//         if (todos.length > 0) {
//             localStorage.setItem('todos', JSON.stringify(todos));
//             console.log('[TodoContext] Synced todos to localStorage:', todos);
//         }
//     }, [todos]);

//     // Fetch todos from backend
//     const fetchTodos = () => {
//         if (!user || !user.id) {
//             toast.error('User ID not available. Please log in again.');
//             return;
//         }

//         console.log('[TodoContext] Fetching todos for user_id:', user.id);

//         $.ajax({
//             url: `http://localhost/WanderlustTrails/Backend/config/todos/getTodos.php?user_id=${user.id}`,
//             type: 'GET',
//             success: function (response) {
//                 console.log('[TodoContext] Fetch response:', response);
//                 if (response.success) {
//                     const normalized = normalizeTodos(response.data);
//                     setTodos(normalized);
//                     localStorage.setItem('todos', JSON.stringify(response.data));
//                     console.log('[TodoContext] Set todos:', normalized);
//                     toast.success('Todos fetched successfully!');
//                     checkAndSendDueDateReminders();
//                 } else {
//                     console.error('[TodoContext] Fetch failed:', response.message);
//                     toast.error(response.message || 'Failed to fetch todos.');
//                 }
//             },
//             error: function (xhr, status, error) {
//                 console.error('Fetch todos error:', { status, error, response: xhr.responseText });
//                 toast.error('Error fetching todos: ' + error);
//             }
//         });
//     };

//     // Add new todo to backend and update local state
//     const addTodo = (todo) => {
//         if (!user || !user.id) {
//             toast.error('User ID not available. Please log in again.');
//             return;
//         }

//         const userId = user.id;

//         $.ajax({
//             url: 'http://localhost/WanderlustTrails/Backend/config/todos/createTodo.php',
//             type: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ task: todo.todo, due_date: todo.due_date, user_id: userId }),
//             success: function (response) {
//                 console.log('[TodoContext] Add response:', response);
//                 if (response.success) {
//                     const newTodo = {
//                         id: response.todo_id,
//                         task: todo.todo,
//                         due_date: todo.due_date,
//                         completed: false,
//                         is_completed: 0,
//                         user_id: userId
//                     };
//                     setTodos((prev) => [newTodo, ...prev]);
//                     console.log('[TodoContext] Added todo:', newTodo);
//                     toast.success('Todo added successfully!');
//                 } else {
//                     console.error('[TodoContext] Add failed:', response.message);
//                     toast.error(response.message || 'Failed to add todo.');
//                 }
//             },
//             error: function (xhr, status, error) {
//                 console.error('Add todo error:', { status, error, response: xhr.responseText, todo });
//                 toast.error('Error adding todo: ' + error);
//             }
//         });
//     };

//     // Update an existing todo and sync with backend
//     const updateTodo = (id, updatedTodo) => {
//         if (!user || !user.id) {
//             toast.error('User ID not available. Please log in again.');
//             return;
//         }

//         console.log('[TodoContext] Updating todo with id:', id, 'with data:', updatedTodo);

//         $.ajax({
//             url: 'http://localhost/WanderlustTrails/Backend/config/todos/updateTodo.php',
//             type: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ id, task: updatedTodo.task, due_date: updatedTodo.due_date }),
//             success: function (response) {
//                 if (response.success) {
//                     // Fetch updated todos to stay in sync
//                     $.ajax({
//                         url: `http://localhost/WanderlustTrails/Backend/config/todos/getTodos.php?user_id=${user.id}`,
//                         type: 'GET',
//                         success: function (fetchResponse) {
//                             if (fetchResponse.success) {
//                                 const normalized = normalizeTodos(fetchResponse.data);
//                                 setTodos(normalized);
//                                 localStorage.setItem('todos', JSON.stringify(fetchResponse.data));
//                                 console.log('[TodoContext] Synced todos with backend after update for id:', id);
//                                 toast.success('Todo updated and synced successfully!');
//                                 checkAndSendDueDateReminders();
//                             } else {
//                                 console.error('[TodoContext] Failed to fetch updated todos:', fetchResponse.message);
//                                 toast.error('Failed to sync todos after update.');
//                             }
//                         },
//                         error: function (xhr, status, error) {
//                             console.error('Error fetching updated todos:', { status, error, response: xhr.responseText });
//                             toast.error('Error syncing todos after update: ' + error);
//                         }
//                     });
//                 } else {
//                     console.error('[TodoContext] Update failed:', response.message);
//                     toast.error(response.message || 'Failed to update todo.');
//                 }
//             },
//             error: function (xhr, status, error) {
//                 console.error('Update todo error:', { status, error, response: xhr.responseText });
//                 toast.error('Error updating todo: ' + error);
//             }
//         });
//     };

//     // Delete a todo from backend and remove from state
//     const deleteTodo = (id) => {
//         $.ajax({
//             url: 'http://localhost/WanderlustTrails/Backend/config/todos/deleteTodo.php',
//             type: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ id }),
//             success: function (response) {
//                 if (response.success) {
//                     setTodos((prev) => prev.filter((todo) => todo.id !== id));
//                     console.log('[TodoContext] Deleted todo with id:', id);
//                     toast.success('Todo deleted successfully!');
//                 } else {
//                     console.error('[TodoContext] Delete failed:', response.message);
//                     toast.error(response.message || 'Failed to delete todo.');
//                 }
//             },
//             error: function (xhr, status, error) {
//                 console.error('Delete todo error:', { status, error, response: xhr.responseText });
//                 toast.error('Error deleting todo: ' + error);
//             }
//         });
//     };

//     // Toggle completed status of a todo
//     const toggleComplete = (id) => {
//         const todo = todos.find((t) => t.id === id);
//         if (!todo) return;

//         const updatedCompleted = !todo.completed;
//         const updatedIsCompleted = updatedCompleted ? 1 : 0;

//         $.ajax({
//             url: 'http://localhost/WanderlustTrails/Backend/config/todos/updateTodo.php',
//             type: 'POST',
//             contentType: 'application/json',
//             data: JSON.stringify({ id, is_completed: updatedIsCompleted }),
//             success: function (response) {
//                 if (response.success) {
//                     setTodos((prev) =>
//                         prev.map((t) =>
//                             t.id === id ? { ...t, completed: updatedCompleted, is_completed: updatedIsCompleted } : t
//                         )
//                     );
//                     console.log('[TodoContext] Toggled completion for id:', id);
//                     toast.success('Todo status updated successfully!');
//                 } else {
//                     console.error('[TodoContext] Toggle failed:', response.message);
//                     toast.error(response.message || 'Failed to update todo status.');
//                 }
//             },
//             error: function (xhr, status, error) {
//                 console.error('Toggle complete error:', { status, error, response: xhr.responseText });
//                 toast.error('Error updating todo status: ' + error);
//             }
//         });
//     };

//     // Send email reminder for a single todo
//     const sendEmailReminder = (todoId) => {
//         return new Promise((resolve, reject) => {
//             if (!todoId) {
//                 console.error('[TodoContext] No todoId provided for email reminder');
//                 toast.error('Cannot send email: Todo ID is missing.');
//                 reject(new Error('Todo ID is missing'));
//                 return;
//             }

//             console.log('[TodoContext] Sending email reminder for todo_id:', todoId);
//             console.log('[TodoContext] Payload:', JSON.stringify({ todo_id: todoId }));

//             $.ajax({
//                 url: 'http://localhost/WanderlustTrails/Backend/config/todos/sendEmail.php',
//                 type: 'POST',
//                 contentType: 'application/json',
//                 data: JSON.stringify({ todo_id: todoId }),
//                 success: function (response) {
//                     console.log('[TodoContext] Email reminder response:', response);
//                     if (response.success) {
//                         console.log('[TodoContext] Email reminder sent for todo_id:', todoId);
//                         toast.success('Email reminder sent successfully for todo_id: ' + todoId);
//                         resolve(response);
//                     } else {
//                         console.error('[TodoContext] Email send failed:', response.message);
//                         toast.error(response.message || 'Failed to send email reminder for todo_id: ' + todoId);
//                         reject(new Error(response.message || 'Failed to send email'));
//                     }
//                 },
//                 error: function (xhr, status, error) {
//                     console.error('Send email reminder error:', { status, error, response: xhr.responseText });
//                     toast.error('Error sending email reminder for todo_id: ' + todoId + ': ' + error);
//                     reject(new Error(error));
//                 }
//             });
//         });
//     };

//     // Check due todos for today and tomorrow and send reminders
//     const checkAndSendDueDateReminders = async () => {
//         if (!user || !user.id || !isAuthenticated) {
//             console.log('[TodoContext] User not authenticated or ID not available, skipping reminders');
//             return;
//         }

//         const today = new Date();
//         today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); // Adjust to UTC
//         const todayStr = today.toISOString().split('T')[0];
//         const tomorrow = new Date(today);
//         tomorrow.setDate(today.getDate() + 1);
//         const tomorrowStr = tomorrow.toISOString().split('T')[0];

//         console.log('[TodoContext] Checking due dates, today is:', todayStr, 'tomorrow is:', tomorrowStr);

//         const todosToRemind = todos.filter(todo =>
//             (todo.due_date === todayStr || todo.due_date === tomorrowStr) && todo.reminder_sent === 0
//         );

//         if (todosToRemind.length === 0) {
//             console.log('[TodoContext] No todos due today or tomorrow with reminder_sent = 0');
//             toast.info('No reminders to send for today or tomorrow.');
//             return;
//         }

//         console.log('[TodoContext] Todos to remind:', todosToRemind);

//         try {
//             const sendPromises = todosToRemind.map(todo => sendEmailReminder(todo.id));
//             await Promise.all(sendPromises);
//             console.log('[TodoContext] All reminders sent successfully');
//             toast.success('All reminders sent successfully!');
//         } catch (error) {
//             console.error('[TodoContext] Error sending some reminders:', error);
//             toast.error('Some reminders failed to send. Check logs for details.');
//         }
//     };

//     // Provide todo-related state and functions to consumers
//     return (
//         <TodoContext.Provider value={{ todos: normalizedTodos, addTodo, updateTodo, deleteTodo, toggleComplete, sendEmailReminder, checkAndSendDueDateReminders }}>
//             {children}
//         </TodoContext.Provider>
//     );
// }

// // Custom hook to consume TodoContext
// export function useTodo() {
//     return useContext(TodoContext);
// }

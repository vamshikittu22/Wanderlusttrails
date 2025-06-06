import React from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { useTodo } from '../context/TodoContext';
import { TodoForm, TodoItem } from '../components/Todo/index';

// Component to display the todo list and form
function Todolist() {
    const { user, isAuthenticated } = useUser(); // Access user authentication state
    const { todos } = useTodo(); // Access the list of todos from context
    const navigate = useNavigate(); // Hook for navigation

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="bg-[#172842] min-h-screen py-8">
            <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
                <h1 className="text-2xl font-bold text-center mb-8 mt-2">Manage Your Todo List on the Trip</h1>
                <div className="mb-4">
                    <TodoForm /> {/* Render the todo form */}
                </div>
                <div>
                    {todos.length === 0 ? (
                        <p className="text-center text-gray-400">No todos found. Add one to get started!</p>
                    ) : (
                        todos.map((todo) => (
                            <div key={todo.id}>
                                <TodoItem todo={todo} /> {/* Render each todo item */}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Todolist;
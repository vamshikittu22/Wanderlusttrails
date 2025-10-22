// Path: Frontend/WanderlustTrails/src/pages/Todolist.jsx

import React from 'react';
import { useUser } from '../context/UserContext'; // Custom hook for user auth state
import { useNavigate } from 'react-router-dom'; // Navigation hook
import { useTodo } from '../context/TodoContext'; // Custom hook for todos state
import { TodoForm, TodoItem } from '../components/Todo/index'; // Todo form and item components

/**
 * Todolist component displays a todo form and list of todos for authenticated users
 * Redirects to login if user is not authenticated
 */
function Todolist() {
  const { user, isAuthenticated } = useUser(); // Get current user and auth status
  const { todos } = useTodo(); // Get todos from TodoContext
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Redirect unauthenticated users to login page
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null; // Prevent rendering anything while redirecting
  }

  return (
    <div className="bg-[#172842] min-h-screen py-8">
      <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
        <h1 className="text-2xl font-bold text-center mb-8 mt-2">
          Manage Your Todo List on the Trip
        </h1>

        {/* Render todo input form */}
        <div className="mb-4">
          <TodoForm />
        </div>

        {/* Render todos list or empty state message */}
        <div className="flex flex-col gap-2">
          {todos.length === 0 ? (
            <p className="text-center text-gray-400">
              No todos found. Add one to get started!
            </p>
          ) : (
            todos
              .filter(todo => todo.id) // Filter out any todos without IDs (safety check)
              .map((todo) => (
                <TodoItem 
                  key={todo.id} 
                  todo={todo} 
                />
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Todolist;

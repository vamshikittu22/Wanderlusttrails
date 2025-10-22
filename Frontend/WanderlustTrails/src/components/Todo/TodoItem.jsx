//path: Frontend/WanderlustTrails/src/components/Todo/TodoItem.jsx

import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';

/**
 * TodoItem displays a single todo with edit, delete, complete, and email reminder actions
 * @param {Object} props - Component props
 * @param {Object} props.todo - The todo object to display
 */
function TodoItem({ todo }) {
    // State to track if this todo is in edit mode
    const [isTodoEditable, setIsTodoEditable] = useState(false);
    
    // State for the todo task text (can be edited)
    const [todoMsg, setTodoMsg] = useState(todo.task || "");
    
    // State for the todo due date (can be edited)
    const [dueDate, setDueDate] = useState(todo.due_date || "");

    // Get todo functions from context
    const { updateTodo, deleteTodo, toggleComplete, sendEmailReminder } = useTodo();

    /**
     * Save edits made to the todo
     * Calls updateTodo and exits edit mode
     */
    const editTodo = () => {
        updateTodo(todo.id, { ...todo, task: todoMsg, due_date: dueDate });
        setIsTodoEditable(false); // Exit edit mode
    };

    /**
     * Toggle the completion status of the todo
     */
    const toggleCompleted = () => {
        toggleComplete(todo.id);
    };

    /**
     * Send an email reminder for this todo
     */
    const handleSendEmail = () => {
        sendEmailReminder(todo.id);
    };

    return (
        <div
            className={`flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black ${
                todo.completed ? "bg-[#c6e9a7]" : "bg-[#ccbed7]"
            }`}
        >
            {/* Checkbox to mark todo as completed */}
            <input
                type="checkbox"
                className="cursor-pointer"
                checked={todo.completed}
                onChange={toggleCompleted}
            />
            
            <div className="flex flex-col w-full">
                {/* Input for todo task text (editable when in edit mode) */}
                <input
                    type="text"
                    className={`border outline-none w-full bg-transparent rounded-lg ${
                        isTodoEditable ? "border-blue/10 px-2" : "border-transparent"
                    }`}
                    style={{ textDecoration: todo.completed ? "line-through" : "none" }}
                    value={todoMsg}
                    onChange={(e) => setTodoMsg(e.target.value)}
                    readOnly={!isTodoEditable} // Make readonly when not editing
                />
                
                {/* Due date input row */}
                <div className="flex items-center gap-2 mt-1">
                    <label className="text-sm text-black">Due:</label>
                    <input
                        type="date"
                        className={`border outline-none bg-transparent rounded-lg text-sm ${
                            isTodoEditable ? "border-blue/10 px-2" : "border-transparent"
                        }`}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        readOnly={!isTodoEditable} // Make readonly when not editing
                    />
                </div>
            </div>
            
            {/* Edit button (toggles edit mode or saves changes) */}
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0 disabled:opacity-50"
                onClick={() => {
                    if (todo.completed) return; // Don't allow editing completed todos
                    if (isTodoEditable) {
                        editTodo(); // Save if in edit mode
                    } else {
                        setIsTodoEditable(true); // Enter edit mode
                    }
                }}
                disabled={todo.completed}
            >
                {isTodoEditable ? "📁" : "✏️"}
            </button>
            
            {/* Delete button */}
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0"
                onClick={() => deleteTodo(todo.id)}
            >
                ❌
            </button>
            
            {/* Email reminder button */}
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0"
                onClick={handleSendEmail}
                title="Send Email Reminder"
            >
                📧
            </button>
        </div>
    );
}

export default TodoItem;

// import React from 'react';
// import { useState } from 'react';
// import { useTodo } from '../../context/TodoContext';

// // Component to display and manage individual todo items
// function TodoItem({ todo }) {
//     const [isTodoEditable, setIsTodoEditable] = useState(false); // State to toggle edit mode for this todo item
//     const [todoMsg, setTodoMsg] = useState(todo.task || ""); // State for the todo task text, initialized from prop
//     const [dueDate, setDueDate] = useState(todo.due_date || ""); // State for the todo due date, initialized from prop

//     // Destructure context functions for updating, deleting, toggling completion, and sending email reminders
//     const { updateTodo, deleteTodo, toggleComplete, sendEmailReminder } = useTodo();

//     // Function to save edits made to the todo item
//     const editTodo = () => {
//         updateTodo(todo.id, { ...todo, task: todoMsg, due_date: dueDate }); // Update todo with new task and due date
//         setIsTodoEditable(false); // Exit edit mode
//     };

//     // Function to toggle the completion status of the todo
//     const toggleCompleted = () => {
//         toggleComplete(todo.id);
//     };

//     // Function to send an email reminder for the todo
//     const handleSendEmail = () => {
//         sendEmailReminder(todo.id);
//     };

//     return (
//         <div
//             className={`flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black ${todo.completed ? "bg-[#c6e9a7]" : "bg-[#ccbed7]"}`}
//         >
//             {/* Checkbox to mark todo as completed */}
//             <input
//                 type="checkbox"
//                 className="cursor-pointer"
//                 checked={todo.completed}
//                 onChange={toggleCompleted}
//             />
//             <div className="flex flex-col w-full">
//                 {/* Input for todo task text, editable only in edit mode */}
//                 <input
//                     type="text"
//                     className={`border outline-none w-full bg-transparent rounded-lg ${isTodoEditable ? "border-blue/10 px-2" : "border-transparent"}`}
//                     style={{ textDecoration: todo.completed ? "line-through" : "none" }} // Line-through if completed
//                     value={todoMsg}
//                     onChange={(e) => setTodoMsg(e.target.value)}
//                     readOnly={!isTodoEditable} // Make input readonly if not editing
//                 />
//                 <div className="flex items-center gap-2 mt-1">
//                     <label className="text-sm text-black">Due:</label>
//                     {/* Input for due date, editable only in edit mode */}
//                     <input
//                         type="date"
//                         className={`border outline-none bg-transparent rounded-lg text-sm ${isTodoEditable ? "border-blue/10 px-2" : "border-transparent"}`}
//                         value={dueDate}
//                         onChange={(e) => setDueDate(e.target.value)}
//                         readOnly={!isTodoEditable} // Make input readonly if not editing
//                     />
//                 </div>
//             </div>
//             {/* Edit button toggles edit mode or saves changes */}
//             <button
//                 className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0 disabled:opacity-50"
//                 onClick={() => {
//                     if (todo.completed) return; // Disable edit if completed
//                     if (isTodoEditable) {
//                         editTodo(); // Save edits if currently editing
//                     } else setIsTodoEditable((prev) => !prev); // Enter edit mode
//                 }}
//                 disabled={todo.completed}
//             >
//                 {isTodoEditable ? "📁" : "✏️"} {/* Icon changes based on edit mode */}
//             </button>
//             {/* Delete button removes the todo */}
//             <button
//                 className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0"
//                 onClick={() => deleteTodo(todo.id)}
//             >
//                 ❌
//             </button>
//             {/* Email reminder button sends an email */}
//             <button
//                 className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0"
//                 onClick={handleSendEmail}
//                 title="Send Email Reminder"
//             >
//                 📧
//             </button>
//         </div>
//     );
// }

// export default TodoItem;

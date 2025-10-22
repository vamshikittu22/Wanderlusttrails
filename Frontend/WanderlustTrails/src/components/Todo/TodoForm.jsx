 //path Frontend/WanderlustTrails/src/Todo/TodoForm.jsx
import React, { useState } from 'react';
import { useTodo } from '../../context/TodoContext';

/**
 * TodoForm allows users to add new todos
 * It has inputs for the task description and due date
 */
function TodoForm() {
    // State for the todo task description
    const [todo, setTodo] = useState("");
    
    // State for the due date (YYYY-MM-DD format)
    const [dueDate, setDueDate] = useState("");
    
    // Get the addTodo function from TodoContext
    const { addTodo } = useTodo();

    /**
     * Handle form submission to add a new todo
     * @param {Event} e - Form submit event
     */
    const add = (e) => {
        e.preventDefault(); // Prevent page reload on form submit
        
        // Validate that both fields are filled
        if (!todo || !dueDate) {
            return; // Don't submit if fields are empty
        }
        
        // Call addTodo from context with the new todo data
        addTodo({ todo, completed: false, due_date: dueDate });
        
        // Reset form fields after submission
        setTodo("");
        setDueDate("");
    };

    return (
        <form onSubmit={add} className="flex flex-col gap-2">
            {/* Task input and Add button row */}
            <div className="flex">
                <input
                    type="text"
                    placeholder="Enter Todo task to remember..."
                    className="w-full border border-black/10 rounded-l-lg px-3 outline-none duration-150 bg-white/20 py-1.5"
                    value={todo}
                    onChange={(e) => setTodo(e.target.value)} // Update todo state as user types
                />
                <button
                    type="submit"
                    className="rounded-r-lg px-3 bg-green-300 text-white shrink-0"
                >
                    Add
                </button>
            </div>
            
            {/* Due date input row */}
            <div className="flex items-center gap-2">
                <label className="text-white">Due Date:</label>
                <input
                    type="date"
                    className="border border-black/10 rounded-lg px-3 outline-none duration-150 bg-white/20 py-1.5 text-white"
                    min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)} // Update dueDate state as user selects
                    required // Make this field required
                />
            </div>
        </form>
    );
}

export default TodoForm;

// import React from 'react';
// import { useState } from 'react';
// import { useTodo } from '../../context/TodoContext';

// // Component for adding new todos
// function TodoForm() {
//     const [todo, setTodo] = useState(""); // State for the todo task input
//     const [dueDate, setDueDate] = useState(""); // State for the due date input
//     const { addTodo } = useTodo(); // Access the addTodo function from context

//     // Handle form submission to add a new todo
//     const add = (e) => {
//         e.preventDefault(); // Prevent default form submission behavior
//         if (!todo || !dueDate) return; // Prevent submission if fields are empty
//         addTodo({ todo, completed: false, due_date: dueDate }); // Add new todo with default 'completed' false
//         setTodo(""); // Reset todo input field
//         setDueDate(""); // Reset due date input field
//     };

//     return (
//         <form onSubmit={add} className="flex flex-col gap-2">
//             <div className="flex">
//                 <input
//                     type="text"
//                     placeholder="Enter Todo task to remember..."
//                     className="w-full border border-black/10 rounded-l-lg px-3 outline-none duration-150 bg-white/20 py-1.5"
//                     value={todo} // Bind input value to todo state
//                     onChange={(e) => setTodo(e.target.value)} // Update todo state on input change
//                 />
//                 <button
//                     type="submit"
//                     className="rounded-r-lg px-3 bg-green-300 text-white shrink-0"
//                 >
//                     Add
//                 </button>
//             </div>
//             <div className="flex items-center gap-2">
//                 <label className="text-white">Due Date:</label>
//                 <input
//                     type="date"
//                     className="border border-black/10 rounded-lg px-3 outline-none duration-150 bg-white/20 py-1.5 text-white"
//                     min={new Date().toISOString().split("T")[0]} // Prevent selection of past dates by setting minimum to today's date
//                     value={dueDate} // Bind input value to dueDate state
//                     onChange={(e) => setDueDate(e.target.value)} // Update dueDate state on input change
//                     required // Make due date input required
//                 />
//             </div>
//         </form>
//     );
// }

// export default TodoForm;

import React from 'react';
import { useState } from 'react';
import { useTodo } from '../../context/TodoContext';

// Component to display and manage individual todo items
function TodoItem({ todo }) {
    const [isTodoEditable, setIsTodoEditable] = useState(false); // State to toggle edit mode
    const [todoMsg, setTodoMsg] = useState(todo.task || ""); // State for todo task text, defaults to todo.task
    const [dueDate, setDueDate] = useState(todo.due_date || ""); // State for due date, defaults to todo.due_date

    const { updateTodo, deleteTodo, toggleComplete, sendEmailReminder } = useTodo(); // Access todo context functions

    // Handle saving edits to the todo
    const editTodo = () => {
        updateTodo(todo.id, { ...todo, task: todoMsg, due_date: dueDate });
        setIsTodoEditable(false);
    };

    // Handle toggling the completion status of the todo
    const toggleCompleted = () => {
        toggleComplete(todo.id);
    };

    // Handle sending an email reminder for the todo
    const handleSendEmail = () => {
        sendEmailReminder(todo.id);
    };

    return (
        <div
            className={`flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black ${todo.completed ? "bg-[#c6e9a7]" : "bg-[#ccbed7]"}`}
        >
            <input
                type="checkbox"
                className="cursor-pointer"
                checked={todo.completed}
                onChange={toggleCompleted}
            />
            <div className="flex flex-col w-full">
                <input
                    type="text"
                    className={`border outline-none w-full bg-transparent rounded-lg ${isTodoEditable ? "border-blue/10 px-2" : "border-transparent"}`}
                    style={{ textDecoration: todo.completed ? "line-through" : "none" }}
                    value={todoMsg}
                    onChange={(e) => setTodoMsg(e.target.value)}
                    readOnly={!isTodoEditable}
                />
                <div className="flex items-center gap-2 mt-1">
                    <label className="text-sm text-black">Due:</label>
                    <input
                        type="date"
                        className={`border outline-none bg-transparent rounded-lg text-sm ${isTodoEditable ? "border-blue/10 px-2" : "border-transparent"}`}
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        readOnly={!isTodoEditable}
                    />
                </div>
            </div>
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0 disabled:opacity-50"
                onClick={() => {
                    if (todo.completed) return;
                    if (isTodoEditable) {
                        editTodo();
                    } else setIsTodoEditable((prev) => !prev);
                }}
                disabled={todo.completed}
            >
                {isTodoEditable ? "📁" : "✏️"}
            </button>
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0"
                onClick={() => deleteTodo(todo.id)}
            >
                ❌
            </button>
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
// Enable client-side features in this component (required in Next.js App Router)
// Without this, things like useState/useEffect won't work
'use client';

import React, { useEffect, useState } from 'react'; // Core React features

// TypeScript interface that describes a single Todo object
interface Todo {
  id: number;          // Unique identifier for the todo
  task: string;        // Text content of the task
  completed: boolean;  // Whether or not the task is marked complete
}

// Define a custom type for filter options the user can select
type Filter = 'all' | 'active' | 'completed';

// Priority levels shown in a dropdown, each with a label and an emoji
const PRIORITY_OPTIONS = [
  { label: '🔥 High', emoji: '🔥' },
  { label: '✨ Medium', emoji: '✨' },
  { label: '💤 Low', emoji: '💤' },
];

// Functional React component — this is the homepage of your app
export default function Home() {
  // Local state variables using React's useState hook
  const [todos, setTodos] = useState<Todo[]>([]); // Stores the full list of todos
  const [task, setTask] = useState('');           // Stores current value of the input box
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[1].emoji); // Default: medium priority
  const [filter, setFilter] = useState<Filter>('all'); // Current active filter tab
  const [darkMode, setDarkMode] = useState(false);     // Toggle for dark mode (false = light)

  // Backend API base URL — used in all fetch calls
  const API = 'http://localhost:5000/api/todos';

  // Fetch the list of todos from the backend when the component first mounts
  useEffect(() => {
    fetchTodos();
  }, []); // Empty dependency array ensures this only runs once

  // Every time darkMode changes, update the <body> class to apply theme styles
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  // Function to fetch all todos from the API and store them in state
  async function fetchTodos() {
    const res = await fetch(API);       // Make GET request to Flask backend
    const data = await res.json();      // Parse the JSON response
    setTodos(data);                     // Store results in component state
  }

  // Function to add a new todo to the backend
  async function addTodo() {
    if (!task.trim()) return; // Do not allow blank entries

    // POST the new task to the backend
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: `${priority} ${task}` // Include priority emoji in task text (can be replaced with real field)
      }),
    });

    setTask('');   // Clear the input box after submission
    fetchTodos();  // Refresh the todo list from server
  }

  // Function to toggle the completed status of a given todo
  async function toggleTodo(id: number, completed: boolean) {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }), // Send only the new completion status
    });
    fetchTodos(); // Refresh list to show update
  }

  // Function to delete a todo by its ID
  async function deleteTodo(id: number) {
    await fetch(`${API}/${id}`, { method: 'DELETE' }); // Call backend DELETE endpoint
    fetchTodos(); // Refresh the list after deletion
  }

  // Function to return only the todos relevant to the active filter
  function filteredTodos() {
    switch (filter) {
      case 'active':
        return todos.filter((t) => !t.completed); // Only incomplete tasks
      case 'completed':
        return todos.filter((t) => t.completed);  // Only completed tasks
      default:
        return todos;                             // Show everything
    }
  }

  // JSX layout to render the entire page
  return (
    <div className="container">

      {/* Heading */}
      <h1>To Do List</h1>

      {/* Form to add a new todo */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Prevent full page reload
          addTodo();          // Submit new todo
        }}
      >
        {/* Text input for the task */}
        <input
          type="text"
          placeholder="Write task here..."
          value={task}
          onChange={(e) => setTask(e.target.value)} // Live update of task state
        />

        {/* Priority dropdown selector */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)} // Change selected priority
        >
          {/* Render dropdown options from PRIORITY_OPTIONS array */}
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.emoji} value={opt.emoji}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Submit button */}
        <button type="submit">Add</button>
      </form>

      {/* Filter tab buttons: All / Active / Completed */}
      <div className="filters">
        {(['all', 'active', 'completed'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)} // Change the active filter
            className={filter === f ? 'active' : ''} // Highlight active tab
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} {/* Capitalize tab name */}
          </button>
        ))}
      </div>

      {/* Render the todo list */}
      <ul className="todo-list">
        {filteredTodos().map((todo) => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`} // Style based on completion status
          >
            {/* Label wraps the checkbox and text */}
            <label style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, !todo.completed)} // Toggle status
              />
              <span className="text">{todo.task}</span> {/* Render task text */}
            </label>

            {/* Delete button on the right */}
            <button onClick={() => deleteTodo(todo.id)} title="Delete">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

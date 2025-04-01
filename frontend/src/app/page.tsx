'use client';

import { useEffect, useState } from 'react';

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState('');

  const API = 'http://localhost:5000/api/todos';

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const res = await fetch(API);
    const data = await res.json();
    setTodos(data);
  }

  async function addTodo() {
    if (!task.trim()) return;
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    setTask('');
    fetchTodos();
  }

  async function toggleTodo(id: number, completed: boolean) {
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    fetchTodos();
  }

  async function deleteTodo(id: number) {
    await fetch(`${API}/${id}`, { method: 'DELETE' });
    fetchTodos();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white/30 backdrop-blur-lg shadow-xl rounded-xl p-8 w-full max-w-xl">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <img src="/file.svg" alt="Todo Icon" className="w-8 h-8" />
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
              Todo List
            </h1>
          </div>
          
          {/* Minimalistic divider line */}
          <div className="w-24 h-0.5 bg-white/50 rounded-full" />
        </div>

        {/* Input + Add */}
        <div className="flex gap-2 mb-6">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white/70 shadow-sm bg-white/80 backdrop-blur placeholder-gray-500"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 bg-white text-pink-600 font-semibold rounded-lg shadow hover:bg-pink-100 transition"
          >
            Add
          </button>
        </div>

        {/* Todo list */}
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center px-4 py-3 bg-white/60 border border-white/40 rounded-lg shadow backdrop-blur hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, !todo.completed)}
                  className="h-5 w-5 accent-pink-600"
                />
                <span
                  className={`text-lg ${
                    todo.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-800'
                  }`}
                >
                  {todo.task}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-600 hover:text-red-800 transition text-lg"
                title="Delete"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

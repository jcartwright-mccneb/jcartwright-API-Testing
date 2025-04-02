'use client';

import React, { useEffect, useState } from 'react';

interface Todo {
  id: number;
  task: string;
  completed: boolean;
}

type Filter = 'all' | 'active' | 'completed';

const PRIORITY_OPTIONS = [
  { label: '🔥 High', emoji: '🔥' },
  { label: '✨ Medium', emoji: '✨' },
  { label: '💤 Low', emoji: '💤' },
];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[1].emoji);
  const [filter, setFilter] = useState<Filter>('all');
  const [darkMode, setDarkMode] = useState(false);

  const API = 'http://localhost:5000/api/todos';

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

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
      body: JSON.stringify({ task: `${priority} ${task}` }),
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

  function filteredTodos() {
    switch (filter) {
      case 'active':
        return todos.filter((t) => !t.completed);
      case 'completed':
        return todos.filter((t) => t.completed);
      default:
        return todos;
    }
  }

  return (
    <div className="container">
      <h1>Todo List</h1>
      <p className="sub">Stay focused, stay cool.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTodo();
        }}
      >
        <input
          type="text"
          placeholder="Add something awesome..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.emoji} value={opt.emoji}>
              {opt.label}
            </option>
          ))}
        </select>
        <button type="submit">Add</button>
      </form>

      <div className="filters">
        {(['all', 'active', 'completed'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'active' : ''}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <ul className="todo-list">
        {filteredTodos().map((todo) => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
          >
            <label style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, !todo.completed)}
              />
              <span className="text">{todo.task}</span>
            </label>
            <button onClick={() => deleteTodo(todo.id)} title="Delete">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

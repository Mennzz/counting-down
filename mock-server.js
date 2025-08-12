#!/usr/bin/env node

import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for development
let todos = [
  {
    id: 1,
    text: "Watch the sunset together from the hill",
    completed: false,
    category: "Adventure",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    text: "Cook that pasta recipe we found online",
    completed: false,
    category: "Home",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    text: "Have a picnic in the park",
    completed: false,
    category: "Date",
    createdAt: new Date().toISOString(),
  },
  {
    id: 4,
    text: "Visit the art museum downtown",
    completed: false,
    category: "Culture",
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    text: "Try that new coffee shop everyone talks about",
    completed: false,
    category: "Food",
    createdAt: new Date().toISOString(),
  },
  {
    id: 6,
    text: "Take a weekend trip to the mountains",
    completed: false,
    category: "Adventure",
    createdAt: new Date().toISOString(),
  },
  {
    id: 7,
    text: "Have a movie marathon night with our favorite films",
    completed: false,
    category: "Home",
    createdAt: new Date().toISOString(),
  },
  {
    id: 8,
    text: "Learn to dance together",
    completed: false,
    category: "Activity",
    createdAt: new Date().toISOString(),
  },
];

let nextId = 9;

// Helper to simulate network delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Routes

// GET /api/todos - Get all todos
app.get("/api/todos", async (req, res) => {
  await delay(500); // Simulate network delay
  res.json(todos);
});

// POST /api/todos - Create a new todo
app.post("/api/todos", async (req, res) => {
  await delay(300);

  const { text, category } = req.body;

  if (!text || !category) {
    return res.status(400).json({ error: "Text and category are required" });
  }

  const newTodo = {
    id: nextId++,
    text,
    category,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// `PUT` /api/todos/:id - Update a todo
app.put("/api/todos/:id", async (req, res) => {
  await delay(300);

  const id = parseInt(req.params.id);
  const updates = req.body;

  const todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todos[todoIndex] = {
    ...todos[todoIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  res.json(todos[todoIndex]);
});

// DELETE /api/todos/:id - Delete a todo
app.delete("/api/todos/:id", async (req, res) => {
  await delay(300);

  const id = parseInt(req.params.id);
  const todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todos.splice(todoIndex, 1);
  res.status(204).send();
});

// POST /api/todos/:id/toggle-completion - Toggle completion status of a todo
app.post("/api/todos/:id/toggle-completion", async (req, res) => {
  await delay(300);

  const id = parseInt(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }

  todo.completed = !todo.completed;
  res.json(todo);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Todos endpoint: http://localhost:${PORT}/api/todos`);
});

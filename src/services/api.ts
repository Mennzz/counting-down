import { Todo, CreateTodoRequest, UpdateTodoRequest } from "@/types/todo";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new ApiError(
      response.status,
      errorMessage || `HTTP ${response.status}`
    );
  }
  return response.json();
}

export const todoApi = {
  // Get all todos
  getTodos: async (): Promise<Todo[]> => {
    const response = await fetch(`${API_BASE_URL}/todos`);
    return handleResponse<Todo[]>(response);
  },

  // Create a new todo
  createTodo: async (todo: CreateTodoRequest): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
    return handleResponse<Todo>(response);
  },

  // Update an existing todo
  updateTodo: async (id: number, updates: UpdateTodoRequest): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });
    return handleResponse<Todo>(response);
  },

  // Delete a todo
  deleteTodo: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new ApiError(
        response.status,
        errorMessage || `HTTP ${response.status}`
      );
    }
  },

  toggleTodo: async (id: number): Promise<Todo> => {
    const response = await fetch(
      `${API_BASE_URL}/todos/${id}/toggle-completion`,
      {
        method: "POST",
      }
    );
    return handleResponse<Todo>(response);
  },
};

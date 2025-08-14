import { Todo, CreateTodoRequest, UpdateTodoRequest } from "@/types/todo";

const API_BASE_URL = "https://countdown-ded22115b668.herokuapp.com/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json();
    const errorMessage = data.message || `HTTP ${response.status}`;
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
    const data = await handleResponse<{
      success: boolean;
      data: Todo[];
      message: string;
    }>(response);
    return data.data;
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
    const res = await handleResponse<{
      success: boolean;
      data: Todo;
      message: string;
    }>(response);
    return res.data;
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
    const res = await handleResponse<{
      success: boolean;
      data: Todo;
      message: string;
    }>(response);
    return res.data;
  },

  // Delete a todo
  deleteTodo: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json();
      const errorMessage = data.message || `HTTP ${response.status}`;
      throw new ApiError(
        response.status,
        errorMessage || `HTTP ${response.status}`
      );
    }
  },

  toggleTodo: async (_id: number): Promise<Todo> => {
    const response = await fetch(
      `${API_BASE_URL}/todos/${_id}/toggle-completion`,
      {
        method: "POST",
      }
    );
    const res = await handleResponse<{
      success: boolean;
      data: Todo;
      message: string;
    }>(response);
    return res.data;
  },
};

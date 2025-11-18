import { camelToSnake } from "@/utils/utils";
import { API_BASE_URL, ApiError } from "./api";
import { Todo, CreateTodoRequest, UpdateTodoRequest } from "@/types/todo";
import { processResponse } from "@/utils/api";

export const todoApi = {
  // Get all todos
  getTodos: async (): Promise<Todo[]> => {
    const response = await fetch(`${API_BASE_URL}/todos`);
    return await processResponse<Todo[]>(await response.json());
  },

  // Create a new todo
  createTodo: async (todo: CreateTodoRequest): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // convert outgoing payload keys to snake_case if backend expects it
      body: JSON.stringify(camelToSnake(todo)),
    });
    return await processResponse<Todo>(await response.json());
  },

  // Update an existing todo
  updateTodo: async (id: number, updates: UpdateTodoRequest): Promise<Todo> => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(camelToSnake(updates)),
    });
    return await processResponse<Todo>(await response.json());
  },

  // Delete a todo
  deleteTodo: async (id: string): Promise<void> => {
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

  toggleTodo: async (_id: string): Promise<Todo> => {
    const response = await fetch(
      `${API_BASE_URL}/todos/${_id}/toggle-completion`,
      {
        method: "POST",
      }
    );
    return await processResponse<Todo>(await response.json());
  },
};

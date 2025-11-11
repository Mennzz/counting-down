import { Todo, CreateTodoRequest, UpdateTodoRequest } from "@/types/todo";
import { Message } from "@/types/message";
import { snakeToCamel, camelToSnake } from "@/lib/utils";
import { List } from "lucide-react";

const API_BASE_URL = import.meta.env.DEV 
  ? "/api/v1" 
  : "https://counting-down-fastapi-2ad079e42b08.herokuapp.com/api/v1/"  //"https://countdown-ded22115b668.herokuapp.com/api";

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
    const repsonse = await fetch(`${API_BASE_URL}/todos`);
    return snakeToCamel<Todo[]>(await repsonse.json());
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
    return snakeToCamel<Todo>(await response.json());
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
    return snakeToCamel<Todo>(response.json());
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
    return snakeToCamel<Todo>(response.json());
  },
};

export const messageApi = {
  // Get all messages
  getMessages: async (): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/messages`);
    const messages = snakeToCamel<Message[]>(await response.json());
    messages.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    return messages;
  },

  // Create a new message
  createMessage: async (message: any): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
    return snakeToCamel<Message>(await response.json());
  },

  // Delete a message
  deleteMessage: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
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
};

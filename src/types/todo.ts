export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTodoRequest {
  text: string;
  category: string;
}

export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
  category?: string;
}

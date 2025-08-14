export interface Todo {
  _id: number;
  title: string;
  completed: boolean;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTodoRequest {
  title: string;
  category: string;
}

export interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
  category?: string;
}

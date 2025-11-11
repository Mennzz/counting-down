export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  // createdAt/updatedAt are camelCase in the app. The API uses snake_case
  // (created_at/updated_at). The API layer maps backend snake_case fields
  // to these camelCase properties so interfaces stay idiomatic.
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

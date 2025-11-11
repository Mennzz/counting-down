export interface Message {
  id: string;
  sender?: string;
  message: string;
  createdAt?: string;
  deletedAt?: string;
}

export interface CreateMessageRequest {
  sender?: string;
  message: string;
}

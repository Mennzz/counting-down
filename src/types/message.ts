export interface Message {
  _id: number;
  sender?: string;
  message: string;
  createdAt?: string;
  deletedAt?: string;
}

export interface CreateMessageRequest {
  sender?: string;
  message: string;
}

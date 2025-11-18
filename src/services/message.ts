import { Message } from "@/types/message";
import { API_BASE_URL, ApiError } from "./api";
import { processResponse } from "@/utils/api";

export const messageApi = {
  // Get all messages
  getMessages: async (): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/messages`);

    if (!response.ok) {
      throw new ApiError(response.status, "Failed to fetch messages");
    }

    const messages = await processResponse<Message[]>(await response.json());
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
    return await processResponse<Message>(await response.json());
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

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export const MESSAGES_QUERY_KEY = ["messages"];

export const useMessages = () => {
  return useQuery({
    queryKey: MESSAGES_QUERY_KEY,
    queryFn: messageApi.getMessages,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: messageApi.createMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
      toast({
        title: "Message send! 💕",
        description: "Your sweet message has been sent with love!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create message: ${error.message}`,
      });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: messageApi.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
      toast({
        title: "Success",
        description: "Message deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete message: ${error.message}`,
      });
    },
  });
};

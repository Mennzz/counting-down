import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/services/api";
import { UpdateTodoRequest } from "@/types/todo";
import { useToast } from "@/hooks/use-toast";

export const TODOS_QUERY_KEY = ["todos"];

// Hook to fetch all todos
export const useTodos = () => {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: todoApi.getTodos,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a new todo
export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: todoApi.createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast({
        title: "Success",
        description: "Todo created successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create todo: ${error.message}`,
      });
    },
  });
};

// Hook to update a todo
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateTodoRequest }) =>
      todoApi.updateTodo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast({
        title: "Success",
        description: "Todo updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update todo: ${error.message}`,
      });
    },
  });
};

// Hook to delete a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: todoApi.deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast({
        title: "Success",
        description: "Todo deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete todo: ${error.message}`,
      });
    },
  });
};

export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: todoApi.toggleTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      toast({
        title: "Success",
        description: "Todo toggled successfully!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to toggle todo: ${error.message}`,
      });
    },
  });
};

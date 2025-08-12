import { useState } from "react";
import { List, Heart, Plus, Clock, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useToggleTodo } from "@/hooks/useTodos";

const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Date");

  // React Query hooks for data fetching and mutations
  const { data: todos = [], isLoading, error } = useTodos();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();
  const toggleTodoMutation = useToggleTodo();

  const categories = ["Date", "Adventure", "Home", "Food", "Culture", "Activity"];

  const addTodo = async () => {
    if (newTodo.trim()) {
      try {
        await createTodoMutation.mutateAsync({
          text: newTodo.trim(),
          category: selectedCategory,
        });
        setNewTodo("");
      } catch (error) {
        // Error is handled by the mutation hook
        console.error("Failed to create todo:", error);
      }
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      try {
        await toggleTodoMutation.mutateAsync(id);
      } catch (error) {
        // Error is handled by the mutation hook
        console.error("Failed to update todo:", error);
      }
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await deleteTodoMutation.mutateAsync(id);
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Failed to delete todo:", error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Date: "bg-rose-50 text-rose-600 border-rose-200",
      Adventure: "bg-orange-50 text-orange-600 border-orange-200",
      Home: "bg-blue-50 text-blue-600 border-blue-200",
      Food: "bg-green-50 text-green-600 border-green-200",
      Culture: "bg-purple-50 text-purple-600 border-purple-200",
      Activity: "bg-pink-50 text-pink-600 border-pink-200",
    };
    return colors[category as keyof typeof colors] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  const completedCount = todos.filter(todo => todo.completed).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <List className="w-6 h-6 text-rose-500" />
            <h2 className="text-4xl font-playfair font-semibold text-rose-600">Things We Want to Do Together</h2>
            <List className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-lg text-gray-600 font-inter">
            Our bucket list of shared adventures
          </p>
        </div>

        <div className="love-card">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <List className="w-6 h-6 text-rose-500" />
            <h2 className="text-4xl font-playfair font-semibold text-rose-600">Things We Want to Do Together</h2>
            <List className="w-6 h-6 text-rose-500" />
          </div>
          <p className="text-lg text-gray-600 font-inter">
            Our bucket list of shared adventures
          </p>
        </div>

        <div className="love-card">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load todos</p>
            <p className="text-gray-500 text-sm">Please check your internet connection or try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <List className="w-6 h-6 text-rose-500" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Things We Want to Do Together</h2>
          <List className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-lg text-gray-600 font-inter">
          Our bucket list of shared adventures
        </p>
      </div>

      <div className="love-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <span className="text-lg font-medium text-gray-700">
              <span className="text-rose-600 font-bold">{completedCount}</span> of{" "}
              <span className="text-rose-600 font-bold">{todos.length}</span> completed
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Creating memories together</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add something new we should do together..."
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && addTodo()}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <Button onClick={addTodo} className="bg-rose-500 hover:bg-rose-600 text-white" disabled={createTodoMutation.isPending}>
            {createTodoMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 ${todo.completed
                ? "bg-green-50 border-green-200"
                : "bg-white border-gray-200 hover:border-rose-200"
                }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                disabled={updateTodoMutation.isPending}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${todo.completed
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300 hover:border-rose-400"
                  } ${updateTodoMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {updateTodoMutation.isPending ? (
                  <Loader2 className="w-3 h-3 text-white mx-auto animate-spin" />
                ) : todo.completed ? (
                  <Heart className="w-4 h-4 text-white mx-auto" />
                ) : null}
              </button>

              <div className="flex-1">
                <p className={`font-inter ${todo.completed
                  ? "line-through text-gray-500"
                  : "text-gray-700"
                  }`}>
                  {todo.text}
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(todo.category)}`}>
                {todo.category}
              </span>

              <button
                onClick={() => deleteTodo(todo.id)}
                disabled={deleteTodoMutation.isPending}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete todo"
              >
                {deleteTodoMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoList;

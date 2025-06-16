import { useState } from "react";
import { List, Heart, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TodoList = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: "Watch the sunset together from the hill", completed: false, category: "Adventure" },
    { id: 2, text: "Cook that pasta recipe we found online", completed: false, category: "Home" },
    { id: 3, text: "Have a picnic in the park", completed: false, category: "Date" },
    { id: 4, text: "Visit the art museum downtown", completed: false, category: "Culture" },
    { id: 5, text: "Try that new coffee shop everyone talks about", completed: false, category: "Food" },
    { id: 6, text: "Take a weekend trip to the mountains", completed: false, category: "Adventure" },
    { id: 7, text: "Have a movie marathon night with our favorite films", completed: false, category: "Home" },
    { id: 8, text: "Learn to dance together", completed: false, category: "Activity" },
  ]);
  
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Date");

  const categories = ["Date", "Adventure", "Home", "Food", "Culture", "Activity"];

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: newTodo.trim(),
          completed: false,
          category: selectedCategory,
        },
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
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
          <Button onClick={addTodo} className="bg-rose-500 hover:bg-rose-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 ${
                todo.completed
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-gray-200 hover:border-rose-200"
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  todo.completed
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300 hover:border-rose-400"
                }`}
              >
                {todo.completed && (
                  <Heart className="w-4 h-4 text-white mx-auto" />
                )}
              </button>
              
              <div className="flex-1">
                <p className={`font-inter ${
                  todo.completed 
                    ? "line-through text-gray-500" 
                    : "text-gray-700"
                }`}>
                  {todo.text}
                </p>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(todo.category)}`}>
                {todo.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoList;

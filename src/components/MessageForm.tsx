
import { useState } from "react";
import { MessageSquare, Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const MessageForm = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [messages, setMessages] = useState([
    {
      id: 1,
      name: "Your Love",
      message: "Missing you so much today. Can't wait to hold you again! 💕",
      date: "2 hours ago"
    },
    {
      id: 2,
      name: "Anonymous",
      message: "You two are the cutest couple ever! Sending you both love!",
      date: "1 day ago"
    },
    {
      id: 3,
      name: "Your Love",
      message: "That photo you sent made my whole day. You're so beautiful inside and out.",
      date: "3 days ago"
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      const newMessage = {
        id: Date.now(),
        name: name.trim() || "Anonymous",
        message: message.trim(),
        date: "Just now"
      };
      
      setMessages([newMessage, ...messages]);
      setName("");
      setMessage("");
      setIsSubmitting(false);
      
      toast({
        title: "Message sent! 💕",
        description: "Your sweet message has been delivered with love.",
      });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <MessageSquare className="w-6 h-6 text-rose-500" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Sweet Messages</h2>
          <MessageSquare className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-lg text-gray-600 font-inter">
          Leave a little love note for us
        </p>
      </div>

      <div className="love-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <Heart className="w-8 h-8 text-rose-400 mx-auto mb-2 animate-heart-beat" />
            <h3 className="text-xl font-playfair font-medium text-gray-800">
              Send Us Some Love
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Your message will brighten our day
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (optional)
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Anonymous"
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your Message *
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write something sweet..."
                required
                rows={4}
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400 resize-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 text-lg font-medium"
          >
            {isSubmitting ? (
              <>
                <Heart className="w-5 h-5 mr-2 animate-spin" />
                Sending with love...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-playfair font-medium text-gray-800 text-center">
          Recent Messages
        </h3>
        
        {messages.map((msg) => (
          <div key={msg.id} className="love-card">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-800">{msg.name}</span>
                  <span className="text-xs text-gray-500">{msg.date}</span>
                </div>
                <p className="text-gray-600 font-inter leading-relaxed">
                  {msg.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageForm;

import { useState } from "react";
import { MessageSquare, Heart, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateMessage, useDeleteMessage, useMessages } from "@/hooks/use-messages";
import { getRelativeTimeAsText } from "@/utils/utils";

const MessageForm = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: messages = [], isLoading, error } = useMessages();
  const createMessageMutation = useCreateMessage();
  const deleteMessageMutation = useDeleteMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await createMessageMutation.mutateAsync({ sender: name.trim() || "Anonymous", message: message.trim() });
      setName("");
      setMessage("");
      toast({
        title: "Message Sent",
        description: "Your sweet message has been sent successfully!",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await deleteMessageMutation.mutateAsync(id);
      setConfirmDeleteId(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "There was an error deleting the message. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (<div className="text-center py-10">
      <Loader2 className="w-6 h-6 text-rose-500 animate-spin mx-auto" />
      <p className="text-gray-600 mt-2">Loading messages...</p>
    </div>);
  }

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
          <div key={msg.id} className="bg-white/60 backdrop-blur-sm border border-rose-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100">
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-800">{msg.sender ? msg.sender : "Anonymous"}</span>
                  <span className="text-xs text-gray-500">{getRelativeTimeAsText(msg.createdAt)}</span>
                </div>
                <p className="text-gray-600 font-inter leading-relaxed">
                  {msg.message}
                </p>
                <div className="text-right mt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => setConfirmDeleteId(msg.id)}
                        disabled={deleteMessageMutation.isPending}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete message"
                      >
                        {deleteMessageMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </DialogTrigger>
                    {confirmDeleteId === msg.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Message</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this message? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <button
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deleteMessageMutation.isPending}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={() => deleteMessage(msg.id)}
                            disabled={deleteMessageMutation.isPending}
                          >
                            {deleteMessageMutation.isPending ? "Deleting..." : "Delete"}
                          </button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageForm;

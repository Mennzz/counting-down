
import { useState, useEffect } from "react";
import { MessageSquare, Heart } from "lucide-react";

const LoveNotes = () => {
  const [currentNote, setCurrentNote] = useState(0);
  
  const loveNotes = [
    {
      id: 1,
      text: "Good morning, beautiful. I hope your day is as wonderful as you make me feel every single day.",
      date: "Today"
    },
    {
      id: 2,
      text: "I was just thinking about that laugh of yours – it's my favorite sound in the entire world.",
      date: "Yesterday"
    },
    {
      id: 3,
      text: "Distance means nothing when someone means everything. You mean everything to me.",
      date: "2 days ago"
    },
    {
      id: 4,
      text: "Every night I fall asleep thinking of you, and every morning I wake up excited to talk to you.",
      date: "3 days ago"
    },
    {
      id: 5,
      text: "You're not just my partner, you're my best friend, my safe place, my everything.",
      date: "4 days ago"
    },
    {
      id: 6,
      text: "I love how we can talk for hours and it feels like minutes. Time stops when I'm with you.",
      date: "5 days ago"
    },
    {
      id: 7,
      text: "Your kindness, your humor, your warmth – everything about you makes me a better person.",
      date: "6 days ago"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNote((prev) => (prev + 1) % loveNotes.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [loveNotes.length]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <MessageSquare className="w-6 h-6 text-rose-500" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Daily Love Notes</h2>
          <MessageSquare className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-lg text-gray-600 font-inter">
          Little reminders of how much you mean to me
        </p>
      </div>

      <div className="love-card text-center min-h-[200px] flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <Heart className="w-8 h-8 text-rose-400 mx-auto mb-4 animate-heart-beat" />
          <blockquote className="text-xl md:text-2xl font-inter text-gray-700 leading-relaxed mb-4 italic">
            "{loveNotes[currentNote].text}"
          </blockquote>
          <p className="text-sm text-gray-500 font-medium">
            {loveNotes[currentNote].date}
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 text-6xl text-rose-100 font-playfair">"</div>
        <div className="absolute bottom-4 right-4 text-6xl text-rose-100 font-playfair rotate-180">"</div>
      </div>

      <div className="flex justify-center space-x-2">
        {loveNotes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentNote(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentNote ? "bg-rose-500" : "bg-rose-200 hover:bg-rose-300"
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loveNotes.slice(0, 6).map((note, index) => (
          <div
            key={note.id}
            className={`love-card cursor-pointer transition-all duration-200 ${
              index === currentNote ? "ring-2 ring-rose-300" : ""
            }`}
            onClick={() => setCurrentNote(index)}
          >
            <p className="text-sm text-gray-600 mb-2 italic">"{note.text}"</p>
            <p className="text-xs text-gray-400">{note.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoveNotes;

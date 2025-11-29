import { Calendar, Clock, Heart, Image, MessageSquare, Music } from "lucide-react";

const RelationshipStats = () => {
  const stats = [
    {
      icon: Calendar,
      label: "Days Together",
      value: "542",
      subtitle: "And counting every moment",
      color: "text-rose-500"
    },
    {
      icon: MessageSquare,
      label: "Messages Sent",
      value: "15,847",
      subtitle: "Words of love exchanged",
      color: "text-blue-500"
    },
    {
      icon: Clock,
      label: "FaceTime Hours",
      value: "1,234",
      subtitle: "Hours spent together virtually",
      color: "text-green-500"
    },
    {
      icon: Image,
      label: "Photos Shared",
      value: "2,156",
      subtitle: "Memories captured",
      color: "text-purple-500"
    },
    {
      icon: Music,
      label: "Songs in Our Playlist",
      value: "127",
      subtitle: "Soundtrack to our love",
      color: "text-orange-500"
    },
    {
      icon: Heart,
      label: "Inside Jokes",
      value: "∞",
      subtitle: "Too many to count",
      color: "text-pink-500"
    }
  ];

  const milestones = [
    { date: "First Message", description: "When it all began", emoji: "💬" },
    { date: "First Video Call", description: "Seeing your smile for the first time", emoji: "📹" },
    { date: "First 'I Love You'", description: "The words that changed everything", emoji: "💕" },
    { date: "First Visit", description: "Finally in each other's arms", emoji: "🤗" },
    { date: "Moving In Together", description: "Making it official", emoji: "🏠" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="w-6 h-6 text-rose-500 animate-heart-beat" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Our Love by the Numbers</h2>
          <Heart className="w-6 h-6 text-rose-500 animate-heart-beat" />
        </div>
        <p className="text-lg text-gray-600 font-inter">
          Every number tells a piece of our story
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="love-card text-center">
              <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-4`} />
              <div className="text-3xl font-playfair font-bold text-gray-800 mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-medium text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500 font-inter">
                {stat.subtitle}
              </div>
            </div>
          );
        })}
      </div>

      <div className="love-card">
        <h3 className="text-2xl font-playfair font-semibold text-rose-600 mb-6 text-center">
          Our Journey Together
        </h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-rose-50 rounded-xl">
              <div className="text-2xl">{milestone.emoji}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 font-inter">
                  {milestone.date}
                </div>
                <div className="text-sm text-gray-600">
                  {milestone.description}
                </div>
              </div>
              <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="love-card inline-block">
          <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2 animate-heart-beat" />
          <p className="text-gray-600 font-inter italic">
            "Love doesn't count days, it makes every day count."
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelationshipStats;

import { useMemo } from "react";
import { differenceInDays, format, formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import { Calendar, Clock, Heart, List, MessageSquare, Plane } from "lucide-react";

import { useMessages } from "@/hooks/use-messages";
import { useTodos } from "@/hooks/use-todos";
import { useNextFlight } from "@/hooks/use-flights";
import { getFlightInProgress } from "@/utils/flight";

type Milestone = {
  date: string;
  description: string;
  emoji: string;
};

const RelationshipStats = () => {
  const { data: messages = [], isLoading: isMessagesLoading } = useMessages();
  const { data: todos = [], isLoading: isTodosLoading } = useTodos();
  const { data: nextFlight, isLoading: isFlightLoading } = useNextFlight();

  const lastMessage = messages[0];
  const earliestMessage = messages[messages.length - 1];
  const lastMessageTimeAgo = lastMessage?.createdAt
    ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
    : null;
  const lastMessagePreview = lastMessage?.message
    ? (lastMessage.message.length > 140 ? `${lastMessage.message.slice(0, 140)}…` : lastMessage.message)
    : null;

  const daysSinceFirstMessage = earliestMessage?.createdAt
    ? differenceInDays(new Date(), new Date(earliestMessage.createdAt))
    : null;

  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );
  const openTodos = todos.length - completedTodos;
  const todoProgress = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;

  const favoriteOpenCategory = useMemo(() => {
    const counts = todos.reduce<Record<string, number>>((acc, todo) => {
      if (todo.completed) {
        return acc;
      }
      acc[todo.category] = (acc[todo.category] ?? 0) + 1;
      return acc;
    }, {});

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? null;
  }, [todos]);

  const arrivalDistance = nextFlight
    ? formatDistanceToNowStrict(new Date(nextFlight.arrivalAt), { addSuffix: false })
    : null;
  const arrivalCountdown = nextFlight
    ? formatDistanceToNow(new Date(nextFlight.arrivalAt), { addSuffix: true })
    : null;
  const departureCity = nextFlight?.departureAirport?.city || nextFlight?.departureAirport?.iata || "";
  const arrivalCity = nextFlight?.arrivalAirport?.city || nextFlight?.arrivalAirport?.iata || "";
  const flightRoute = departureCity && arrivalCity
    ? `${departureCity} → ${arrivalCity}`
    : arrivalCity || departureCity || "Somewhere special";
  const flightInProgress = nextFlight ? getFlightInProgress(nextFlight) : false;
  const flightHasLanded = nextFlight
    ? !flightInProgress && new Date(nextFlight.arrivalAt).getTime() <= Date.now()
    : false;

  const stats = [
    {
      icon: MessageSquare,
      label: "Love Notes Sent",
      value: isMessagesLoading ? "…" : messages.length.toLocaleString(),
      subtitle: lastMessageTimeAgo
        ? `Latest from ${lastMessage?.sender || "Anonymous"} ${lastMessageTimeAgo}`
        : "Send your first heartfelt note",
      color: "text-blue-500"
    },
    {
      icon: List,
      label: "Bucket List Progress",
      value: isTodosLoading ? "…" : `${todoProgress}%`,
      subtitle: todos.length
        ? `${completedTodos}/${todos.length} adventures completed`
        : "Add your next together plan",
      color: "text-emerald-500"
    },
    {
      icon: Calendar,
      label: "Days Since First Note",
      value: daysSinceFirstMessage !== null ? daysSinceFirstMessage.toString() : "—",
      subtitle: earliestMessage?.createdAt
        ? `Love streak since ${format(new Date(earliestMessage.createdAt), "PPP")}`
        : "Let's start counting today",
      color: "text-rose-500"
    },
    {
      icon: Plane,
      label: "Next Reunion",
      value: isFlightLoading
        ? "…"
        : nextFlight
          ? flightInProgress
            ? "In the air"
            : flightHasLanded
              ? "Landed"
              : arrivalDistance
          : "No flight",
      subtitle: nextFlight
        ? flightHasLanded
          ? `${arrivalCity || "Destination"} arrival ${arrivalCountdown}`
          : `${arrivalCity || "Destination"} arrival ${arrivalCountdown}`
        : "Plan the next getaway",
      color: "text-sky-500"
    },
    {
      icon: Heart,
      label: "Shared Adventures Ahead",
      value: isTodosLoading ? "…" : openTodos.toString(),
      subtitle: favoriteOpenCategory ? `Up next: ${favoriteOpenCategory}` : "You're all caught up!",
      color: "text-pink-500"
    },
    {
      icon: Clock,
      label: "Latest Love Note",
      value: lastMessageTimeAgo ?? "—",
      subtitle: lastMessagePreview ?? "No messages yet—send one now!",
      color: "text-amber-500"
    }
  ];

  const staticMilestones: Milestone[] = [
    { date: "First Message", description: "When it all began", emoji: "💬" },
    { date: "First Video Call", description: "Seeing your smile for the first time", emoji: "📹" },
    { date: "First 'I Love You'", description: "The words that changed everything", emoji: "💕" },
    { date: "First Visit", description: "Finally in each other's arms", emoji: "🤗" },
    { date: "Moving In Together", description: "Making it official", emoji: "🏠" },
  ];

  const timelineMilestones: Milestone[] = [
    nextFlight
      ? {
          date: format(new Date(nextFlight.departureAt), "PPP"),
          description: `Next flight: ${flightRoute}`,
          emoji: "✈️"
        }
      : null,
    lastMessage
      ? {
          date: lastMessageTimeAgo ?? "Just now",
          description: `Last note from ${lastMessage.sender || "Anonymous"}`,
          emoji: "💌"
        }
      : null,
    daysSinceFirstMessage !== null
      ? {
          date: `${daysSinceFirstMessage} days of notes`,
          description: "Time since our very first message",
          emoji: "📆"
        }
      : null,
    ...staticMilestones
  ].filter(Boolean) as Milestone[];

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
          {timelineMilestones.map((milestone, index) => (
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

      {lastMessage && (
        <div className="love-card">
          <h3 className="text-2xl font-playfair font-semibold text-rose-600 mb-4 text-center">
            Latest Love Note
          </h3>
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-wide text-rose-400">{lastMessage.sender || "Anonymous"}</p>
            <p className="text-gray-600 font-inter leading-relaxed">{lastMessage.message}</p>
            {lastMessageTimeAgo && (
              <p className="text-xs text-gray-400">Shared {lastMessageTimeAgo}</p>
            )}
          </div>
        </div>
      )}

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

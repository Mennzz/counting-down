import { useMemo } from "react";
import { differenceInDays, format, formatDistanceToNow, formatDistanceToNowStrict } from "date-fns";
import type { LucideIcon } from "lucide-react";
import { Calendar, Clock, Gift, Heart, List, MessageSquare, Plane } from "lucide-react";

import { useMessages } from "@/hooks/use-messages";
import { useTodos } from "@/hooks/use-todos";
import { useNextFlight } from "@/hooks/use-flights";
import { getFlightInProgress } from "@/utils/flight";
import { useAdventEntries } from "@/hooks/use-advent-entries";
import { useAdventOpenedDays } from "@/hooks/use-advent-opened-days";
import type { Message } from "@/types/message";

export interface RelationshipStatCard {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle: string;
  color: string;
}

export interface TimelineMilestone {
  date: string;
  description: string;
  emoji: string;
}

interface RelationshipStatsState {
  stats: RelationshipStatCard[];
  timelineMilestones: TimelineMilestone[];
  lastMessage: Message | undefined;
  lastMessageTimeAgo: string | null;
}

const MET_DATE = new Date("2024-12-05");
const DATING_DATE = new Date("2025-07-10");

export const useRelationshipStats = (): RelationshipStatsState => {
  const { data: messages = [], isLoading: isMessagesLoading } = useMessages();
  const { data: todos = [], isLoading: isTodosLoading } = useTodos();
  const { data: nextFlight, isLoading: isFlightLoading } = useNextFlight();
  const { openedDays } = useAdventOpenedDays();
  const { advents } = useAdventEntries("by-me");

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

  const daysSinceMet = differenceInDays(new Date(), MET_DATE);
  const daysSinceDating = differenceInDays(new Date(), DATING_DATE);

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

  const giftsOpened = openedDays.size;
  const giftsUploaded = advents.length;
  const giftProgress = Math.round((giftsOpened / 25) * 100);

  const stats: RelationshipStatCard[] = [
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
      icon: Heart,
      label: "Days Since We Met",
      value: daysSinceMet >= 0 ? daysSinceMet.toString() : "0",
      subtitle: `First hello on ${format(MET_DATE, "PPP")}`,
      color: "text-fuchsia-500"
    },
    {
      icon: Calendar,
      label: "Days Dating",
      value: daysSinceDating >= 0 ? daysSinceDating.toString() : "0",
      subtitle: `Official since ${format(DATING_DATE, "PPP")}`,
      color: "text-purple-500"
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
              : arrivalDistance || "—"
          : "No flight",
      subtitle: nextFlight
        ? `${arrivalCity || "Destination"} arrival ${arrivalCountdown}`
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
    },
    {
      icon: Gift,
      label: "Advent Surprises",
      value: `${giftsOpened}/25 opened`,
      subtitle: giftsUploaded
        ? `${giftsUploaded} gifts uploaded with love`
        : giftProgress
          ? `${giftProgress}% unwrapped`
          : "Start unlocking the magic",
      color: "text-red-500"
    }
  ];

  const staticMilestones: TimelineMilestone[] = [
    { date: "First Message", description: "When it all began", emoji: "💬" },
    { date: "First Video Call", description: "Seeing your smile for the first time", emoji: "📹" },
    { date: "First 'I Love You'", description: "The words that changed everything", emoji: "💕" },
    { date: "First Visit", description: "Finally in each other's arms", emoji: "🤗" },
    { date: "Moving In Together", description: "Making it official", emoji: "🏠" },
  ];

  const timelineMilestones: TimelineMilestone[] = [
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
  ].filter(Boolean) as TimelineMilestone[];

  return {
    stats,
    timelineMilestones,
    lastMessage,
    lastMessageTimeAgo,
  };
};

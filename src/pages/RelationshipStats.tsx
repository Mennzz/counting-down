import { Heart } from "lucide-react";

import { LatestMessageCard } from "./relationship-stats/LatestMessageCard";
import { StatsGrid } from "./relationship-stats/StatsGrid";
import { Timeline } from "./relationship-stats/Timeline";
import { useRelationshipStats } from "./relationship-stats/useRelationshipStats";

const RelationshipStats = () => {
  const { stats, timelineMilestones, lastMessage, lastMessageTimeAgo } = useRelationshipStats();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="h-6 w-6 animate-heart-beat text-rose-500" />
          <h2 className="text-4xl font-playfair font-semibold text-rose-600">Our Love by the Numbers</h2>
          <Heart className="h-6 w-6 animate-heart-beat text-rose-500" />
        </div>
        <p className="text-lg font-inter text-gray-600">
          Every number tells a piece of our story
        </p>
      </div>

      <StatsGrid stats={stats} />

      <Timeline milestones={timelineMilestones} />

      {lastMessage && (
        <LatestMessageCard
          sender={lastMessage.sender || "Anonymous"}
          message={lastMessage.message}
          timeAgo={lastMessageTimeAgo}
        />
      )}

      <div className="text-center">
        <div className="love-card inline-block">
          <Heart className="mx-auto mb-2 h-6 w-6 animate-heart-beat text-rose-500" />
          <p className="font-inter italic text-gray-600">
            "Love doesn't count days, it makes every day count."
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelationshipStats;

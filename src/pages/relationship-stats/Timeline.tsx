import type { TimelineMilestone } from "./useRelationshipStats";

interface TimelineProps {
  milestones: TimelineMilestone[];
}

export const Timeline = ({ milestones }: TimelineProps) => (
  <div className="love-card">
    <h3 className="mb-6 text-center text-2xl font-playfair font-semibold text-rose-600">
      Our Journey Together
    </h3>
    <div className="space-y-4">
      {milestones.map((milestone, index) => (
        <div key={`${milestone.date}-${index}`} className="flex items-center space-x-4 rounded-xl bg-rose-50 p-4">
          <div className="text-2xl">{milestone.emoji}</div>
          <div className="flex-1">
            <div className="font-inter font-medium text-gray-800">
              {milestone.date}
            </div>
            <div className="text-sm text-gray-600">
              {milestone.description}
            </div>
          </div>
          <div className="h-3 w-3 rounded-full bg-rose-400" />
        </div>
      ))}
    </div>
  </div>
);

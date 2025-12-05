import type { RelationshipStatCard } from "./useRelationshipStats";

interface StatsGridProps {
  stats: RelationshipStatCard[];
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map(({ icon: Icon, label, value, subtitle, color }, index) => (
        <div key={`${label}-${index}`} className="love-card text-center">
          <Icon className={`mx-auto mb-4 h-8 w-8 ${color}`} />
          <div className="mb-2 text-3xl font-playfair font-bold text-gray-800">
            {value}
          </div>
          <div className="mb-1 text-lg font-medium text-gray-700">
            {label}
          </div>
          <div className="text-sm text-gray-500 font-inter">
            {subtitle}
          </div>
        </div>
      ))}
    </div>
  );
};

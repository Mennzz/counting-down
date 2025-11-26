import { Heart } from "lucide-react";
import { FC } from "react";

interface AdventProgressProps {
  openedCount: number;
  totalCount: number;
  progressPercent: number;
  isDecember: boolean;
  nextLockedDay: number | null;
}

const AdventProgress: FC<AdventProgressProps> = ({
  openedCount,
  totalCount,
  progressPercent,
  isDecember,
  nextLockedDay,
}) => {
  return (
    <div className="love-card flex flex-col md:flex-row items-center md:items-start md:justify-between gap-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
          <Heart className="w-8 h-8 text-white animate-heart-beat" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Opened surprises</p>
          <p className="text-2xl font-semibold text-gray-800">
            {openedCount} / {totalCount}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full md:w-auto">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-3 bg-rose-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {isDecember
            ? nextLockedDay
              ? `Next gift unlocks on Dec ${nextLockedDay}`
              : "Everything is unlocked - enjoy them all!"
            : "Open any card early; December rules don't apply yet."}
        </p>
      </div>
    </div>
  );
};

export default AdventProgress;

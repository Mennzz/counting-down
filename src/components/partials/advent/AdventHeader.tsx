import { Calendar } from "lucide-react";
import { FC } from "react";

const AdventHeader: FC = () => {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Calendar className="w-6 h-6 text-rose-500" />
        <h2 className="text-4xl font-playfair font-semibold text-rose-600">Advent of Us</h2>
        <Calendar className="w-6 h-6 text-rose-500" />
      </div>
      <p className="text-lg text-gray-600 font-inter">
        A cozy little countdown of love, surprises, and together moments
      </p>
    </div>
  );
};

export default AdventHeader;

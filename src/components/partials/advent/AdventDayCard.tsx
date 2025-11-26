import { FC } from "react";
import { Gift, Lock, Unlock, Image as ImageIcon, Star } from "lucide-react";
import { AdventDay, typeStyles } from "@/types/advent";

interface AdventDayCardProps {
  entry: AdventDay;
  opened: boolean;
  available: boolean;
  cardKey: string;
  onOpen: (key: string, available: boolean) => void;
}

const AdventDayCard: FC<AdventDayCardProps> = ({ entry, opened, available, cardKey, onOpen }) => {
  return (
    <div
      key={cardKey}
      className={`love-card relative overflow-hidden ${opened ? "ring-2 ring-rose-200" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold">
            {entry.day}
          </div>
          <div>
            <p className="text-sm text-gray-500">Day {entry.day}</p>
            <p className="font-medium text-gray-800">{entry.title}</p>
            {entry.actor && <p className="text-xs text-gray-500">From {entry.actor}</p>}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${typeStyles[entry.type]}`}>
          {entry.type}
        </div>
      </div>

      <p className={`font-inter text-gray-600 mb-4 ${!opened ? "line-clamp-2" : ""}`}>{entry.description}</p>

      {opened && entry.imageData && (
        <div className="mb-4 overflow-hidden rounded-xl border border-rose-100">
          <img src={entry.imageData} alt={entry.title} className="w-full h-48 object-cover" />
        </div>
      )}

      {!opened && entry.imageData && (
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <ImageIcon className="w-4 h-4 mr-2 text-rose-400" />
          <span>Secret image attached</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          {opened ? (
            <>
              <Unlock className="w-4 h-4 text-emerald-500" />
              <span>Opened</span>
            </>
          ) : available ? (
            <>
              <Gift className="w-4 h-4 text-rose-500" />
              <span>Ready to open</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-gray-400" />
              <span>Opens on Dec {entry.day}</span>
            </>
          )}
        </div>
        <button
          onClick={() => onOpen(cardKey, available)}
          disabled={!available}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            opened
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
              : available
              ? "bg-rose-500 text-white hover:bg-rose-600 shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {opened ? "Reopen" : "Open"}
        </button>
      </div>

      {!opened && (
        <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center rotate-12">
          <Star className="w-6 h-6 text-rose-200" />
        </div>
      )}
      {opened && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-rose-50/60 via-transparent to-amber-50/60" />
      )}
    </div>
  );
};

export default AdventDayCard;

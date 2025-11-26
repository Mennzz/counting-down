import { FC, useMemo } from "react";
import AdventDayCard from "./AdventDayCard";
import { AdventDay } from "@/types/advent";

interface AdventGridProps {
  items: AdventDay[];
  openedKeys: string[];
  isDecember: boolean;
  currentDay: number;
  onOpen: (key: string, available: boolean) => void;
}

const AdventGrid: FC<AdventGridProps> = ({ items, openedKeys, isDecember, currentDay, onOpen }) => {
  const sortedItems = useMemo(() => [...items].sort((a, b) => a.day - b.day), [items]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedItems.map((entry) => {
        const cardKey = `${entry.day}-${entry.title}`;
        const available = !isDecember || entry.day <= currentDay;
        const opened = openedKeys.includes(cardKey);
        return (
          <AdventDayCard
            key={cardKey}
            entry={entry}
            opened={opened}
            available={available}
            cardKey={cardKey}
            onOpen={onOpen}
          />
        );
      })}
    </div>
  );
};

export default AdventGrid;

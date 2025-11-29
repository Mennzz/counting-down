interface LatestMessageCardProps {
  sender: string;
  message: string;
  timeAgo: string | null;
}

export const LatestMessageCard = ({ sender, message, timeAgo }: LatestMessageCardProps) => (
  <div className="love-card">
    <h3 className="mb-4 text-center text-2xl font-playfair font-semibold text-rose-600">
      Latest Love Note
    </h3>
    <div className="space-y-2 text-center">
      <p className="text-sm uppercase tracking-wide text-rose-400">{sender}</p>
      <p className="font-inter leading-relaxed text-gray-600">{message}</p>
      {timeAgo && <p className="text-xs text-gray-400">Shared {timeAgo}</p>}
    </div>
  </div>
);

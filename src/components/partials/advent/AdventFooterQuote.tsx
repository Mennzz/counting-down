import { Sparkles } from "lucide-react";
import { FC } from "react";

const AdventFooterQuote: FC = () => (
  <div className="text-center">
    <div className="love-card inline-block">
      <Sparkles className="w-6 h-6 text-rose-500 mx-auto mb-2" />
      <p className="text-gray-600 font-inter italic">
        Tiny rituals now, big celebrations soon. Each day is a step closer to you.
      </p>
    </div>
  </div>
);

export default AdventFooterQuote;

import { useEffect, useState } from "react";

import { getAdventCountByMe } from "@/services/advent";

export const useAdventCount = () => {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getAdventCountByMe()
      .then((n) => { if (!cancelled) { setCount(n); setIsLoading(false); } })
      .catch(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { count, isLoading };
};

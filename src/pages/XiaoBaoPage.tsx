import { Minimize2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { XiaoBaoChat } from "@/components/xiaobao/XiaoBaoChat";

export default function XiaoBaoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = (location.state as { xiaoBaoReturnTo?: string } | null)?.xiaobaoReturnTo;

  return (
    <main className="min-h-screen bg-rose-50/40 p-0 sm:p-6">
      <div className="mx-auto h-[100dvh] max-w-5xl sm:h-[calc(100dvh-3rem)]">
        <XiaoBaoChat
          roomy
          headerAction={(
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Exit roomy Xiao Bao"
              onClick={() => navigate(returnTo || "/")}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          )}
        />
      </div>
    </main>
  );
}

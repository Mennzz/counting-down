import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { XiaoBaoChat } from "@/components/xiaobao/XiaoBaoChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useXiaoBao } from "@/hooks/use-xiaobao";

export default function XiaoBaoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setIsOpen } = useXiaoBao();
  const requestedReturnTo = (location.state as { xiaoBaoReturnTo?: string } | null)?.xiaoBaoReturnTo;
  const returnTo = requestedReturnTo?.startsWith("/")
    && !requestedReturnTo.startsWith("//")
    && !/^\/xiaobao\/?$/.test(requestedReturnTo)
    ? requestedReturnTo
    : "/";

  useEffect(() => {
    if (!isMobile) return;
    setIsOpen(true);
    navigate(returnTo, { replace: true });
  }, [isMobile, navigate, returnTo, setIsOpen]);

  if (isMobile) return null;

  return (
    <main className="hidden h-[100dvh] overflow-hidden bg-rose-50/40 p-0 md:block md:p-6">
      <div className="mx-auto flex h-full max-w-5xl flex-col gap-2 sm:gap-3">
        <nav aria-label="Xiao Bao full-screen navigation" className="shrink-0 px-2 pt-2 sm:px-0 sm:pt-0">
          <Button asChild variant="outline" size="sm" className="border-rose-200 bg-white text-rose-950 hover:bg-rose-50 hover:text-rose-950">
            <Link to={returnTo}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to BIBI Dairy
            </Link>
          </Button>
        </nav>
        <div className="min-h-0 flex-1">
          <XiaoBaoChat roomy />
        </div>
      </div>
    </main>
  );
}

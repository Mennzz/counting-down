import { useCallback, useEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useXiaoBao } from "@/hooks/use-xiaobao";
import { XiaoBaoChat } from "./XiaoBaoChat";
import { XiaoBaoMascot } from "./XiaoBaoMascot";

export const XIAOBAO_SLEEP_DELAY_MS = 120_000;

export function XiaoBaoLauncher() {
  const { isOpen, setIsOpen } = useXiaoBao();
  const location = useLocation();
  const [isSleeping, setIsSleeping] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isInteracting = isHovered || isFocused;

  const wake = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    setIsSleeping(false);
    if (!isOpen) {
      sleepTimerRef.current = setTimeout(() => setIsSleeping(true), XIAOBAO_SLEEP_DELAY_MS);
    }
  }, [isOpen]);

  useEffect(() => {
    wake();
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [wake]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            aria-label="Open Xiao Bao relationship assistant"
            onPointerEnter={() => {
              setIsHovered(true);
              wake();
            }}
            onPointerLeave={() => setIsHovered(false)}
            onFocus={() => {
              setIsFocused(true);
              wake();
            }}
            onBlur={() => setIsFocused(false)}
            onClick={() => {
              setIsHovered(false);
              setIsFocused(false);
              wake();
              setIsOpen(true);
            }}
            className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 h-16 w-16 overflow-visible rounded-full border border-rose-200 bg-rose-50 p-0 shadow-xl hover:bg-rose-100 focus-visible:ring-rose-500"
          >
            <XiaoBaoMascot
              state={isSleeping ? "sleep" : isInteracting ? "hello" : "idle"}
              size={58}
              variant="hero"
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Talk with Xiao Bao</TooltipContent>
      </Tooltip>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setIsHovered(false);
            setIsFocused(false);
            wake();
          }
        }}
      >
        <SheetContent side="right" className="h-[100dvh] w-screen max-w-none p-0 sm:w-[28rem] sm:max-w-[28rem]">
          <SheetTitle className="sr-only">Xiao Bao relationship assistant</SheetTitle>
          <SheetDescription className="sr-only">Chat with Xiao Bao and review suggested relationship actions.</SheetDescription>
          <XiaoBaoChat
            reserveCloseGutter
            headerAction={(
              <Button asChild variant="ghost" size="icon" aria-label="Expand Xiao Bao">
                <Link
                  to="/xiaobao"
                  state={{ xiaoBaoReturnTo: `${location.pathname}${location.search}${location.hash}` }}
                  onClick={() => setIsOpen(false)}
                >
                  <Expand className="h-4 w-4" />
                </Link>
              </Button>
            )}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

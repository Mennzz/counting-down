import type { ReactNode } from "react";
import { ArrowLeft, Bell, Inbox, MessageCircleHeart, Repeat2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { XiaoBaoMascot } from "./XiaoBaoMascot";

export function XiaoBaoSectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/80 via-white to-amber-50/40">
      <header className="border-b border-rose-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Button asChild variant="ghost" className="text-gray-600">
            <Link to="/xiaobao"><ArrowLeft className="mr-2 h-4 w-4" />Back to Xiao Bao</Link>
          </Button>
          {/* Phones: one row that scrolls sideways instead of running off the screen. */}
          <nav aria-label="Xiao Bao" className="-mx-1 flex w-full items-center gap-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:w-auto sm:overflow-visible sm:px-0 sm:pb-0">
            <Button asChild variant={location.pathname === "/xiaobao/routines" ? "secondary" : "ghost"} size="sm" className="shrink-0 px-2 sm:px-3">
              <Link to="/xiaobao/routines"><Repeat2 className="mr-2 h-4 w-4" /><span className="sm:hidden">Routines</span><span className="hidden sm:inline">Routines & reminders</span></Link>
            </Button>
            <Button asChild variant={location.pathname === "/xiaobao/inbox" ? "secondary" : "ghost"} size="sm" className="shrink-0 px-2 sm:px-3">
              <Link to="/xiaobao/inbox"><Inbox className="mr-2 h-4 w-4" />Inbox</Link>
            </Button>
            <Button asChild variant={location.pathname === "/xiaobao/notifications" ? "secondary" : "ghost"} size="sm" className="shrink-0 px-2 sm:px-3">
              <Link to="/xiaobao/notifications"><Bell className="mr-2 h-4 w-4" />Notifications</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="shrink-0 px-2 sm:px-3">
              <Link to="/xiaobao"><MessageCircleHeart className="mr-2 h-4 w-4" />Chat</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex items-center gap-4">
            <XiaoBaoMascot state="idle" size={64} />
            <div>
              <h1 className="text-3xl font-semibold text-rose-950 sm:text-4xl">{title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

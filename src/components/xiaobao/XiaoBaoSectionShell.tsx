import type { ReactNode } from "react";
import { ArrowLeft, Inbox, MessageCircleHeart, Repeat2 } from "lucide-react";
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
          <nav aria-label="Xiao Bao" className="flex items-center gap-1">
            <Button asChild variant={location.pathname === "/xiaobao/routines" ? "secondary" : "ghost"} size="sm">
              <Link to="/xiaobao/routines"><Repeat2 className="mr-2 h-4 w-4" />Routines & reminders</Link>
            </Button>
            <Button asChild variant={location.pathname === "/xiaobao/inbox" ? "secondary" : "ghost"} size="sm">
              <Link to="/xiaobao/inbox"><Inbox className="mr-2 h-4 w-4" />Inbox</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
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

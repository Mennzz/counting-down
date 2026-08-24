import { useMemo } from "react";
import { Check, Inbox, Loader2, Repeat2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { XiaoBaoMarkdown } from "@/components/xiaobao/XiaoBaoMarkdown";
import { XiaoBaoMascot } from "@/components/xiaobao/XiaoBaoMascot";
import { XiaoBaoSectionShell } from "@/components/xiaobao/XiaoBaoSectionShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMarkXiaoBaoInboxMessageRead,
  useXiaoBaoInbox,
  useXiaoBaoRoutines,
} from "@/hooks/use-xiaobao-routines";

export default function XiaoBaoInboxPage() {
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get("routineId") || undefined;
  const inbox = useXiaoBaoInbox(routineId);
  const routines = useXiaoBaoRoutines();
  const markRead = useMarkXiaoBaoInboxMessageRead();
  const pages = inbox.data?.pages;
  const messages = useMemo(() => {
    const byId = new Map((pages ?? []).flatMap((page) => page.messages).map((message) => [message.id, message]));
    return [...byId.values()];
  }, [pages]);
  const routineNames = useMemo(
    () => new Map((routines.data ?? []).map((routine) => [routine.id, routine.name])),
    [routines.data],
  );
  const selectedRoutineName = routineId ? routineNames.get(routineId) : undefined;
  const globalUnreadCount = pages?.[0]?.unreadCount ?? 0;

  return (
    <XiaoBaoSectionShell
      title="Your Xiao Bao inbox"
      description={routineId
        ? `Private messages from ${selectedRoutineName ? `“${selectedRoutineName}”` : "this routine or reminder"}. Only you can see them.`
        : "Private messages from your routines and reminders. Only you can see them."}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {globalUnreadCount
            ? `${globalUnreadCount} unread message${globalUnreadCount === 1 ? "" : "s"} across your Xiao Bao inbox`
            : "You’re all caught up."}
        </p>
        <div className="flex flex-wrap gap-2">
          {routineId && <Button asChild variant="outline"><Link to="/xiaobao/inbox"><Inbox className="mr-2 h-4 w-4" />Show all messages</Link></Button>}
          <Button asChild variant="outline"><Link to="/xiaobao/routines"><Repeat2 className="mr-2 h-4 w-4" />Manage routines & reminders</Link></Button>
        </div>
      </div>

      {inbox.isLoading ? (
        <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
      ) : inbox.isError ? (
        <Card className="border-red-200 bg-red-50"><CardContent className="p-6 text-sm text-red-800">{inbox.error.message || (routineId ? "This routine or reminder inbox could not load." : "Your Xiao Bao inbox could not load.")}</CardContent></Card>
      ) : messages.length ? (
        <div className="space-y-4" aria-live="polite">
          {messages.map((message) => {
            const isUnread = !message.readAt;
            const routineName = routineNames.get(message.routineId);
            return (
              <Card key={message.id} className={isUnread ? "border-rose-200 bg-rose-50/60 shadow-sm" : "border-slate-100 bg-white/80"}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <XiaoBaoMascot state={isUnread ? "hello" : "idle"} size={46} animated={false} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-rose-950">A little idea from Xiao Bao</p>
                          {isUnread && <Badge className="bg-rose-600">New</Badge>}
                        </div>
                        <time className="text-xs text-muted-foreground" dateTime={message.createdAt}>
                          {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.createdAt))}
                        </time>
                      </div>
                      <Link
                        to={`/xiaobao/inbox?routineId=${encodeURIComponent(message.routineId)}`}
                        className="mt-1 inline-block text-xs font-medium text-rose-700 underline-offset-2 hover:underline"
                      >
                        {routineName ?? "View this routine or reminder’s messages"}
                      </Link>
                      <div className="mt-3 text-sm text-slate-800"><XiaoBaoMarkdown content={message.content} /></div>
                      {isUnread && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-3"
                          disabled={markRead.isPending}
                          onClick={() => markRead.mutate(message.id)}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {inbox.hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                disabled={inbox.isFetchingNextPage}
                onClick={() => void inbox.fetchNextPage()}
              >
                {inbox.isFetchingNextPage && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {inbox.isFetchingNextPage ? "Loading…" : "Load older messages"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="border-dashed border-rose-200 bg-white/70">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <Inbox className="h-10 w-10 text-rose-400" />
            <h2 className="mt-3 text-lg font-semibold text-rose-950">{routineId ? "No messages from this routine or reminder yet" : "Your inbox is waiting"}</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{routineId ? "When this routine or reminder is ready, it will appear here privately." : "When a routine or reminder is ready, it will appear here privately."}</p>
            <Button asChild className="mt-5"><Link to="/xiaobao/routines">Set a reminder</Link></Button>
          </CardContent>
        </Card>
      )}
    </XiaoBaoSectionShell>
  );
}

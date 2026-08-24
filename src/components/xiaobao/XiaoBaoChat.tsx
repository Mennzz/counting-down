import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { ArrowUp, History, Inbox, Loader2, Plus, RefreshCw, Repeat2, Square, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useXiaoBao } from "@/hooks/use-xiaobao";
import type { XiaoBaoMessage } from "@/types/xiaobao";
import { XiaoBaoMarkdown } from "./XiaoBaoMarkdown";
import { XiaoBaoMascot, type XiaoBaoMascotState } from "./XiaoBaoMascot";
import { XiaoBaoProposalCard } from "./XiaoBaoProposalCard";
import { XIAOBAO_STARTER_PROMPTS } from "./xiaobao-config";

export function XiaoBaoChat({
  roomy = false,
  headerAction,
  reserveCloseGutter = false,
}: {
  roomy?: boolean;
  headerAction?: ReactNode;
  reserveCloseGutter?: boolean;
}) {
  const xiaoBao = useXiaoBao();
  const [draft, setDraft] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [headerHello, setHeaderHello] = useState(false);
  const messages = useMemo(() => xiaoBao.detail?.messages ?? [], [xiaoBao.detail?.messages]);
  const latestAssistantId = useMemo(
    () => messages.findLast((message) => message.role === "ASSISTANT")?.id,
    [messages],
  );

  useEffect(() => {
    if (!roomy && !xiaoBao.isOpen) return;
    setHeaderHello(true);
    const timer = setTimeout(() => setHeaderHello(false), 900);
    return () => clearTimeout(timer);
  }, [roomy, xiaoBao.isOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: xiaoBao.isStreaming ? "auto" : "smooth" });
  }, [messages, xiaoBao.isStreaming]);

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || xiaoBao.isStreaming) return;
    setDraft("");
    await xiaoBao.sendMessage(content);
  };

  const proposalsFor = (message: XiaoBaoMessage) =>
    (xiaoBao.detail?.proposals ?? []).filter((proposal) => proposal.messageId === message.id);

  const mascotStateFor = (message: XiaoBaoMessage): XiaoBaoMascotState => {
    if (message.status === "GENERATING") return "thinking";
    if (message.status === "FAILED" || message.status === "CANCELLED") return "concerned";
    if (message.mascotMood === "LOVE") return "love";
    if (message.mascotMood === "CONCERNED") return "concerned";
    return "idle";
  };

  const headerMascotState: XiaoBaoMascotState = xiaoBao.isStreaming
    ? "thinking"
    : headerHello
      ? "hello"
      : "idle";

  return (
    <div className={`flex h-full min-h-0 flex-col bg-gradient-to-b from-rose-50/70 to-background ${roomy ? "rounded-3xl border shadow-sm" : ""}`}>
      <header
        className={`flex items-center justify-between gap-3 border-b bg-background/90 px-4 py-3 ${reserveCloseGutter ? "pr-12" : ""}`}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <XiaoBaoMascot
            state={headerMascotState}
            size={38}
            animated={headerMascotState !== "idle"}
          />
          <div className="min-w-0">
            <h1 className="font-semibold text-rose-950">Xiao Bao</h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="Xiao Bao routines and reminders">
            <Link to="/xiaobao/routines" onClick={() => xiaoBao.setIsOpen(false)}><Repeat2 className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Xiao Bao inbox">
            <Link to="/xiaobao/inbox" onClick={() => xiaoBao.setIsOpen(false)}><Inbox className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Conversation history" onClick={() => setShowHistory((value) => !value)}>
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="New Xiao Bao chat" onClick={() => void xiaoBao.startNewChat()}>
            <Plus className="h-4 w-4" />
          </Button>
          {headerAction}
          {xiaobaoDeleteButton(xiaoBao.activeConversationId, xiaoBao.deleteConversation)}
        </div>
      </header>

      {showHistory && (
        <div className="xiaobao-history-enter max-h-52 overflow-y-auto border-b bg-background p-2">
          {xiaoBao.conversations.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">No earlier chats yet.</p>
          ) : xiaoBao.conversations.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-rose-50 ${conversation.id === xiaoBao.activeConversationId ? "bg-rose-100 font-medium" : ""}`}
              onClick={() => { xiaoBao.selectConversation(conversation.id); setShowHistory(false); }}
            >
              <span className="block truncate">{conversation.title}</span>
              <span className="text-xs text-muted-foreground">{new Date(conversation.updatedAt).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        <div className={`mx-auto space-y-4 p-4 ${roomy ? "max-w-3xl py-8" : "max-w-xl"}`} aria-live="polite">
          {!xiaoBao.isLoading && messages.length === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 py-8 duration-500 text-center">
              <XiaoBaoMascot
                state="hello"
                size={104}
                className="mx-auto drop-shadow-sm"
                decorative={false}
                label="Xiao Bao says hello"
              />
              <h2 className="mt-4 font-semibold text-rose-950">What’s on your mind?</h2>
              <p className="mt-1 text-sm text-muted-foreground">I can help you reflect, phrase an idea, or plan a little moment together.</p>
              <div className="mt-5 grid gap-2 text-left sm:grid-cols-2">
                {XIAOBAO_STARTER_PROMPTS.slice(0, 4).map((prompt, index) => (
                  <button
                    key={prompt}
                    type="button"
                    className="xiaobao-card-enter rounded-xl border bg-white p-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:shadow-sm active:translate-y-0 active:scale-[0.99]"
                    style={{ animationDelay: `${index * 55}ms` }}
                    onClick={() => setDraft(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          {xiaoBao.isLoading && <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin" /></div>}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${message.role === "USER" ? "xiaobao-message-user-enter ml-auto max-w-[85%]" : "xiaobao-message-assistant-enter mr-auto max-w-[92%]"}`}
            >
              <div className={message.role === "ASSISTANT" && message.id === latestAssistantId ? "flex items-end gap-2" : ""}>
                {message.role === "ASSISTANT" && message.id === latestAssistantId && (
                  <XiaoBaoMascot
                    state={mascotStateFor(message)}
                    size={42}
                    animated={
                      message.status === "GENERATING" ||
                      (xiaoBao.liveMessageId === message.id && mascotStateFor(message) !== "idle")
                    }
                    className="mb-0.5 shrink-0"
                  />
                )}
                <div
                  className={message.role === "USER"
                    ? "rounded-2xl rounded-br-sm bg-rose-600 px-4 py-3 text-sm text-white shadow-sm"
                    : `min-w-0 flex-1 rounded-2xl rounded-bl-sm border bg-white px-4 py-3 text-sm text-slate-800 shadow-sm ${message.status === "COMPLETE" ? "xiaobao-assistant-complete" : ""}`}
                >
                {message.content ? (
                  message.role === "ASSISTANT" ? (
                    <XiaoBaoMarkdown
                      content={message.content}
                      streaming={message.status === "GENERATING"}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )
                ) : message.status === "GENERATING" ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="sr-only">Xiao Bao is thinking…</span>
                    <span aria-hidden className="flex h-5 items-center gap-1">
                      {[0, 1, 2].map((index) => (
                        <span
                          key={index}
                          className="xiaobao-thinking-dot h-1.5 w-1.5 rounded-full bg-rose-400"
                          style={{ animationDelay: `${index * 140}ms` }}
                        />
                      ))}
                    </span>
                    <span aria-hidden>Xiao Bao is thinking…</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">No response was saved.</span>
                )}
                {message.status === "FAILED" || message.status === "CANCELLED" ? (
                  <Button size="sm" variant="ghost" className="mt-2" disabled={xiaoBao.isStreaming} onClick={() => void xiaoBao.retry(message)}>
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> Try again
                  </Button>
                ) : null}
                </div>
              </div>
              {message.contextReferences.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Relationship context used">
                  {message.contextReferences.map((reference, index) => (
                    reference.type === "MEDIATION_SESSION" ? (
                      <Link
                        key={reference.key}
                        to={`/mediation/${reference.id}`}
                        className="xiaobao-card-enter rounded-full border bg-background px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-rose-300 hover:text-rose-800"
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        {reference.title}
                      </Link>
                    ) : (
                      <span
                        key={reference.key}
                        className="xiaobao-card-enter rounded-full border bg-background px-2 py-1 text-[11px] text-muted-foreground"
                        style={{ animationDelay: `${index * 45}ms` }}
                      >
                        {reference.title}
                      </span>
                    )
                  ))}
                </div>
              )}
              {proposalsFor(message).map((proposal) => <XiaoBaoProposalCard key={proposal.id} proposal={proposal} />)}
              {message.completedActions.map((action) => (
                <div key={`${action.type}-${action.entityId}`} className="xiaobao-card-enter mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
                  <XiaoBaoMascot
                    state="success"
                    size={30}
                    animated={xiaoBao.liveMessageId === message.id}
                  />
                  <p>{action.type === "TOGETHER_LIST_ITEM_ALREADY_PRESENT" ? "Already on your list:" : "Added"} “{action.title}”</p>
                </div>
              ))}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      <form onSubmit={(event) => void send(event)} className="border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className={`mx-auto flex items-end gap-2 ${roomy ? "max-w-3xl" : "max-w-xl"}`}>
          <Textarea
            aria-label="Message Xiao Bao"
            placeholder="Ask Xiao Bao…"
            className="min-h-11 max-h-32 resize-none"
            value={draft}
            disabled={xiaoBao.isStreaming}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
          />
          {xiaoBao.isStreaming ? (
            <Button type="button" size="icon" variant="outline" aria-label="Cancel Xiao Bao response" className="animate-in zoom-in-90 duration-200" onClick={xiaoBao.cancel}><Square className="h-4 w-4" /></Button>
          ) : (
            <Button type="submit" size="icon" aria-label="Send message" className="group transition-transform active:scale-90" disabled={!draft.trim()}><ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" /></Button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Xiao Bao can make mistakes. Important choices belong to both of you.{" "}
          <Link className="underline underline-offset-2 hover:text-rose-700" to="/relationship-context" onClick={() => xiaoBao.setIsOpen(false)}>Relationship settings.</Link>
        </p>
      </form>
    </div>
  );
}

function xiaobaoDeleteButton(id: string | undefined, remove: (id: string) => Promise<void>) {
  if (!id) return null;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" aria-label="Delete conversation"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this Xiao Bao chat?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes the conversation, its messages, proposals, and recovery checkpoints.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep chat</AlertDialogCancel>
          <AlertDialogAction onClick={() => void remove(id)}>Delete chat</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

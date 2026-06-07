import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateMediationComment,
  useCreateMediationReply,
  useMediationAdvice,
  useMediationComments,
  useMediationSession,
} from "@/hooks/use-mediation";
import type {
  AIOutputStatus,
  MediationAdviceTask,
  MediationComment,
  SharedMediationAdviceOutput,
} from "@/types/mediation";
import { MediationPageShell, SessionStateNotice } from "./MediationShared";
import { canDiscuss, isAdviceAvailable, isSessionReadOnly } from "./mediation-ui";

const cleanAdviceListItem = (item: unknown): string | null => {
  if (typeof item !== "string") return null;

  const trimmed = item.trim();

  if (!trimmed) return null;
  if (/^(tasks_for_joris|tasks_for_danfeng|joint_task)['"]?\s*:/i.test(trimmed)) return null;
  if (/^(title|description)$/i.test(trimmed)) return null;
  if (/^[\s{[\]},:'"]+$/.test(trimmed)) return null;

  return trimmed.replace(/(?:["'“”]|â€œ|â€)?\],?$/u, "").trim();
};

const AdviceList = ({ items }: { items?: unknown[] | null }) => {
  const cleanItems = items?.map(cleanAdviceListItem).filter((item): item is string => Boolean(item)) ?? [];

  if (!cleanItems.length) return null;

  return (
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {cleanItems.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
};

const AdviceTaskList = ({ tasks }: { tasks?: MediationAdviceTask[] | null }) => {
  if (!tasks?.length) return null;

  return (
    <ul className="mt-2 list-disc space-y-2 pl-5">
      {tasks.map((task, index) => (
        <li key={`${task.title}-${index}`}>
          <span className="font-medium text-gray-800">{task.title}</span>
          {task.description ? <p className="mt-1 text-gray-700">{task.description}</p> : null}
        </li>
      ))}
    </ul>
  );
};

const AdviceTask = ({ task }: { task?: MediationAdviceTask | null }) => {
  if (!task) return null;

  return (
    <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50/60 p-4">
      <p className="font-medium text-gray-800">{task.title}</p>
      {task.description ? <p className="mt-1 text-gray-700">{task.description}</p> : null}
    </div>
  );
};

const AdviceSection = ({
  title,
  children,
  isVisible = true,
}: {
  title: string;
  children?: ReactNode;
  isVisible?: boolean;
}) => {
  if (!isVisible || !children) return null;

  return (
    <div>
      <h3 className="font-medium text-gray-800">{title}</h3>
      {children}
    </div>
  );
};

const SharedAdviceTitle = () => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
    <CardTitle className="text-gray-800">Shared advice</CardTitle>
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
      <Users className="h-3.5 w-3.5" aria-hidden="true" />
      Visible for everyone
    </span>
  </div>
);

const AdviceContent = ({
  advice,
  status,
  isLoading,
}: {
  advice?: SharedMediationAdviceOutput | null;
  status?: AIOutputStatus;
  isLoading?: boolean;
}) => {
  const effectiveStatus = status ?? advice?.status;

  if (isLoading || effectiveStatus === "PROCESSING") {
    return <p className="text-gray-600">Shared advice is being prepared...</p>;
  }

  if (effectiveStatus === "FAILED") {
    return <p className="text-gray-600">Shared advice could not be prepared. Please try again later.</p>;
  }

  if (effectiveStatus === "BLOCKED" || advice?.safety_status === "BLOCKED") {
    return <p className="text-gray-600">Shared advice is paused for safety.</p>;
  }

  if (!advice || effectiveStatus !== "AVAILABLE") {
    return <p className="text-gray-600">Shared advice will appear here once both perspectives are ready.</p>;
  }

  const conversationStarters = advice.conversation_starters?.length
    ? advice.conversation_starters
    : advice.suggested_conversation_script;
  const hasConversationStarters = Boolean(
    conversationStarters?.some((item) => cleanAdviceListItem(item))
  );

  return (
    <div className="space-y-4 text-gray-700">
      {advice.summary ?? advice.neutral_summary ? (
        <p className="whitespace-pre-wrap">{advice.summary ?? advice.neutral_summary}</p>
      ) : null}
      <AdviceSection title="Shared understanding">
        {advice.shared_understanding ? (
          <p className="mt-1 whitespace-pre-wrap">{advice.shared_understanding}</p>
        ) : null}
      </AdviceSection>
      <AdviceSection
        title="Joris may be feeling or needing"
        isVisible={Boolean(advice.joris_likely_feelings_and_needs?.length)}
      >
        <AdviceList items={advice.joris_likely_feelings_and_needs} />
      </AdviceSection>
      <AdviceSection
        title="Danfeng may be feeling or needing"
        isVisible={Boolean(advice.danfeng_likely_feelings_and_needs?.length)}
      >
        <AdviceList items={advice.danfeng_likely_feelings_and_needs} />
      </AdviceSection>
      <AdviceSection title="Shared conflict pattern">
        {advice.shared_conflict_pattern ? (
          <p className="mt-1 whitespace-pre-wrap">{advice.shared_conflict_pattern}</p>
        ) : null}
      </AdviceSection>
      <AdviceSection title="Points of agreement" isVisible={Boolean(advice.points_of_agreement?.length)}>
        <AdviceList items={advice.points_of_agreement} />
      </AdviceSection>
      <AdviceSection
        title="Points of misunderstanding"
        isVisible={Boolean(advice.points_of_misunderstanding?.length)}
      >
        <AdviceList items={advice.points_of_misunderstanding} />
      </AdviceSection>
      <AdviceSection title="Suggested next steps" isVisible={Boolean(advice.suggested_next_steps?.length)}>
        <AdviceList items={advice.suggested_next_steps} />
      </AdviceSection>
      <AdviceSection title="Conversation starters" isVisible={hasConversationStarters}>
        <AdviceList items={conversationStarters} />
      </AdviceSection>
      <AdviceSection title="Tasks for Joris" isVisible={Boolean(advice.tasks_for_joris?.length)}>
        <AdviceTaskList tasks={advice.tasks_for_joris} />
      </AdviceSection>
      <AdviceSection title="Tasks for Danfeng" isVisible={Boolean(advice.tasks_for_danfeng?.length)}>
        <AdviceTaskList tasks={advice.tasks_for_danfeng} />
      </AdviceSection>
      <AdviceSection title="Joint task" isVisible={Boolean(advice.joint_task)}>
        <AdviceTask task={advice.joint_task} />
      </AdviceSection>
      <AdviceSection title="What to avoid" isVisible={Boolean(advice.what_to_avoid?.length)}>
        <AdviceList items={advice.what_to_avoid} />
      </AdviceSection>
      {advice.content ? <p className="whitespace-pre-wrap">{advice.content}</p> : null}
    </div>
  );
};

const normalizeComments = (comments: MediationComment[]): MediationComment[] => {
  const commentsById = new Map<string, MediationComment>();
  const replyIdsByParentId = new Map<string, Set<string>>();
  const topLevelComments: MediationComment[] = [];

  comments.forEach((comment) => {
    const normalizedComment = { ...comment, replies: [...(comment.replies ?? [])] };

    commentsById.set(comment.id, normalizedComment);
    replyIdsByParentId.set(
      comment.id,
      new Set(normalizedComment.replies.map((replyComment) => replyComment.id))
    );
  });

  commentsById.forEach((comment) => {
    if (!comment.parent_comment_id) {
      topLevelComments.push(comment);
      return;
    }

    const parentComment = commentsById.get(comment.parent_comment_id);

    if (!parentComment) {
      topLevelComments.push(comment);
      return;
    }

    const parentReplyIds = replyIdsByParentId.get(parentComment.id) ?? new Set<string>();

    if (!parentReplyIds.has(comment.id)) {
      parentComment.replies = [...(parentComment.replies ?? []), comment];
      parentReplyIds.add(comment.id);
      replyIdsByParentId.set(parentComment.id, parentReplyIds);
    }
  });

  return topLevelComments;
};

const getCommentsUnavailableMessage = ({
  adviceReady,
  status,
  safetyStatus,
}: {
  adviceReady: boolean;
  status?: string;
  safetyStatus?: string;
}) => {
  if (safetyStatus === "BLOCKED") {
    return "Comments are paused while this mediation is blocked for safety.";
  }

  if (status === "RESOLVED") {
    return "This mediation is resolved, so comments are read-only.";
  }

  if (status === "ARCHIVED") {
    return "This session is archived, so comments are read-only.";
  }

  if (!adviceReady) {
    return "Comments open after shared advice is ready.";
  }

  return "Comments will open once the discussion is ready.";
};

const CommentCard = ({
  comment,
  sessionId,
  canReply,
}: {
  comment: MediationComment;
  sessionId: string;
  canReply: boolean;
}) => {
  const [reply, setReply] = useState("");
  const createReply = useCreateMediationReply(sessionId, comment.id);

  const handleReply = async (event: FormEvent) => {
    event.preventDefault();
    if (!reply.trim()) return;

    await createReply.mutateAsync({ content: reply.trim() });
    setReply("");
  };

  return (
    <Card className="bg-white/70">
      <CardContent className="space-y-4 p-5">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {comment.author_user_type ?? "Someone"} 
          </span>
          {/* Span with time */}
          <span className="text-xs text-gray-500 ml-2">
            {new Date(comment.created_at).toLocaleDateString(
              undefined,
              {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </span>
          <p className="mt-2 whitespace-pre-wrap text-gray-800">{comment.content}</p>
        </div>

        {comment.ai_reply ? (
          <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-rose-700">AI reply</p>
            <p className="mt-2 whitespace-pre-wrap text-gray-700">{comment.ai_reply}</p>
          </div>
        ) : comment.ai_reply_status === "PROCESSING" ? (
          <p className="text-sm text-gray-500">AI reply is being prepared...</p>
        ) : null}

        {comment.replies?.length ? (
          <div className="space-y-3 border-l border-rose-100 pl-4">
            {comment.replies.map((replyComment) => (
              <div key={replyComment.id} className="rounded-lg bg-white/80 p-3">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {replyComment.author_user_type ?? "Mediator"}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(replyComment.created_at).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{replyComment.content}</p>
              </div>
            ))}
          </div>
        ) : null}

        {canReply ? (
          <form onSubmit={handleReply} className="space-y-2">
            <Label htmlFor={`reply-${comment.id}`}>Reply</Label>
            <Textarea
              id={`reply-${comment.id}`}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={2}
              disabled={createReply.isPending}
            />
            <Button type="submit" size="sm" disabled={createReply.isPending || !reply.trim()}>
              {createReply.isPending ? "Posting..." : "Post reply"}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
};

export const MediationDiscussionPage = () => {
  const { sessionId = "" } = useParams();
  const { data: session, isLoading: isSessionLoading } = useMediationSession(sessionId);
  const [pollComments, setPollComments] = useState(false);
  const shouldFetchAdvice =
    Boolean(session) &&
    (isAdviceAvailable(session) ||
      session?.advice_status === "PROCESSING" ||
      session?.status === "AI_MEDIATION_PROCESSING" ||
      session?.status === "AI_ADVICE_AVAILABLE" ||
      session?.status === "DISCUSSION_OPEN");
  const adviceQuery = useMediationAdvice(sessionId, shouldFetchAdvice);
  const createComment = useCreateMediationComment(sessionId);
  const [comment, setComment] = useState("");

  const readOnly = isSessionReadOnly(session);
  const advice = adviceQuery.data?.advice ?? session?.shared_advice ?? session?.advice;
  const adviceStatus = adviceQuery.data?.status ?? session?.advice_status ?? advice?.status;
  const adviceReady = isAdviceAvailable(session) || adviceStatus === "AVAILABLE";
  const commentsOpen = Boolean(session) && adviceReady && canDiscuss(session?.status) && !readOnly;
  const commentsEnabled =
    Boolean(session) &&
    (adviceReady ||
      canDiscuss(session?.status) ||
      session?.status === "RESOLVED" ||
      session?.status === "ARCHIVED");
  const { data: comments = [], isLoading: isCommentsLoading } = useMediationComments(
    sessionId,
    commentsEnabled,
    pollComments
  );
  const normalizedComments = normalizeComments(comments);
  const commentsUnavailableMessage = getCommentsUnavailableMessage({
    adviceReady,
    status: session?.status,
    safetyStatus: session?.safety_status,
  });

  const handleComment = async (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;

    await createComment.mutateAsync({ content: comment.trim() });
    setComment("");
    setPollComments(true);
    window.setTimeout(() => setPollComments(false), 30_000);
  };

  if (isSessionLoading) {
    return (
      <MediationPageShell title="Discussion" backTo={`/mediation/${sessionId}`}>
        <Skeleton className="h-96 w-full" />
      </MediationPageShell>
    );
  }

  if (!session) {
    return (
      <MediationPageShell title="Discussion" backTo="/mediation">
        <Card>
          <CardContent className="p-6 text-red-700">Session not found.</CardContent>
        </Card>
      </MediationPageShell>
    );
  }

  return (
    <MediationPageShell title="Discussion" backTo={`/mediation/${sessionId}`}>
      <div className="space-y-6">
        <SessionStateNotice session={session} />

        <Card>
          <CardHeader>
            <SharedAdviceTitle />
          </CardHeader>
          <CardContent>
            <AdviceContent
              advice={advice}
              status={adviceStatus}
              isLoading={adviceQuery.isLoading && shouldFetchAdvice}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-gray-800">Comments</CardTitle>
            <Button asChild variant="outline">
              <Link to={`/mediation/${sessionId}`}>Session dashboard</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {!commentsOpen ? (
              <p className="rounded-lg border bg-white/70 p-4 text-sm text-gray-600">
                {commentsUnavailableMessage}
              </p>
            ) : (
              <form onSubmit={handleComment} className="space-y-3">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={3}
                  disabled={createComment.isPending}
                />
                <Button type="submit" disabled={createComment.isPending || !comment.trim()}>
                  {createComment.isPending ? "Posting..." : "Post comment"}
                </Button>
              </form>
            )}

            {isCommentsLoading ? <Skeleton className="h-24 w-full" /> : null}

            <div className="space-y-4">
              {normalizedComments.map((item) => (
                <CommentCard key={item.id} comment={item} sessionId={sessionId} canReply={commentsOpen} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MediationPageShell>
  );
};

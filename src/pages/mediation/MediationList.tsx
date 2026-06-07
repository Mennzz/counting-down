import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Circle, Clock, MessageCircleHeart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediationSessions } from "@/hooks/use-mediation";
import type { AIOutputStatus, MediationSessionListItem, MediationSessionStatus } from "@/types/mediation";
import { MediationPageShell, SafetyBadge, StatusBadge } from "./MediationShared";

const formatSessionDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getPerspectiveState = ({
  submitted,
  exists,
  draftLabel,
  sessionStatus,
}: {
  submitted?: boolean;
  exists?: boolean;
  draftLabel: string;
  sessionStatus: MediationSessionStatus;
}) => {
  if (sessionStatus !== "AWAITING_PERSPECTIVES" && submitted) {
    return { value: "Submitted", tone: "complete" as const };
  }

  if (exists) {
    return { value: draftLabel, tone: "draft" as const };
  }

  return { value: "Waiting", tone: "waiting" as const };
};

const getAdviceLabel = (session: MediationSessionListItem) => {
  if (session.has_advice || session.advice_status === "AVAILABLE") return "Available";
  if (session.advice_status === "PROCESSING") return "Preparing";
  if (session.advice_status === "FAILED") return "Needs retry";
  if (session.advice_status === "BLOCKED") return "Paused";

  return "Not ready";
};

const getAdviceTone = (status?: AIOutputStatus, hasAdvice?: boolean) => {
  if (hasAdvice || status === "AVAILABLE") return "complete";
  if (status === "PROCESSING") return "processing";
  if (status === "FAILED" || status === "BLOCKED") return "attention";

  return "waiting";
};

const stateStyles = {
  complete: {
    icon: CheckCircle2,
    className: "border-emerald-100 bg-emerald-50/80 text-emerald-800",
    iconClassName: "text-emerald-600",
  },
  processing: {
    icon: Clock,
    className: "border-amber-100 bg-amber-50/80 text-amber-800",
    iconClassName: "text-amber-600",
  },
  draft: {
    icon: Clock,
    className: "border-amber-100 bg-amber-50/80 text-amber-800",
    iconClassName: "text-amber-600",
  },
  waiting: {
    icon: Circle,
    className: "border-gray-100 bg-white/70 text-gray-600",
    iconClassName: "text-gray-400",
  },
  attention: {
    icon: Clock,
    className: "border-rose-100 bg-rose-50/80 text-rose-800",
    iconClassName: "text-rose-600",
  },
};

const SessionStateTile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: keyof typeof stateStyles;
}) => {
  const styles = stateStyles[tone];
  const Icon = styles.icon;

  return (
    <div className={`flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2.5 ${styles.className}`}>
      <Icon className={`h-4 w-4 shrink-0 ${styles.iconClassName}`} aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
};

const SessionCardSkeleton = () => (
  <Card className="border-rose-100 bg-white/75">
    <CardHeader className="space-y-4 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-3">
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </CardContent>
  </Card>
);

export const MediationList = () => {
  const { data: sessions = [], isLoading, isError, error } = useMediationSessions();
  const [showArchived, setShowArchived] = useState(false);

  const visibleSessions = showArchived
    ? sessions
    : sessions.filter((session) => session.status !== "ARCHIVED");
  const archivedCount = sessions.filter((session) => session.status === "ARCHIVED").length;

  return (
    <MediationPageShell
      title="Mediation"
      description="A quieter space for hard conversations, one step at a time."
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">
            {isLoading
              ? "Loading sessions"
              : `${visibleSessions.length} ${visibleSessions.length === 1 ? "session" : "sessions"}`}
          </p>
          <p className="mt-1 text-sm text-gray-500">Pick up where the conversation left off.</p>
        </div>
        <Button asChild className="bg-rose-500 hover:bg-rose-600">
          <Link to="/mediation/new">
            <Plus className="mr-2 h-4 w-4" />
            New session
          </Link>
        </Button>
      </div>

      {archivedCount > 0 ? (
        <div className="mb-5 flex items-center gap-2">
          <Checkbox
            id="show-archived-sessions"
            checked={showArchived}
            onCheckedChange={(checked) => setShowArchived(Boolean(checked))}
          />
          <Label htmlFor="show-archived-sessions" className="text-sm font-normal text-gray-600 cursor-pointer">
            Show archived sessions ({archivedCount})
          </Label>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </div>
      ) : null}

      {isError ? (
        <Card className="border-rose-100 bg-white/75">
          <CardContent className="p-6 text-red-700">{error.message}</CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && sessions.length === 0 ? (
        <Card className="border-rose-100 bg-white/75">
          <CardContent className="flex flex-col items-center gap-5 p-10 text-center">
            <div className="rounded-full border border-rose-100 bg-rose-50 p-3">
              <MessageCircleHeart className="h-8 w-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">No mediation sessions yet</h2>
              <p className="mt-2 max-w-md text-gray-600">
                Start a session when something needs care, structure, and a little room to breathe.
              </p>
            </div>
            <Button asChild className="bg-rose-500 hover:bg-rose-600">
              <Link to="/mediation/new">
                <Plus className="mr-2 h-4 w-4" />
                Create the first session
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && !isError && sessions.length > 0 && visibleSessions.length === 0 ? (
        <Card className="border-rose-100 bg-white/75">
          <CardContent className="p-6 text-center text-sm text-gray-500">
            All sessions are archived. Check "Show archived sessions" to see them.
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4">
        {visibleSessions.map((session) => {
          const myPerspective = getPerspectiveState({
            submitted: session.has_my_perspective,
            exists: session.my_perspective_exists,
            draftLabel: "Draft saved",
            sessionStatus: session.status,
          });
          const otherPerspective = getPerspectiveState({
            submitted: session.has_other_perspective,
            exists: session.other_perspective_exists,
            draftLabel: "Draft started",
            sessionStatus: session.status,
          });
          const adviceTone = getAdviceTone(session.advice_status, session.has_advice);

          return (
            <Link
              key={session.id}
              to={`/mediation/${session.id}`}
              className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Card className="border-rose-100 bg-white/75 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:bg-white/90 hover:shadow-md">
                <CardHeader className="space-y-4 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <CardTitle className="truncate text-xl text-gray-800">{session.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays className="h-4 w-4 text-rose-400" aria-hidden="true" />
                        <span>{formatSessionDate(session.created_at)}</span>
                      </div>
                      {session.description ? (
                        <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-gray-600">
                          {session.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                      <StatusBadge status={session.status} />
                      <SafetyBadge safetyStatus={session.safety_status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-3">
                  <SessionStateTile
                    label="My perspective"
                    value={myPerspective.value}
                    tone={myPerspective.tone}
                  />
                  <SessionStateTile
                    label="Other perspective"
                    value={otherPerspective.value}
                    tone={otherPerspective.tone}
                  />
                  <SessionStateTile
                    label="Shared advice"
                    value={getAdviceLabel(session)}
                    tone={adviceTone}
                  />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </MediationPageShell>
  );
};

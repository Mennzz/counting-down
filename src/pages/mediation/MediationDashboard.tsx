import { Link, useParams } from "react-router-dom";
import { Archive, CheckCircle2, FileText, MessageSquareText, XCircle } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useArchiveMediationSession,
  useMediationSession,
  useMyReflection,
  useResolveMediationSession,
  useUnarchiveMediationSession,
  useUnresolveMediationSession,
} from "@/hooks/use-mediation";
import {
  MediationPageShell,
  PrivateReflectionCard,
  SafetyBadge,
  SessionStateNotice,
  StatusBadge,
} from "./MediationShared";
import { isAdviceAvailable, isSessionReadOnly } from "./mediation-ui";

export const MediationDashboard = () => {
  const { sessionId = "" } = useParams();
  const { data: session, isLoading, isError, error } = useMediationSession(sessionId);
  const myPerspectiveSubmitted =
    session?.my_perspective?.status === "SUBMITTED_PENDING_REVIEW" || session?.my_perspective?.status === "LOCKED";
  const shouldFetchReflection =
    session?.my_reflection_status === "PROCESSING" ||
    session?.my_reflection_status === "AVAILABLE" ||
    myPerspectiveSubmitted;
  const reflectionQuery = useMyReflection(sessionId, shouldFetchReflection);
  const resolveSession = useResolveMediationSession(sessionId);
  const unresolveSession = useUnresolveMediationSession(sessionId);
  const archiveSession = useArchiveMediationSession(sessionId);
  const unarchiveSession = useUnarchiveMediationSession(sessionId);

  if (isLoading) {
    return (
      <MediationPageShell title="Mediation" backTo="/mediation">
        <Skeleton className="h-64 w-full" />
      </MediationPageShell>
    );
  }

  if (isError || !session) {
    return (
      <MediationPageShell title="Mediation" backTo="/mediation">
        <Card>
          <CardContent className="p-6 text-red-700">{error?.message ?? "Session not found."}</CardContent>
        </Card>
      </MediationPageShell>
    );
  }

  const readOnly = isSessionReadOnly(session);
  const adviceAvailable = isAdviceAvailable(session);
  const isBlocked = session.safety_status === "BLOCKED";
  const isArchived = session.status === "ARCHIVED";
  const isResolved = session.status === "RESOLVED";
  const actionPending =
    archiveSession.isPending ||
    resolveSession.isPending ||
    unarchiveSession.isPending ||
    unresolveSession.isPending;
  const canShowResolve = !isBlocked && !isResolved && !isArchived;
  const canShowArchive = !isBlocked && !isArchived;
  const myPerspectivePending = session.my_perspective?.status === "SUBMITTED_PENDING_REVIEW";
  const myPerspectiveLocked = session.my_perspective?.status === "LOCKED";
  const reflectionFromContent = reflectionQuery.data?.content
    ? { content: reflectionQuery.data.content }
    : null;
  const reflection = session.my_reflection ?? reflectionQuery.data?.reflection ?? reflectionFromContent;
  const reflectionStatus =
    reflectionQuery.data?.status === "NONE" && myPerspectiveSubmitted
      ? "PROCESSING"
      : reflectionQuery.data?.status ?? session.my_reflection_status ?? reflection?.status;

  return (
    <MediationPageShell title={session.title} description={session.description ?? undefined} backTo="/mediation">
      <div className="space-y-6">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-gray-800">Session state</CardTitle>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={session.status} />
                <SafetyBadge safetyStatus={session.safety_status} />
              </div>
            </div>
            <SessionStateNotice session={session} />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-white/60 p-4">
              <p className="text-sm text-gray-500">My perspective</p>
              <p className="mt-1 font-medium text-gray-800">
                {myPerspectivePending
                  ? "Submitted, checking"
                  : myPerspectiveLocked
                  ? "Submitted"
                  : session.has_my_perspective ?? session.my_perspective_exists
                    ? "Draft started"
                    : "Needed"}
              </p>
            </div>
            <div className="rounded-lg border bg-white/60 p-4">
              <p className="text-sm text-gray-500">Other perspective</p>
              <p className="mt-1 font-medium text-gray-800">
                {session.has_other_perspective ?? session.other_perspective_exists ? "Submitted" : "Waiting"}
              </p>
            </div>
            <div className="rounded-lg border bg-white/60 p-4">
              <p className="text-sm text-gray-500">Shared advice</p>
              <p className="mt-1 font-medium text-gray-800">{adviceAvailable ? "Available" : "Not ready"}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <FileText className="h-5 w-5 text-rose-500" />
                Perspective
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Write privately, save a draft, and submit when it feels ready.
              </p>
              <Button asChild variant="outline">
                <Link to={`/mediation/${session.id}/perspective`}>
                  {myPerspectiveLocked || myPerspectivePending || readOnly ? "View perspective" : "Open perspective"}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <MessageSquareText className="h-5 w-5 text-rose-500" />
                Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Shared advice and comments appear here once the mediation is ready.
              </p>
              <Button asChild variant="outline">
                <Link to={`/mediation/${session.id}/discussion`}>Open discussion</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <PrivateReflectionCard
          reflection={reflection}
          status={reflectionStatus}
          isLoading={reflectionQuery.isLoading && shouldFetchReflection}
        />

        {canShowResolve || canShowArchive ? (
          <div className="flex flex-wrap justify-end gap-3">
            {canShowArchive ? (
              session.has_marked_archived && !session.other_has_marked_archived && !isResolved ? (
                <Button
                  variant="outline"
                  onClick={() => unarchiveSession.mutate()}
                  disabled={actionPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Undo archive
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={actionPending}>
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive this mediation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {isResolved
                          ? "This mediation is already resolved, so your confirmation will archive it now."
                          : "This mediation is not resolved yet. It will be archived only after the other person also confirms."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => archiveSession.mutate()}>
                        Archive
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )
            ) : null}

            {canShowResolve ? (
              session.has_marked_resolved && !session.other_has_marked_resolved ? (
                <Button
                  variant="outline"
                  onClick={() => unresolveSession.mutate()}
                  disabled={actionPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Undo resolve
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={actionPending} className="bg-rose-500 hover:bg-rose-600">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Resolve
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark this mediation resolved?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The mediation will become fully resolved only after both people have confirmed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => resolveSession.mutate()}>
                        Resolve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </MediationPageShell>
  );
};

import { useState } from "react";
import { CalendarClock, Inbox, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { XiaoBaoRoutineEditor } from "@/components/xiaobao/XiaoBaoRoutineEditor";
import { XiaoBaoSectionShell } from "@/components/xiaobao/XiaoBaoSectionShell";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateXiaoBaoRoutine,
  useDeleteXiaoBaoRoutine,
  usePauseXiaoBaoRoutine,
  useResumeXiaoBaoRoutine,
  useUpdateXiaoBaoRoutine,
  useXiaoBaoRoutineRuns,
  useXiaoBaoRoutines,
} from "@/hooks/use-xiaobao-routines";
import type {
  XiaoBaoRoutine,
  XiaoBaoRoutineInput,
  XiaoBaoRoutineRun,
  XiaoBaoRoutineRunStatus,
} from "@/types/xiaobao";
import { formatRoutineSchedule } from "@/utils/xiaobao-routines";

const dateTime = (value: string | null | undefined, timezone: string) => {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
};

const runStatusLabel: Record<XiaoBaoRoutineRunStatus, string> = {
  PENDING: "Waiting",
  PROCESSING: "Preparing",
  COMPLETED: "Delivered",
  FAILED: "Couldn’t prepare",
  CANCELLED: "Cancelled",
};

const isOneTimeReminder = (routine: XiaoBaoRoutine) =>
  routine.kind === "REMINDER" || routine.schedule.frequency === "ONCE";

const oneTimeStatus = (routine: XiaoBaoRoutine, latestRun?: XiaoBaoRoutineRun) => {
  if (routine.finishReason === "DELIVERED") return "Delivered";
  if (routine.finishReason === "FAILED") return "Couldn’t prepare";
  if (!routine.enabled) return "Paused";
  if (routine.lastScheduledFor || latestRun) return "Preparing";
  return "Scheduled";
};

export default function XiaoBaoRoutinesPage() {
  const routines = useXiaoBaoRoutines();
  const createRoutine = useCreateXiaoBaoRoutine();
  const [createOpen, setCreateOpen] = useState(false);
  const [createReview, setCreateReview] = useState<XiaoBaoRoutineInput>();

  const confirmCreate = async () => {
    if (!createReview) return;
    try {
      await createRoutine.mutateAsync(createReview);
      setCreateReview(undefined);
      setCreateOpen(false);
    } catch {
      // The mutation displays a user-facing error and leaves the review open.
    }
  };

  return (
    <XiaoBaoSectionShell
      title="Xiao Bao routines & reminders"
      description="Choose a one-time reminder or a recurring message that Xiao Bao prepares privately for you. You can create one here or ask Xiao Bao in chat to suggest it."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/xiaobao/inbox"><Inbox className="mr-2 h-4 w-4" />Open inbox</Link></Button>
          <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New reminder or routine</Button>
        </div>
      </div>

      {routines.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      ) : routines.isError ? (
        <Card className="border-red-200 bg-red-50"><CardContent className="p-6 text-sm text-red-800">{routines.error.message || "Your routines and reminders could not load."}</CardContent></Card>
      ) : routines.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {routines.data.map((routine) => <RoutineCard key={routine.id} routine={routine} />)}
        </div>
      ) : (
        <Card className="border-dashed border-rose-200 bg-white/70">
          <CardContent className="flex flex-col items-center p-10 text-center">
            <CalendarClock className="h-10 w-10 text-rose-400" />
            <h2 className="mt-3 text-lg font-semibold text-rose-950">No routines or reminders yet</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">Set a one-time reminder here, or ask Xiao Bao in chat and review the card before accepting it.</p>
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>Set your first reminder</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>New Xiao Bao reminder or routine</DialogTitle>
            <DialogDescription>Set it up first. You’ll review it once more before anything is scheduled.</DialogDescription>
          </DialogHeader>
          <XiaoBaoRoutineEditor submitLabel="Review" onSubmit={(value) => {
            setCreateReview(value);
            setCreateOpen(false);
          }} />
        </DialogContent>
      </Dialog>

      <RoutineReviewDialog
        open={Boolean(createReview)}
        input={createReview}
        title={createReview?.kind === "REMINDER" ? "Set this reminder?" : "Create this routine?"}
        description="Nothing will run until you confirm."
        confirmLabel={createReview?.kind === "REMINDER" ? "Set reminder" : "Create routine"}
        isPending={createRoutine.isPending}
        onCancel={() => {
          setCreateReview(undefined);
          setCreateOpen(true);
        }}
        onConfirm={() => void confirmCreate()}
      />
    </XiaoBaoSectionShell>
  );
}

function RoutineCard({ routine }: { routine: XiaoBaoRoutine }) {
  const pauseRoutine = usePauseXiaoBaoRoutine();
  const resumeRoutine = useResumeXiaoBaoRoutine();
  const deleteRoutine = useDeleteXiaoBaoRoutine();
  const updateRoutine = useUpdateXiaoBaoRoutine();
  const runs = useXiaoBaoRoutineRuns(routine.id);
  const [editOpen, setEditOpen] = useState(false);
  const [editReview, setEditReview] = useState<XiaoBaoRoutineInput>();
  const latestRun = runs.data?.items[0];
  const isReminder = isOneTimeReminder(routine);
  const isTerminalReminder = isReminder && Boolean(routine.finishedAt || routine.finishReason);
  const isPreparingReminder = isReminder && !isTerminalReminder && Boolean(routine.lastScheduledFor || latestRun);
  const isExpiredReminder = isReminder &&
    !routine.enabled &&
    !isTerminalReminder &&
    Boolean(routine.nextRunAt && new Date(routine.nextRunAt).getTime() <= Date.now());
  const isLockedReminder = isTerminalReminder || isPreparingReminder;
  const isUnreadAutoPaused = !isReminder && !routine.enabled && routine.pauseReason === "UNREAD_INACTIVITY";
  const status = isReminder
    ? isExpiredReminder ? "Needs a new time" : oneTimeStatus(routine, latestRun)
    : routine.enabled ? "Active" : isUnreadAutoPaused ? "Auto-paused" : "Paused";
  const statusClass = status === "Delivered"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : status === "Couldn’t prepare"
      ? "border-red-200 bg-red-50 text-red-800"
    : status === "Preparing"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : status === "Needs a new time"
          ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "Scheduled" || status === "Active"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : isUnreadAutoPaused
            ? "border-amber-200 bg-amber-50 text-amber-800"
            : "border-slate-200 bg-slate-100 text-slate-700";

  const confirmEdit = async () => {
    if (!editReview) return;
    try {
      await updateRoutine.mutateAsync({ id: routine.id, input: editReview });
      setEditReview(undefined);
      setEditOpen(false);
    } catch {
      // The mutation displays a user-facing error and leaves the review open.
    }
  };

  return (
    <Card className="border-rose-100 bg-white/85 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-xl text-rose-950">{routine.name}</CardTitle>
          <Badge variant="outline" className={statusClass}>
            {status}
          </Badge>
        </div>
        <p className="text-sm leading-6 text-slate-600">{isReminder ? routine.message : routine.instruction}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUnreadAutoPaused && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950" role="status">
            <div className="flex items-start gap-2">
              <Inbox className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Paused after five unread days</p>
                <p className="mt-1 text-xs leading-5 text-amber-900">
                  Xiao Bao stopped preparing new messages because one of this routine’s delivered inbox messages was unread for five full days. You’ll need to read the old routine messages before this routine can resume.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-2 border-amber-300 bg-white/70 hover:bg-white">
                  <Link to={`/xiaobao/inbox?routineId=${encodeURIComponent(routine.id)}`}>Read this routine’s inbox first</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
        <dl className="grid gap-3 rounded-xl bg-rose-50/60 p-3 text-sm sm:grid-cols-2">
          <div><dt className="text-xs text-muted-foreground">{isReminder ? "When" : "Schedule"}</dt><dd className="font-medium">{formatRoutineSchedule(routine)}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Timezone</dt><dd className="font-medium">{routine.schedule.timezone}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">{isReminder ? "Reminder" : "Next message"}</dt><dd className="font-medium">
            {isReminder
              ? routine.finishReason === "DELIVERED"
                ? `Delivered ${dateTime(routine.finishedAt ?? latestRun?.completedAt, routine.schedule.timezone)}`
                : routine.finishReason === "FAILED"
                  ? "Couldn’t prepare"
                  : isExpiredReminder
                    ? "Choose a future date and time."
                  : isPreparingReminder
                    ? "Xiao Bao is preparing it."
                    : routine.enabled
                      ? dateTime(routine.nextRunAt, routine.schedule.timezone)
                      : "Paused"
              : routine.enabled ? dateTime(routine.nextRunAt, routine.schedule.timezone) : "Paused"}
          </dd></div>
        </dl>

        {isExpiredReminder && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950" role="status">
            This reminder’s time has passed. Edit it to choose a future date and time; once it is in the future, you can resume it.
          </p>
        )}

        <div className="text-xs text-muted-foreground">
          {runs.isError ? "Recent run status is temporarily unavailable." : latestRun ? (
            <>Latest: <span className="font-medium text-slate-700">{runStatusLabel[latestRun.status]}</span> · {dateTime(latestRun.scheduledFor, routine.schedule.timezone)}</>
          ) : "No messages prepared yet."}
        </div>

        <div className="flex flex-wrap gap-2">
          {!isLockedReminder && <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>}
          {!isLockedReminder && !isExpiredReminder && <RoutineStateDialog routine={routine} onPause={() => pauseRoutine.mutate(routine.id)} onResume={() => resumeRoutine.mutate(routine.id)} />}
          {isLockedReminder && <Button asChild size="sm" variant="outline"><Link to={`/xiaobao/inbox?routineId=${encodeURIComponent(routine.id)}`}><Inbox className="mr-1 h-3.5 w-3.5" />Open inbox</Link></Button>}
          <AlertDialog>
            <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-red-700"><Trash2 className="mr-1 h-3.5 w-3.5" />Delete</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>{isReminder ? `Remove “${routine.name}”?` : `Delete “${routine.name}”?`}</AlertDialogTitle><AlertDialogDescription>{isReminder ? "This removes the reminder. Its private inbox message remains available." : "This stops future runs and removes the routine. Messages already delivered to your private inbox remain available."}</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>{isReminder ? "Keep reminder" : "Keep routine"}</AlertDialogCancel><AlertDialogAction onClick={() => deleteRoutine.mutate(routine.id)}>{isReminder ? "Remove reminder" : "Delete routine"}</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{isReminder ? "Edit reminder" : "Edit routine"}</DialogTitle><DialogDescription>You’ll review your changes before they are saved.</DialogDescription></DialogHeader>
          <XiaoBaoRoutineEditor initialValue={routine} submitLabel="Review changes" onSubmit={(value) => {
            setEditReview(value);
            setEditOpen(false);
          }} />
        </DialogContent>
      </Dialog>
      <RoutineReviewDialog
        open={Boolean(editReview)}
        input={editReview}
        title={editReview?.kind === "REMINDER" ? "Save these reminder changes?" : "Save these routine changes?"}
        description="The updated schedule will replace the current one."
        confirmLabel="Save changes"
        isPending={updateRoutine.isPending}
        onCancel={() => {
          setEditReview(undefined);
          setEditOpen(true);
        }}
        onConfirm={() => void confirmEdit()}
      />
    </Card>
  );
}

function RoutineStateDialog({ routine, onPause, onResume }: { routine: XiaoBaoRoutine; onPause: () => void; onResume: () => void }) {
  const isReminder = isOneTimeReminder(routine);
  const itemName = isReminder ? "reminder" : "routine";
  const action = routine.enabled ? "pause" : "resume";
  const isUnreadAutoPaused = !routine.enabled && routine.pauseReason === "UNREAD_INACTIVITY";
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline">{routine.enabled ? <Pause className="mr-1 h-3.5 w-3.5" /> : <Play className="mr-1 h-3.5 w-3.5" />}{routine.enabled ? "Pause" : "Resume"}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{routine.enabled ? "Pause" : "Resume"} “{routine.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {routine.enabled
              ? isReminder ? "This reminder will not be delivered until you resume it." : "Xiao Bao will stop preparing new messages until you resume it."
              : isUnreadAutoPaused
                ? "Read this routine’s old inbox messages first. Once you’re caught up, you can resume it here."
                : `The next message will follow ${formatRoutineSchedule(routine).toLowerCase()} in ${routine.schedule.timezone}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={action === "pause" ? onPause : onResume}>{routine.enabled ? `Pause ${itemName}` : `Resume ${itemName}`}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RoutineReviewDialog({ open, input, title, description, confirmLabel, isPending, onCancel, onConfirm }: { open: boolean; input?: XiaoBaoRoutineInput; title: string; description: string; confirmLabel: string; isPending: boolean; onCancel: () => void; onConfirm: () => void }) {
  const isReminder = input?.kind === "REMINDER";
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
        {input && (
          <dl className="grid gap-3 rounded-xl border bg-rose-50/60 p-4 text-sm sm:grid-cols-2">
            <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">{isReminder ? "Reminder" : "Routine"}</dt><dd className="font-semibold text-rose-950">{input.name}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{isReminder ? "When" : "Schedule"}</dt><dd>{formatRoutineSchedule(input)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Timezone</dt><dd>{input.schedule.timezone}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Recipient</dt><dd>Only you</dd></div>
            <div><dt className="text-xs text-muted-foreground">Delivery</dt><dd>Private Xiao Bao inbox</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs text-muted-foreground">{isReminder ? "Exact reminder text" : "Instruction"}</dt><dd className="whitespace-pre-wrap">{isReminder ? input.message : input.instruction}</dd></div>
          </dl>
        )}
        <AlertDialogFooter><AlertDialogCancel disabled={isPending}>Go back</AlertDialogCancel><AlertDialogAction disabled={isPending} onClick={onConfirm}>{isPending ? "Saving…" : confirmLabel}</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

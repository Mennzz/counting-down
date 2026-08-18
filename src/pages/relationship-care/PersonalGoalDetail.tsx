import { useState } from "react";
import { Archive, Eye, EyeOff, Pencil, Sprout } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  useArchivePersonalGoal,
  usePersonalGoal,
  useUpdatePersonalGoal,
} from "@/hooks/use-relationship-care";
import { GoalDialog } from "./PersonalItemDialogs";
import { RelationshipCareShell } from "./RelationshipCareShared";
import { formatCareDate, goalCategoryLabels } from "./relationship-care-ui";

export const PersonalGoalDetailPage = () => {
  const { goalId = "" } = useParams();
  const navigate = useNavigate();
  const { data: goal, isLoading, isError, error } = usePersonalGoal(goalId);
  const update = useUpdatePersonalGoal(goalId);
  const archive = useArchivePersonalGoal(goalId);
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return <RelationshipCareShell title="Personal growth goal" backTo="/boundaries-agreements"><Skeleton className="h-96" /></RelationshipCareShell>;
  }
  if (isError || !goal) {
    return <RelationshipCareShell title="Personal growth goal" backTo="/boundaries-agreements"><Card><CardContent className="p-6 text-red-700">{error?.message ?? "Growth goal not found."}</CardContent></Card></RelationshipCareShell>;
  }

  const partnerName = goal.ownerUserType === "Joris" ? "Danfeng" : "Joris";
  const visibilityText = goal.isMine
    ? goal.visibility === "PRIVATE"
      ? "Only you can see this goal."
      : `Shared with ${partnerName}. You remain the only person who can change it.`
    : `${goal.ownerUserType} chose to share this personal goal with you.`;

  const archiveGoal = async () => {
    await archive.mutateAsync(undefined);
    navigate("/boundaries-agreements");
  };

  return (
    <RelationshipCareShell title={goal.title} description="A personal intention for growth" backTo="/boundaries-agreements">
      <div className="space-y-6">
        <Card className="border-amber-100 bg-white/85">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl text-gray-800"><Sprout className="h-6 w-6 text-amber-600" />{goal.title}</CardTitle>
                <p className="mt-2 text-sm text-gray-500">Updated {formatCareDate(goal.updatedAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{goalCategoryLabels[goal.category]}</Badge>
                <Badge variant="outline">{goal.visibility === "PRIVATE" ? "Only me" : `Shared with ${partnerName}`}</Badge>
                {!goal.isMine ? <Badge variant="outline">Read only</Badge> : null}
              </div>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-950">{visibilityText}</div>
          </CardHeader>
          <CardContent className="space-y-7">
            <Reflection title="What I want to work on" value={goal.goal} />
            <Reflection title="Why this matters to me" value={goal.whyItMatters} />
            <Reflection title="When this tends to happen" value={goal.trigger} />
            <Reflection title="What I want to practise" value={goal.practice} />
            <Reflection title="Reminder to myself" value={goal.reminder} />
          </CardContent>
        </Card>

        {goal.isMine && !goal.archivedAt ? (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
            <Button
              variant="outline"
              disabled={update.isPending}
              onClick={() => update.mutate({ visibility: goal.visibility === "PRIVATE" ? "SHARED_WITH_PARTNER" : "PRIVATE" })}
            >
              {goal.visibility === "PRIVATE" ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
              {goal.visibility === "PRIVATE" ? `Share with ${partnerName}` : "Make private"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="ghost"><Archive className="mr-2 h-4 w-4" />Archive</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive this growth goal?</AlertDialogTitle>
                  <AlertDialogDescription>It will leave the active dashboard and immediately stop being visible to your partner. You can restore it later.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Keep it</AlertDialogCancel><AlertDialogAction onClick={archiveGoal}>Archive</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </div>
      <GoalDialog open={editing} onOpenChange={setEditing} goal={goal} />
    </RelationshipCareShell>
  );
};

const Reflection = ({ title, value }: { title: string; value?: string | null }) => value ? (
  <section>
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    <p className="mt-2 whitespace-pre-wrap leading-7 text-gray-600">{value}</p>
  </section>
) : null;

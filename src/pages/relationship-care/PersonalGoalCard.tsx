import { Archive, ArrowRight, Pencil } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PersonalGoal, RelationshipUserType } from "@/types/relationship-care";
import { goalCategoryLabels, formatCareDate } from "./relationship-care-ui";

export const PersonalGoalCard = ({
  goal,
  partnerName,
  onEdit,
  onArchive,
}: {
  goal: PersonalGoal;
  partnerName: RelationshipUserType;
  onEdit?: () => void;
  onArchive?: () => void;
}) => (
  <Card className="border-amber-100 bg-amber-50/35">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-gray-800">{goal.title}</h4>
            <Badge variant="outline">{goalCategoryLabels[goal.category]}</Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{goal.goal}</p>
          <p className="mt-3 text-xs text-gray-500">
            Updated {formatCareDate(goal.updatedAt)} · {goal.visibility === "PRIVATE" ? "Only me" : `Shared with ${partnerName}`}
          </p>
        </div>
        {goal.isMine ? (
          <div className="flex shrink-0">
            {onEdit ? <Button variant="ghost" size="sm" aria-label={`Edit ${goal.title}`} onClick={onEdit}><Pencil className="h-4 w-4" /></Button> : null}
            {onArchive ? <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="sm" aria-label={`Archive ${goal.title}`}><Archive className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive this growth goal?</AlertDialogTitle><AlertDialogDescription>It will leave the active dashboard and stop being visible to your partner. You can restore it later.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep it</AlertDialogCancel><AlertDialogAction onClick={onArchive}>Archive</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : null}
          </div>
        ) : <Badge variant="outline">Read only</Badge>}
      </div>
      <Button asChild variant="link" className="mt-2 h-auto p-0 text-amber-800">
        <Link to={`/boundaries-agreements/goals/${goal.id}`}>View goal <ArrowRight className="ml-1 h-4 w-4" /></Link>
      </Button>
    </CardContent>
  </Card>
);

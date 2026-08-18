import { useMemo, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useXiaoBao } from "@/hooks/use-xiaobao";
import { useToast } from "@/hooks/use-toast";
import type { XiaoBaoProposal, XiaoBaoProposalPayload } from "@/types/xiaobao";
import { XiaoBaoMascot } from "./XiaoBaoMascot";

const LABELS: Record<string, string> = {
  title: "Title",
  whatINeed: "What I need",
  whatIWillDo: "What I will do",
  whyThisMatters: "Why this matters",
  goal: "Goal",
  trigger: "Trigger",
  practice: "Practice",
  reminder: "Reminder",
  agreementText: "Agreement",
  fairnessExplanation: "Fairness explanation",
  category: "Category",
  visibility: "Visibility",
  fairnessType: "Fairness",
  description: "Description",
  content: "Comment",
  whatHappened: "What happened",
  whatIFelt: "What I felt",
  whatINeeded: "What I needed",
  whatHurtMe: "What hurt me",
  myPart: "My part",
  whatIWantNow: "What I want now",
  freeText: "Anything else",
};

const TITLES: Record<XiaoBaoProposal["type"], string> = {
  PERSONAL_BOUNDARY: "Personal boundary",
  PERSONAL_GOAL: "Personal growth goal",
  SHARED_AGREEMENT: "Shared agreement draft",
  TOGETHER_LIST_ITEM: "Together List idea",
  MEDIATION_SESSION: "New mediation",
  MEDIATION_COMMENT: "Xiao Bao mediation comment",
  MEDIATION_PERSPECTIVE_DRAFT: "Private perspective draft",
};

const orderedFields = (proposal: XiaoBaoProposal) => {
  const order: Record<XiaoBaoProposal["type"], string[]> = {
    PERSONAL_BOUNDARY: ["title", "whatINeed", "whatIWillDo", "whyThisMatters", "category"],
    PERSONAL_GOAL: ["title", "goal", "whyItMatters", "trigger", "practice", "reminder", "category", "visibility"],
    SHARED_AGREEMENT: ["title", "whyItMatters", "agreementText", "fairnessType", "fairnessExplanation"],
    TOGETHER_LIST_ITEM: ["title", "category"],
    MEDIATION_SESSION: ["title", "description"],
    MEDIATION_COMMENT: ["content"],
    MEDIATION_PERSPECTIVE_DRAFT: [
      "whatHappened",
      "whatIFelt",
      "whatINeeded",
      "whatHurtMe",
      "myPart",
      "whatIWantNow",
      "freeText",
    ],
  };
  return order[proposal.type];
};

export function XiaoBaoProposalCard({ proposal }: { proposal: XiaoBaoProposal }) {
  const { updateProposal, acceptProposal, rejectProposal } = useXiaoBao();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [acceptedJustNow, setAcceptedJustNow] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(() => ({ ...proposal.payload }));
  const isPending = proposal.status === "PENDING";
  const fields = useMemo(() => orderedFields(proposal), [proposal]);
  const displayTitle = String(
    (proposal.payload as { title?: string }).title ?? proposal.target?.title ?? "Idea",
  );
  const acceptedLink = proposal.status === "ACCEPTED"
    ? proposal.type === "MEDIATION_SESSION" && proposal.createdEntityId
      ? `/mediation/${proposal.createdEntityId}/perspective`
      : proposal.type === "MEDIATION_COMMENT" && proposal.target
        ? `/mediation/${proposal.target.id}/discussion`
        : proposal.type === "MEDIATION_PERSPECTIVE_DRAFT" && proposal.target
          ? `/mediation/${proposal.target.id}/perspective`
          : undefined
    : undefined;

  const run = async (action: () => Promise<void>) => {
    setIsBusy(true);
    try {
      await action();
    } catch (error) {
      toast({
        title: "That card couldn’t be updated",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="xiaobao-card-enter mt-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-sm shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {proposal.status === "ACCEPTED" && (
            <XiaoBaoMascot state="success" size={32} animated={acceptedJustNow} />
          )}
          <p className="font-semibold text-rose-950">{TITLES[proposal.type]}</p>
        </div>
        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-rose-700">
          {proposal.status.toLowerCase()}
        </span>
      </div>
      <p className="mt-1 font-medium text-slate-900">{displayTitle}</p>
      {proposal.rationale && <p className="mt-1 text-xs text-slate-600">{proposal.rationale}</p>}
      {proposal.type === "MEDIATION_SESSION" &&
        (proposal.payload as { description?: string }).description && (
          <p className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
            {(proposal.payload as { description: string }).description}
          </p>
        )}
      {proposal.type === "MEDIATION_COMMENT" && (
        <p className="mt-2 whitespace-pre-wrap rounded-lg border border-rose-100 bg-white/80 p-2 text-slate-800">
          {(proposal.payload as { content: string }).content}
        </p>
      )}
      {proposal.type === "MEDIATION_PERSPECTIVE_DRAFT" && (
        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-slate-700">
          {(proposal.payload as { whatHappened?: string }).whatHappened ||
            "Open Edit to review the private perspective fields."}
        </p>
      )}
      {proposal.type === "PERSONAL_BOUNDARY" && isPending && (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          Accepting makes this boundary active and visible to your partner.
        </p>
      )}
      {proposal.type === "SHARED_AGREEMENT" && isPending && (
        <p className="mt-2 text-xs text-slate-600">
          Accepting saves a private draft. You decide separately when to propose it.
        </p>
      )}
      {proposal.type === "MEDIATION_SESSION" && isPending && (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          Accepting starts a mediation visible to your partner. You add your private perspective separately.
        </p>
      )}
      {proposal.type === "MEDIATION_COMMENT" && isPending && (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          Accepting posts this exact text to “{proposal.target?.title}” as Xiao Bao, visible to both of you.
        </p>
      )}
      {proposal.type === "MEDIATION_PERSPECTIVE_DRAFT" && isPending && (
        <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-900">
          Accepting saves this only as your private draft. It will not submit or share it.
        </p>
      )}
      {isPending && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => void run(async () => {
              await acceptProposal(proposal);
              setAcceptedJustNow(true);
            })}
            disabled={isBusy}
          >
            <Check className="mr-1 h-3.5 w-3.5" /> Accept
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} disabled={isBusy}>
            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void run(() => rejectProposal(proposal))} disabled={isBusy}>
            <X className="mr-1 h-3.5 w-3.5" /> Not now
          </Button>
        </div>
      )}
      {acceptedLink && (
        <Button asChild size="sm" variant="outline" className="mt-3">
          <Link to={acceptedLink}>
            {proposal.type === "MEDIATION_COMMENT"
              ? "Open discussion"
              : proposal.type === "MEDIATION_SESSION"
                ? "Add my perspective"
                : "Review my perspective"}
          </Link>
        </Button>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review {TITLES[proposal.type].toLowerCase()}</DialogTitle>
            <DialogDescription>
              {proposal.target ? `For “${proposal.target.title}”. ` : ""}Nothing is saved until you accept.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {fields.map((field) => {
              const value = String(draft[field] ?? "");
              const isLong = [
                "whatINeed",
                "whatIWillDo",
                "whyThisMatters",
                "goal",
                "whyItMatters",
                "practice",
                "agreementText",
                "fairnessExplanation",
                "description",
                "content",
                "whatHappened",
                "whatIFelt",
                "whatINeeded",
                "whatHurtMe",
                "myPart",
                "whatIWantNow",
                "freeText",
              ].includes(field);
              return (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={`proposal-${proposal.id}-${field}`}>{LABELS[field] ?? field}</Label>
                  {isLong ? (
                    <Textarea
                      id={`proposal-${proposal.id}-${field}`}
                      value={value}
                      onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
                    />
                  ) : (
                    <Input
                      id={`proposal-${proposal.id}-${field}`}
                      value={value}
                      onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button
              disabled={isBusy}
              onClick={() => void run(async () => {
                await updateProposal(proposal, draft as XiaoBaoProposalPayload);
                setIsEditing(false);
              })}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useSaveBoundary,
  useSavePersonalGoal,
  useSaveRelationshipRequest,
} from "@/hooks/use-relationship-care";
import type {
  GoalVisibility,
  PersonalBoundary,
  PersonalBoundaryInput,
  PersonalGoal,
  PersonalGoalCategory,
  PersonalGoalInput,
  RelationshipCareCategory,
  RelationshipRequest,
  RelationshipRequestInput,
  RequestImportance,
} from "@/types/relationship-care";
import { categoryLabels, goalCategoryLabels } from "./relationship-care-ui";

const categories = Object.entries(categoryLabels) as [RelationshipCareCategory, string][];
const goalCategories = Object.entries(goalCategoryLabels) as [PersonalGoalCategory, string][];

const Field = ({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label htmlFor={htmlFor}>{label}</Label>
    {children}
  </div>
);

export const BoundaryDialog = ({
  open,
  onOpenChange,
  boundary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boundary?: PersonalBoundary;
}) => {
  const save = useSaveBoundary(boundary?.id);
  const [form, setForm] = useState<PersonalBoundaryInput>({
    title: "",
    whatINeed: "",
    whatIWillDo: "",
    whyThisMatters: "",
    category: "OTHER",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      boundary
        ? {
            title: boundary.title,
            whatINeed: boundary.whatINeed,
            whatIWillDo: boundary.whatIWillDo,
            whyThisMatters: boundary.whyThisMatters ?? "",
            category: boundary.category,
          }
        : { title: "", whatINeed: "", whatIWillDo: "", whyThisMatters: "", category: "OTHER" },
    );
  }, [boundary, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await save.mutateAsync(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{boundary ? "Edit my boundary" : "Add a personal boundary"}</DialogTitle>
          <DialogDescription>
            Describe what you need and what you will do, rather than controlling what your partner must do.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <Field label="A short title" htmlFor="boundary-title">
            <Input id="boundary-title" required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="What I need" htmlFor="boundary-need">
            <Textarea id="boundary-need" required maxLength={1500} rows={3} value={form.whatINeed} onChange={(e) => setForm({ ...form, whatINeed: e.target.value })} />
          </Field>
          <Field label="What I will do" htmlFor="boundary-response">
            <Textarea id="boundary-response" required maxLength={1500} rows={3} value={form.whatIWillDo} onChange={(e) => setForm({ ...form, whatIWillDo: e.target.value })} />
          </Field>
          <Field label="Why this matters to me (optional)" htmlFor="boundary-why">
            <Textarea id="boundary-why" maxLength={1500} rows={3} value={form.whyThisMatters} onChange={(e) => setForm({ ...form, whyThisMatters: e.target.value })} />
          </Field>
          <Field label="Category" htmlFor="boundary-category">
            <Select value={form.category} onValueChange={(value: RelationshipCareCategory) => setForm({ ...form, category: value })}>
              <SelectTrigger id="boundary-category"><SelectValue /></SelectTrigger>
              <SelectContent>{categories.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending} className="bg-rose-500 hover:bg-rose-600">
              {save.isPending ? "Saving…" : "Save boundary"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const RequestDialog = ({
  open,
  onOpenChange,
  request,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: RelationshipRequest;
}) => {
  const save = useSaveRelationshipRequest(request?.id);
  const [form, setForm] = useState<RelationshipRequestInput>({
    title: "",
    description: "",
    whyItMatters: "",
    ideas: "",
    importance: "MEDIUM",
    category: "OTHER",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      request
        ? {
            title: request.title,
            description: request.description,
            whyItMatters: request.whyItMatters,
            ideas: request.ideas ?? "",
            importance: request.importance,
            category: request.category,
          }
        : { title: "", description: "", whyItMatters: "", ideas: "", importance: "MEDIUM", category: "OTHER" },
    );
  }, [open, request]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await save.mutateAsync(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{request ? "Edit my request" : "Share a personal request"}</DialogTitle>
          <DialogDescription>
            Requests help share what creates connection. They are invitations, not obligations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <Field label="A short title" htmlFor="request-title">
            <Input id="request-title" required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="What I would appreciate" htmlFor="request-description">
            <Textarea id="request-description" required maxLength={2000} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Why this matters to me" htmlFor="request-why">
            <Textarea id="request-why" required maxLength={1500} rows={3} value={form.whyItMatters} onChange={(e) => setForm({ ...form, whyItMatters: e.target.value })} />
          </Field>
          <Field label="Ideas that could meet this need (optional)" htmlFor="request-ideas">
            <Textarea id="request-ideas" maxLength={2000} rows={3} value={form.ideas} onChange={(e) => setForm({ ...form, ideas: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Importance" htmlFor="request-importance">
              <Select value={form.importance} onValueChange={(value: RequestImportance) => setForm({ ...form, importance: value })}>
                <SelectTrigger id="request-importance"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HIGH">High</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Category" htmlFor="request-category">
              <Select value={form.category} onValueChange={(value: RelationshipCareCategory) => setForm({ ...form, category: value })}>
                <SelectTrigger id="request-category"><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending} className="bg-rose-500 hover:bg-rose-600">
              {save.isPending ? "Saving…" : "Save request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const GoalDialog = ({
  open,
  onOpenChange,
  goal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: PersonalGoal;
}) => {
  const save = useSavePersonalGoal(goal?.id);
  const [form, setForm] = useState<PersonalGoalInput>({
    title: "",
    goal: "",
    whyItMatters: "",
    trigger: "",
    practice: "",
    reminder: "",
    category: "OTHER",
    visibility: "PRIVATE",
  });

  useEffect(() => {
    if (!open) return;
    setForm(
      goal
        ? {
            title: goal.title,
            goal: goal.goal,
            whyItMatters: goal.whyItMatters ?? "",
            trigger: goal.trigger ?? "",
            practice: goal.practice ?? "",
            reminder: goal.reminder ?? "",
            category: goal.category,
            visibility: goal.visibility,
          }
        : {
            title: "",
            goal: "",
            whyItMatters: "",
            trigger: "",
            practice: "",
            reminder: "",
            category: "OTHER",
            visibility: "PRIVATE",
          },
    );
  }, [goal, open]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await save.mutateAsync(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit my growth goal" : "Add a personal growth goal"}</DialogTitle>
          <DialogDescription>
            A growth goal is something you choose to practise in yourself. It is private unless
            you explicitly share it with your partner.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <Field label="A short title" htmlFor="goal-title">
            <Input id="goal-title" required autoFocus maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </Field>
          <Field label="What I want to work on" htmlFor="goal-text">
            <Textarea id="goal-text" required maxLength={3000} rows={4} value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} />
          </Field>
          <Field label="Why this matters to me (optional)" htmlFor="goal-why">
            <Textarea id="goal-why" maxLength={2000} rows={3} value={form.whyItMatters} onChange={(event) => setForm({ ...form, whyItMatters: event.target.value })} />
          </Field>
          <Field label="When this tends to happen (optional)" htmlFor="goal-trigger">
            <Textarea id="goal-trigger" maxLength={2000} rows={3} value={form.trigger} onChange={(event) => setForm({ ...form, trigger: event.target.value })} />
          </Field>
          <Field label="What I want to practise (optional)" htmlFor="goal-practice">
            <Textarea id="goal-practice" maxLength={2000} rows={3} value={form.practice} onChange={(event) => setForm({ ...form, practice: event.target.value })} />
          </Field>
          <Field label="Reminder to myself (optional)" htmlFor="goal-reminder">
            <Textarea id="goal-reminder" maxLength={500} rows={2} value={form.reminder} onChange={(event) => setForm({ ...form, reminder: event.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="goal-category">
              <Select value={form.category} onValueChange={(value: PersonalGoalCategory) => setForm({ ...form, category: value })}>
                <SelectTrigger id="goal-category"><SelectValue /></SelectTrigger>
                <SelectContent>{goalCategories.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Visibility" htmlFor="goal-visibility">
              <Select value={form.visibility} onValueChange={(value: GoalVisibility) => setForm({ ...form, visibility: value })}>
                <SelectTrigger id="goal-visibility"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRIVATE">Only me</SelectItem>
                  <SelectItem value="SHARED_WITH_PARTNER">Share with my partner</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <p className="text-xs leading-5 text-gray-500">
            Only you can edit, change visibility, archive, or restore this goal.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending} className="bg-rose-500 hover:bg-rose-600">
              {save.isPending ? "Saving…" : "Save growth goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

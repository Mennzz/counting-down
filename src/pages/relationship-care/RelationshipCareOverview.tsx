import { useState } from "react";
import { Archive, HandHeart, HeartHandshake, Pencil, Plus, RotateCcw, Shield, Sparkles, Sprout } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useArchiveBoundary,
  useArchivePersonalGoal,
  useArchiveRelationshipRequest,
  useRelationshipCareOverview,
  useRestoreBoundary,
  useRestorePersonalGoal,
  useRestoreRelationshipRequest,
} from "@/hooks/use-relationship-care";
import type { PersonalBoundary, PersonalGoal, RelationshipRequest } from "@/types/relationship-care";
import { BoundaryDialog, GoalDialog, RequestDialog } from "./PersonalItemDialogs";
import { PersonalGoalCard } from "./PersonalGoalCard";
import {
  AgreementStatusBadge,
  RelationshipCareShell,
} from "./RelationshipCareShared";
import { categoryLabels, formatCareDate } from "./relationship-care-ui";

const ArchiveButton = ({ label, onArchive }: { label: string; onArchive: () => void }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="ghost" size="sm" aria-label={`Archive ${label}`}>
        <Archive className="h-4 w-4" aria-hidden="true" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Archive this {label}?</AlertDialogTitle>
        <AlertDialogDescription>
          It will leave the active dashboard but remain safely stored.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Keep it</AlertDialogCancel>
        <AlertDialogAction onClick={onArchive}>Archive</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export const RelationshipCareOverviewPage = () => {
  const { data, isLoading, isError, error } = useRelationshipCareOverview();
  const archiveBoundary = useArchiveBoundary();
  const archiveRequest = useArchiveRelationshipRequest();
  const archiveGoal = useArchivePersonalGoal();
  const restoreBoundary = useRestoreBoundary();
  const restoreRequest = useRestoreRelationshipRequest();
  const restoreGoal = useRestorePersonalGoal();
  const [boundaryEditor, setBoundaryEditor] = useState<PersonalBoundary | null | undefined>();
  const [requestEditor, setRequestEditor] = useState<RelationshipRequest | null | undefined>();
  const [goalEditor, setGoalEditor] = useState<PersonalGoal | null | undefined>();
  const [showArchived, setShowArchived] = useState(false);

  if (isLoading) {
    return (
      <RelationshipCareShell title="Boundaries & Agreements" description="How we take care of us">
        <div className="grid gap-5 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        <Skeleton className="mt-6 h-72" />
      </RelationshipCareShell>
    );
  }

  if (isError || !data) {
    return (
      <RelationshipCareShell title="Boundaries & Agreements" description="How we take care of us">
        <Card><CardContent className="p-6 text-red-700">{error?.message ?? "This page could not load."}</CardContent></Card>
      </RelationshipCareShell>
    );
  }

  const myBoundaries = data.boundaries.filter((item) => item.isMine);
  const partnerBoundaries = data.boundaries.filter((item) => !item.isMine);
  const myRequests = data.requests.filter((item) => item.isMine);
  const partnerRequests = data.requests.filter((item) => !item.isMine);
  const myGoals = data.goals.filter((item) => item.isMine);
  const partnerGoals = data.goals.filter((item) => !item.isMine);
  const archivedCount = data.archivedBoundaries.length + data.archivedRequests.length + data.archivedGoals.length;
  const attentionAgreements = [...data.agreements]
    .sort((a, b) => Number(b.needsMyResponse) - Number(a.needsMyResponse))
    .slice(0, 4);

  return (
    <RelationshipCareShell title="Boundaries & Agreements" description="How we take care of us">
      <section aria-labelledby="agreements-title" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="agreements-title" className="text-2xl font-semibold text-gray-800">Our agreements</h2>
            <p className="mt-1 text-sm text-gray-600">Promises you both freely choose and accept together.</p>
          </div>
          <Button asChild className="bg-rose-500 hover:bg-rose-600"><Link to="/boundaries-agreements/agreements/new"><Plus className="mr-2 h-4 w-4" />Create an agreement</Link></Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-emerald-100 bg-white/75"><CardContent className="p-5"><p className="text-3xl font-semibold text-emerald-700">{data.agreementCounts.AGREED ?? 0}</p><p className="mt-1 text-sm text-gray-600">Agreed together</p></CardContent></Card>
          <Card className="border-amber-100 bg-white/75"><CardContent className="p-5"><p className="text-3xl font-semibold text-amber-700">{(data.agreementCounts.DISCUSSING ?? 0) + (data.agreementCounts.REVISIT ?? 0)}</p><p className="mt-1 text-sm text-gray-600">Being discussed</p></CardContent></Card>
          <Card className="border-sky-100 bg-white/75"><CardContent className="p-5"><p className="text-3xl font-semibold text-sky-700">{data.agreementCounts.PROPOSED ?? 0}</p><p className="mt-1 text-sm text-gray-600">Proposed</p></CardContent></Card>
        </div>

        {attentionAgreements.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {attentionAgreements.map((agreement) => (
              <Link key={agreement.id} to={`/boundaries-agreements/agreements/${agreement.id}`} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
                <Card className="h-full border-rose-100 bg-white/80 transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader className="space-y-3"><div className="flex items-start justify-between gap-3"><CardTitle className="text-xl text-gray-800">{agreement.title}</CardTitle><AgreementStatusBadge status={agreement.status} /></div>{agreement.needsMyResponse ? <Badge className="w-fit bg-rose-100 text-rose-700 hover:bg-rose-100">Needs your response</Badge> : null}</CardHeader>
                  <CardContent><p className="line-clamp-2 text-sm leading-6 text-gray-600">{agreement.agreementText}</p><p className="mt-3 text-xs text-gray-500">Revision {agreement.revisionNumber} · Updated {formatCareDate(agreement.updatedAt)}</p></CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-rose-100 bg-white/75"><CardContent className="flex flex-col items-center p-9 text-center"><HeartHandshake className="h-9 w-9 text-rose-400" /><h3 className="mt-3 text-lg font-semibold text-gray-800">No shared agreements yet</h3><p className="mt-2 max-w-md text-sm text-gray-600">Agreements are promises you choose together about how you want to care for your relationship.</p></CardContent></Card>
        )}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="me-title" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 id="me-title" className="text-2xl font-semibold text-gray-800">Me · {data.currentUserType}</h2><p className="mt-1 text-sm text-gray-600">What I need and how I take responsibility for myself.</p></div>{archivedCount ? <Button variant="ghost" size="sm" onClick={() => setShowArchived((value) => !value)} aria-expanded={showArchived}>{showArchived ? "Hide archived" : `Show archived (${archivedCount})`}</Button> : null}</div>
          <PersonalSection title="My boundaries" description="What I need and what I will do to care for myself." icon={<Shield className="h-5 w-5 text-rose-500" />} empty="Boundaries help your partner understand what you need to feel safe, respected and yourself." action={<Button size="sm" variant="outline" onClick={() => setBoundaryEditor(null)}><Plus className="mr-2 h-4 w-4" />Add boundary</Button>}>
            {myBoundaries.map((item) => <Card key={item.id} className="border-rose-100 bg-white/75"><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-gray-800">{item.title}</h4><Badge variant="outline">{categoryLabels[item.category]}</Badge></div><p className="mt-2 text-sm text-gray-600"><span className="font-medium">I need:</span> {item.whatINeed}</p><p className="mt-1 text-sm text-gray-600"><span className="font-medium">I will:</span> {item.whatIWillDo}</p></div><div className="flex"><Button variant="ghost" size="sm" aria-label={`Edit ${item.title}`} onClick={() => setBoundaryEditor(item)}><Pencil className="h-4 w-4" /></Button><ArchiveButton label="boundary" onArchive={() => archiveBoundary.mutate(item.id)} /></div></div></CardContent></Card>)}
          </PersonalSection>
          <PersonalSection title="My requests" description="Invitations that share what could help me feel connected, never obligations." icon={<Sparkles className="h-5 w-5 text-fuchsia-500" />} empty="Requests are ways to share what helps you feel loved and connected. They aren’t obligations." action={<Button size="sm" variant="outline" onClick={() => setRequestEditor(null)}><Plus className="mr-2 h-4 w-4" />Add request</Button>}>
            {myRequests.map((item) => <Card key={item.id} className="border-fuchsia-100 bg-fuchsia-50/40"><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h4 className="font-semibold text-gray-800">{item.title}</h4><Badge variant="outline">{item.importance.toLowerCase()}</Badge></div><p className="mt-2 text-sm text-gray-600">{item.description}</p><p className="mt-1 text-sm text-gray-500">Why it matters: {item.whyItMatters}</p></div><div className="flex"><Button variant="ghost" size="sm" aria-label={`Edit ${item.title}`} onClick={() => setRequestEditor(item)}><Pencil className="h-4 w-4" /></Button><ArchiveButton label="request" onArchive={() => archiveRequest.mutate(item.id)} /></div></div></CardContent></Card>)}
          </PersonalSection>
          <PersonalSection title="My growth goals" description="Personal intentions for what I want to practise in myself." icon={<Sprout className="h-5 w-5 text-amber-600" />} empty="Growth goals are personal intentions for how you want to grow. They stay private unless you choose to share them." action={<Button size="sm" variant="outline" onClick={() => setGoalEditor(null)}><Plus className="mr-2 h-4 w-4" />Add growth goal</Button>}>
            {myGoals.map((item) => <PersonalGoalCard key={item.id} goal={item} partnerName={data.partnerUserType} onEdit={() => setGoalEditor(item)} onArchive={() => archiveGoal.mutate(item.id)} />)}
          </PersonalSection>
          {showArchived ? <Card className="border-gray-200 bg-white/65"><CardHeader><CardTitle className="flex items-center gap-2 text-lg text-gray-800"><Archive className="h-5 w-5 text-gray-500" />Archived personal items</CardTitle></CardHeader><CardContent className="space-y-5">{data.archivedBoundaries.length ? <div className="space-y-2"><h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Boundaries</h4>{data.archivedBoundaries.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white/70 p-3"><div><p className="font-medium text-gray-800">{item.title}</p><p className="text-xs text-gray-500">Archived {item.archivedAt ? formatCareDate(item.archivedAt) : "previously"}</p></div><Button size="sm" variant="outline" disabled={restoreBoundary.isPending} onClick={() => restoreBoundary.mutate(item.id)}><RotateCcw className="mr-2 h-4 w-4" />Restore</Button></div>)}</div> : null}{data.archivedRequests.length ? <div className="space-y-2"><h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Requests</h4>{data.archivedRequests.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white/70 p-3"><div><p className="font-medium text-gray-800">{item.title}</p><p className="text-xs text-gray-500">Archived {item.archivedAt ? formatCareDate(item.archivedAt) : "previously"}</p></div><Button size="sm" variant="outline" disabled={restoreRequest.isPending} onClick={() => restoreRequest.mutate(item.id)}><RotateCcw className="mr-2 h-4 w-4" />Restore</Button></div>)}</div> : null}{data.archivedGoals.length ? <div className="space-y-2"><h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Growth goals</h4>{data.archivedGoals.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white/70 p-3"><div><p className="font-medium text-gray-800">{item.title}</p><p className="text-xs text-gray-500">Archived {item.archivedAt ? formatCareDate(item.archivedAt) : "previously"}</p></div><Button size="sm" variant="outline" disabled={restoreGoal.isPending} onClick={() => restoreGoal.mutate(item.id)}><RotateCcw className="mr-2 h-4 w-4" />Restore</Button></div>)}</div> : null}</CardContent></Card> : null}
        </section>

        <section aria-labelledby="partner-title" className="space-y-5">
          <div><h2 id="partner-title" className="text-2xl font-semibold text-gray-800">My partner · {data.partnerUserType}</h2><p className="mt-1 text-sm text-gray-600">Shared with you to help understanding, not for you to edit.</p></div>
          <PersonalSection title={`${data.partnerUserType}’s boundaries`} icon={<Shield className="h-5 w-5 text-sky-500" />} empty="Your partner hasn’t shared a boundary yet.">
            {partnerBoundaries.map((item) => <Card key={item.id} className="border-sky-100 bg-white/75"><CardContent className="p-4"><div className="flex items-center gap-2"><h4 className="font-semibold text-gray-800">{item.title}</h4><Badge variant="outline">Read only</Badge></div><p className="mt-2 text-sm text-gray-600"><span className="font-medium">They need:</span> {item.whatINeed}</p><p className="mt-1 text-sm text-gray-600"><span className="font-medium">They will:</span> {item.whatIWillDo}</p></CardContent></Card>)}
          </PersonalSection>
          <PersonalSection title={`${data.partnerUserType}’s requests`} icon={<HandHeart className="h-5 w-5 text-violet-500" />} empty="Your partner hasn’t shared a request yet.">
            {partnerRequests.map((item) => <Card key={item.id} className="border-violet-100 bg-violet-50/30"><CardContent className="p-4"><div className="flex items-center gap-2"><h4 className="font-semibold text-gray-800">{item.title}</h4><Badge variant="outline">Read only</Badge></div><p className="mt-2 text-sm text-gray-600">{item.description}</p><p className="mt-1 text-sm text-gray-500">Why it matters: {item.whyItMatters}</p></CardContent></Card>)}
          </PersonalSection>
          <PersonalSection title="Shared growth goals" icon={<Sprout className="h-5 w-5 text-amber-600" />} empty="Your partner hasn’t shared a growth goal with you.">
            {partnerGoals.map((item) => <PersonalGoalCard key={item.id} goal={item} partnerName={data.currentUserType} />)}
          </PersonalSection>
        </section>
      </div>

      <BoundaryDialog open={boundaryEditor !== undefined} onOpenChange={(open) => !open && setBoundaryEditor(undefined)} boundary={boundaryEditor ?? undefined} />
      <RequestDialog open={requestEditor !== undefined} onOpenChange={(open) => !open && setRequestEditor(undefined)} request={requestEditor ?? undefined} />
      <GoalDialog open={goalEditor !== undefined} onOpenChange={(open) => !open && setGoalEditor(undefined)} goal={goalEditor ?? undefined} />
    </RelationshipCareShell>
  );
};

const PersonalSection = ({ title, description, icon, empty, action, children }: { title: string; description?: string; icon: React.ReactNode; empty: string; action?: React.ReactNode; children: React.ReactNode }) => {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return <div className="space-y-3"><div className="flex items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">{icon}{title}</h3>{description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}</div>{action}</div>{items.length ? <div className="space-y-3">{children}</div> : <Card className="border-dashed bg-white/55"><CardContent className="p-5 text-sm text-gray-500">{empty}</CardContent></Card>}</div>;
};

import { useState } from "react";
import { Archive, CheckCircle2, History, MessageCircle, PencilLine, Scale, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAgreement, useAgreementAction } from "@/hooks/use-relationship-care";
import type { AgreementResponseType } from "@/types/relationship-care";
import {
  AgreementStatusBadge,
  RelationshipCareShell,
} from "./RelationshipCareShared";
import { formatCareDate } from "./relationship-care-ui";

export const AgreementDetailPage = () => {
  const { agreementId = "" } = useParams();
  const { data, isLoading, isError, error } = useAgreement(agreementId);
  const actions = useAgreementAction(agreementId);
  const [responseType, setResponseType] = useState<AgreementResponseType | null>(null);
  const [responseNote, setResponseNote] = useState("");

  if (isLoading) return <RelationshipCareShell title="Agreement" backTo="/boundaries-agreements"><Skeleton className="h-96" /></RelationshipCareShell>;
  if (isError || !data) return <RelationshipCareShell title="Agreement" backTo="/boundaries-agreements"><Card><CardContent className="p-6 text-red-700">{error?.message ?? "Agreement not found."}</CardContent></Card></RelationshipCareShell>;

  const { agreement, currentRevision: current, currentUserType, partnerUserType } = data;
  const revision = current.revision;
  const activeAcceptances = current.acceptances.filter((item) => !item.revokedAt);
  const myAcceptance = activeAcceptances.find((item) => item.userType === currentUserType);
  const partnerAcceptance = activeAcceptances.find((item) => item.userType === partnerUserType);
  const hasMyResponse = current.responses.some((item) => item.userType === currentUserType);
  const myPerspective = revision.perspectives.find((item) => item.userType === currentUserType);
  const partnerPerspective = revision.perspectives.find((item) => item.userType === partnerUserType);
  const myArchiveMark = agreement.archiveRequestedByUserTypes.includes(currentUserType);
  const otherArchiveMark = agreement.archiveRequestedByUserTypes.includes(partnerUserType);
  const pending = Object.values(actions).some((action) => action.isPending);

  const submitResponse = async () => {
    if (!responseType) return;
    await actions.respond.mutateAsync({ revisionId: revision.id, responseType, note: responseNote || undefined });
    setResponseType(null);
    setResponseNote("");
  };

  return (
    <RelationshipCareShell title={revision.title} description={`Revision ${revision.revisionNumber}`} backTo="/boundaries-agreements">
      <div className="space-y-6">
        <Card className="border-rose-100 bg-white/85">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle className="text-2xl text-gray-800">{revision.title}</CardTitle><p className="mt-2 text-sm text-gray-500">Updated {formatCareDate(agreement.updatedAt)}</p></div><AgreementStatusBadge status={agreement.status} /></div>
            {agreement.status === "AGREED" ? <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="h-5 w-5" /><p>Agreed by {currentUserType} and {partnerUserType} on this exact revision.</p></div> : null}
            {agreement.status !== "DRAFT" && agreement.status !== "AGREED" && agreement.status !== "ARCHIVED" ? <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-4 text-sm text-sky-900">{myAcceptance ? `You agreed. Waiting for ${partnerUserType}.` : hasMyResponse ? "You have responded. This remains open for care and conversation." : "This revision needs your response."}</div> : null}
            {myArchiveMark || otherArchiveMark ? <div className="rounded-lg border bg-white/70 p-4 text-sm text-gray-700">{myArchiveMark && otherArchiveMark ? "Both partners confirmed archiving." : myArchiveMark ? "You marked this for archive. It remains in revisit until your partner also confirms." : `${partnerUserType} marked this for archive. It will archive only if you confirm.`}</div> : null}
          </CardHeader>
          <CardContent className="space-y-7">
            <section><h2 className="text-lg font-semibold text-gray-800">Why this matters to us</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-gray-600">{revision.whyItMatters}</p></section>
            <section className="rounded-xl border border-rose-100 bg-rose-50/35 p-5"><h2 className="text-lg font-semibold text-gray-800">Our agreement</h2><p className="mt-2 whitespace-pre-wrap leading-7 text-gray-700">{revision.agreementText}</p></section>
            <div className="grid gap-4 md:grid-cols-2"><PerspectiveCard name={currentUserType} perspective={myPerspective} /><PerspectiveCard name={partnerUserType} perspective={partnerPerspective} /></div>
            <section className="rounded-xl border bg-white/70 p-5"><h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800"><Scale className="h-5 w-5 text-violet-500" />Fairness</h2><p className="mt-2 text-gray-600">{revision.fairnessType === "SYMMETRIC" ? "This commitment applies equally to both partners." : revision.fairnessExplanation}</p>{revision.fairnessType === "ASYMMETRIC" ? <Badge variant="outline" className="mt-3 border-violet-200 bg-violet-50 text-violet-800">Intentionally asymmetric</Badge> : null}</section>
          </CardContent>
        </Card>

        {agreement.status !== "ARCHIVED" ? <div className="flex flex-wrap gap-3">
          {data.canPropose ? <Button disabled={pending} onClick={() => actions.propose.mutate()} className="bg-rose-500 hover:bg-rose-600">Propose to partner</Button> : null}
          {data.canAccept ? <Button disabled={pending} onClick={() => actions.accept.mutate(revision.id)} className="bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="mr-2 h-4 w-4" />Agree</Button> : null}
          {myAcceptance && agreement.status !== "DRAFT" ? <Button variant="outline" disabled={pending} onClick={() => actions.revoke.mutate(revision.id)}><XCircle className="mr-2 h-4 w-4" />Revisit my agreement</Button> : null}
          {data.canEdit ? <Button asChild variant="outline"><Link to={`/boundaries-agreements/agreements/${agreement.id}/revise`}><PencilLine className="mr-2 h-4 w-4" />I’d like to change something</Link></Button> : null}
          {agreement.status !== "DRAFT" ? <><Button variant="outline" onClick={() => setResponseType("DISCUSS")}><MessageCircle className="mr-2 h-4 w-4" />I want to discuss this</Button><Button variant="ghost" onClick={() => setResponseType("NOT_COMFORTABLE")}>I’m not comfortable agreeing</Button></> : null}
          <div className="sm:ml-auto">{myArchiveMark && agreement.status !== "ARCHIVED" ? <Button variant="ghost" disabled={pending} onClick={() => actions.withdrawArchive.mutate()}>Undo archive request</Button> : <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" disabled={pending}><Archive className="mr-2 h-4 w-4" />Archive</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Archive this agreement?</AlertDialogTitle><AlertDialogDescription>{agreement.status === "DRAFT" ? "This private draft will be archived immediately." : "Your consent will be withdrawn now. The historical agreement archives only after your partner also confirms."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Keep it</AlertDialogCancel><AlertDialogAction onClick={() => actions.archive.mutate()}>Mark for archive</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>}</div>
        </div> : null}

        <Card className="border-gray-100 bg-white/75"><CardHeader><CardTitle className="flex items-center gap-2 text-gray-800"><History className="h-5 w-5 text-gray-500" />Revision history</CardTitle></CardHeader><CardContent className="space-y-4">{data.history.map((item) => <div key={item.revision.id} className="rounded-lg border p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-medium text-gray-800">Revision {item.revision.revisionNumber}</p><p className="text-sm text-gray-500">By {item.revision.createdByUserType} · {formatCareDate(item.revision.createdAt)}</p></div>{item.revision.agreedAt ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Agreed revision</Badge> : <Badge variant="outline">Not mutually agreed</Badge>}</div><p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm text-gray-600">{item.revision.agreementText}</p><p className="mt-2 text-xs text-gray-500">Accepted by {item.acceptances.length ? item.acceptances.map((entry) => `${entry.userType} on ${formatCareDate(entry.acceptedAt)}${entry.revokedAt ? " (later withdrawn)" : ""}`).join(" · ") : "no one yet"}</p></div>)}</CardContent></Card>
      </div>

      <Dialog open={Boolean(responseType)} onOpenChange={(open) => !open && setResponseType(null)}><DialogContent><DialogHeader><DialogTitle>{responseType === "DISCUSS" ? "What would you like to discuss?" : "It’s okay not to agree"}</DialogTitle><DialogDescription>{responseType === "DISCUSS" ? "Add an optional note so your partner knows what needs conversation." : "This will keep the agreement inactive and let your partner know you are not comfortable with this revision."}</DialogDescription></DialogHeader><Textarea aria-label="Optional note" placeholder="Optional note" rows={5} maxLength={2000} value={responseNote} onChange={(event) => setResponseNote(event.target.value)} /><DialogFooter><Button variant="outline" onClick={() => setResponseType(null)}>Cancel</Button><Button disabled={actions.respond.isPending} onClick={submitResponse}>Save response</Button></DialogFooter></DialogContent></Dialog>
    </RelationshipCareShell>
  );
};

const PerspectiveCard = ({ name, perspective }: { name: string; perspective?: { whatINeed?: string; whatICommitTo?: string; whyThisMattersToMe?: string } }) => <Card className="bg-white/65"><CardHeader><CardTitle className="text-lg text-gray-800">{name}’s part</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><div><p className="font-medium text-gray-700">What {name} needs</p><p className="mt-1 text-gray-600">{perspective?.whatINeed || "Not added yet."}</p></div><div><p className="font-medium text-gray-700">What {name} commits to</p><p className="mt-1 text-gray-600">{perspective?.whatICommitTo || "Not added yet."}</p></div>{perspective?.whyThisMattersToMe ? <div><p className="font-medium text-gray-700">Why this matters personally</p><p className="mt-1 text-gray-600">{perspective.whyThisMattersToMe}</p></div> : null}</CardContent></Card>;

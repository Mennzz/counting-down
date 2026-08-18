import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Check, ChevronLeft, ChevronRight, HeartHandshake } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useAgreement,
  useCreateAgreement,
  useCreateAgreementRevision,
} from "@/hooks/use-relationship-care";
import { relationshipCareApi } from "@/services/relationship-care";
import type { AgreementRevisionInput, FairnessType } from "@/types/relationship-care";
import { RelationshipCareShell } from "./RelationshipCareShared";

const emptyForm: AgreementRevisionInput = {
  title: "",
  whyItMatters: "",
  agreementText: "",
  fairnessType: "SYMMETRIC",
  fairnessExplanation: "",
  myPerspective: { whatINeed: "", whatICommitTo: "", whyThisMattersToMe: "" },
};

const stepNames = ["What we protect", "Our agreement", "My part", "Fairness", "Preview"];

export const AgreementEditorPage = () => {
  const { agreementId } = useParams();
  const isRevision = Boolean(agreementId);
  const agreementQuery = useAgreement(agreementId);
  const currentRevisionId = agreementQuery.data?.agreement.currentRevisionId ?? "";
  const createAgreement = useCreateAgreement();
  const createRevision = useCreateAgreementRevision(agreementId ?? "", currentRevisionId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<AgreementRevisionInput>(emptyForm);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!agreementQuery.data) return;
    const revision = agreementQuery.data.currentRevision.revision;
    const mine = revision.perspectives.find(
      (item) => item.userType === agreementQuery.data?.currentUserType,
    );
    setForm({
      title: revision.title,
      whyItMatters: revision.whyItMatters,
      agreementText: revision.agreementText,
      fairnessType: revision.fairnessType,
      fairnessExplanation: revision.fairnessExplanation ?? "",
      myPerspective: {
        whatINeed: mine?.whatINeed ?? "",
        whatICommitTo: mine?.whatICommitTo ?? "",
        whyThisMattersToMe: mine?.whyThisMattersToMe ?? "",
      },
    });
  }, [agreementQuery.data]);

  const stepValid = useMemo(() => {
    if (step === 0) return Boolean(form.title.trim() && form.whyItMatters.trim());
    if (step === 1) return Boolean(form.agreementText.trim());
    if (step === 3) {
      return form.fairnessType === "SYMMETRIC" || Boolean(form.fairnessExplanation?.trim());
    }
    return true;
  }, [form, step]);

  const next = () => {
    if (!stepValid) {
      setValidationError("Please complete the required fields before continuing.");
      return;
    }
    setValidationError("");
    setStep((value) => Math.min(4, value + 1));
  };

  const save = async (propose: boolean) => {
    if (!form.title.trim() || !form.whyItMatters.trim() || !form.agreementText.trim()) return;
    if (isRevision) {
      const detail = await createRevision.mutateAsync(form);
      navigate(`/boundaries-agreements/agreements/${detail.agreement.id}`);
      return;
    }
    const detail = await createAgreement.mutateAsync(form);
    if (propose) {
      try {
        await relationshipCareApi.proposeAgreement(detail.agreement.id);
        toast({ title: "Agreement proposed", description: "Your partner can now respond." });
      } catch (error) {
        toast({
          title: "Draft saved, but not proposed",
          description: error instanceof Error ? error.message : "Open the draft to try again.",
          variant: "destructive",
        });
      }
    }
    navigate(`/boundaries-agreements/agreements/${detail.agreement.id}`);
  };

  if (isRevision && agreementQuery.isLoading) {
    return <RelationshipCareShell title="Revise agreement" backTo={`/boundaries-agreements/agreements/${agreementId}`}><Skeleton className="h-96" /></RelationshipCareShell>;
  }
  if (isRevision && (agreementQuery.isError || !agreementQuery.data)) {
    return <RelationshipCareShell title="Revise agreement" backTo="/boundaries-agreements"><Card><CardContent className="p-6 text-red-700">{agreementQuery.error?.message ?? "Agreement not found."}</CardContent></Card></RelationshipCareShell>;
  }

  const pending = createAgreement.isPending || createRevision.isPending;

  return (
    <RelationshipCareShell
      title={isRevision ? "Shape a new revision" : "Create an agreement"}
      description="Take it one gentle step at a time. Nothing becomes active until you both agree to the same wording."
      backTo={isRevision ? `/boundaries-agreements/agreements/${agreementId}` : "/boundaries-agreements"}
    >
      <ol className="mb-6 grid grid-cols-5 gap-2" aria-label="Agreement creation progress">
        {stepNames.map((name, index) => <li key={name} className={`rounded-lg px-2 py-3 text-center text-xs sm:text-sm ${index === step ? "bg-rose-100 font-medium text-rose-700" : index < step ? "bg-emerald-50 text-emerald-700" : "bg-white/60 text-gray-500"}`} aria-current={index === step ? "step" : undefined}>{index < step ? <Check className="mx-auto mb-1 h-4 w-4" /> : <span className="mb-1 block font-semibold">{index + 1}</span>}<span className="hidden sm:inline">{name}</span></li>)}
      </ol>

      <Card className="border-rose-100 bg-white/85">
        <CardHeader><CardTitle>{stepNames[step]}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(event: FormEvent) => { event.preventDefault(); next(); }} className="space-y-5">
            {step === 0 ? <><div className="space-y-2"><Label htmlFor="agreement-title">What are we trying to protect?</Label><Input id="agreement-title" required maxLength={120} placeholder="Protecting us during conflict" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div className="space-y-2"><Label htmlFor="agreement-why">Why does this matter to us?</Label><Textarea id="agreement-why" required maxLength={2000} rows={5} value={form.whyItMatters} onChange={(e) => setForm({ ...form, whyItMatters: e.target.value })} /></div></> : null}
            {step === 1 ? <div className="space-y-2"><Label htmlFor="agreement-text">What would we like to agree?</Label><Textarea id="agreement-text" required maxLength={4000} rows={10} placeholder="Use concrete, mutual language that you can both freely choose." value={form.agreementText} onChange={(e) => setForm({ ...form, agreementText: e.target.value })} /><p className="text-sm text-gray-500">A proposal is not active until both of you accept this exact revision.</p></div> : null}
            {step === 2 ? <><p className="rounded-lg border border-rose-100 bg-rose-50/60 p-4 text-sm text-gray-600">Pair what you need with what you are willing to take responsibility for yourself. These fields are optional, but they make the agreement more reciprocal.</p><div className="space-y-2"><Label htmlFor="my-need">What do I need here?</Label><Textarea id="my-need" maxLength={1500} rows={4} value={form.myPerspective?.whatINeed} onChange={(e) => setForm({ ...form, myPerspective: { ...form.myPerspective, whatINeed: e.target.value } })} /></div><div className="space-y-2"><Label htmlFor="my-commitment">What am I personally committing to?</Label><Textarea id="my-commitment" maxLength={1500} rows={4} value={form.myPerspective?.whatICommitTo} onChange={(e) => setForm({ ...form, myPerspective: { ...form.myPerspective, whatICommitTo: e.target.value } })} /></div><div className="space-y-2"><Label htmlFor="my-why">Why does this matter to me? (optional)</Label><Textarea id="my-why" maxLength={1500} rows={3} value={form.myPerspective?.whyThisMattersToMe} onChange={(e) => setForm({ ...form, myPerspective: { ...form.myPerspective, whyThisMattersToMe: e.target.value } })} /></div></> : null}
            {step === 3 ? <><fieldset className="space-y-3"><legend className="font-medium text-gray-800">Does this apply equally to both of you?</legend><RadioGroup value={form.fairnessType} onValueChange={(value: FairnessType) => setForm({ ...form, fairnessType: value })}><div className="flex items-start gap-3 rounded-lg border p-4"><RadioGroupItem value="SYMMETRIC" id="symmetric" /><Label htmlFor="symmetric" className="font-normal"><span className="block font-medium">Yes, equally</span><span className="text-sm text-gray-500">The commitment applies to both partners in the same way.</span></Label></div><div className="flex items-start gap-3 rounded-lg border p-4"><RadioGroupItem value="ASYMMETRIC" id="asymmetric" /><Label htmlFor="asymmetric" className="font-normal"><span className="block font-medium">No, intentionally different</span><span className="text-sm text-gray-500">Different needs make a different arrangement appropriate.</span></Label></div></RadioGroup></fieldset>{form.fairnessType === "ASYMMETRIC" ? <div className="space-y-2"><Label htmlFor="fairness-explanation">Why does a different arrangement make sense?</Label><Textarea id="fairness-explanation" required maxLength={2000} rows={5} value={form.fairnessExplanation} onChange={(e) => setForm({ ...form, fairnessExplanation: e.target.value })} /></div> : null}</> : null}
            {step === 4 ? <div className="space-y-6"><div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5"><div className="flex items-center gap-2 text-rose-600"><HeartHandshake className="h-5 w-5" /><span className="text-sm font-medium">Our proposed agreement</span></div><h2 className="mt-3 text-2xl font-semibold text-gray-800">{form.title}</h2><h3 className="mt-5 font-semibold text-gray-800">Why this matters</h3><p className="mt-1 whitespace-pre-wrap text-gray-600">{form.whyItMatters}</p><h3 className="mt-5 font-semibold text-gray-800">What we agree</h3><p className="mt-1 whitespace-pre-wrap text-gray-700">{form.agreementText}</p><h3 className="mt-5 font-semibold text-gray-800">Fairness</h3><p className="mt-1 text-gray-600">{form.fairnessType === "SYMMETRIC" ? "This applies equally to both of us." : form.fairnessExplanation}</p></div></div> : null}

            {validationError ? <p role="alert" className="text-sm text-red-600">{validationError}</p> : null}
            <div className="flex flex-col-reverse justify-between gap-3 border-t pt-5 sm:flex-row">
              <Button type="button" variant="outline" disabled={step === 0 || pending} onClick={() => setStep((value) => Math.max(0, value - 1))}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>
              {step < 4 ? <Button type="submit" className="bg-rose-500 hover:bg-rose-600">Continue<ChevronRight className="ml-2 h-4 w-4" /></Button> : <div className="flex flex-col gap-3 sm:flex-row">{!isRevision ? <Button type="button" variant="outline" disabled={pending} onClick={() => save(false)}>Save draft</Button> : null}<Button type="button" disabled={pending} onClick={() => save(!isRevision)} className="bg-rose-500 hover:bg-rose-600">{pending ? "Saving…" : isRevision ? "Save new revision" : "Propose to partner"}</Button></div>}
            </div>
          </form>
        </CardContent>
      </Card>
    </RelationshipCareShell>
  );
};

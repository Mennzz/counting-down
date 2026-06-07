import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useMediationSession,
  useMyPerspective,
  useMyReflection,
  useSaveMyPerspectiveDraft,
  useSubmitMyPerspective,
} from "@/hooks/use-mediation";
import type { SavePerspectiveDraftRequest } from "@/types/mediation";
import { MediationPageShell, PrivateReflectionCard, SessionStateNotice } from "./MediationShared";
import { isSessionReadOnly } from "./mediation-ui";

const emptyDraft: SavePerspectiveDraftRequest = {
  what_happened: "",
  what_i_felt: "",
  what_i_needed: "",
  what_hurt_me: "",
  my_part: "",
  what_i_want_now: "",
  free_text: "",
};

const fields: Array<{ key: keyof SavePerspectiveDraftRequest; label: string; placeholder: string }> = [
  { key: "what_happened", label: "What happened", placeholder: "Describe the situation as clearly as you can." },
  { key: "what_i_felt", label: "What I felt", placeholder: "Name the feelings that came up for you." },
  { key: "what_i_needed", label: "What I needed", placeholder: "What need was underneath those feelings?" },
  { key: "what_hurt_me", label: "What hurt me", placeholder: "What landed painfully or felt difficult?" },
  { key: "my_part", label: "My part", placeholder: "What do you want to own or understand about your side?" },
  { key: "what_i_want_now", label: "What I want now", placeholder: "What would help now?" },
  { key: "free_text", label: "Free text", placeholder: "Anything else you want the mediator to know." },
];

export const MediationPerspectivePage = () => {
  const { sessionId = "" } = useParams();
  const { data: session, isLoading: isSessionLoading } = useMediationSession(sessionId);
  const { data: perspective, isLoading: isPerspectiveLoading } = useMyPerspective(sessionId);
  const perspectiveSubmitted =
    perspective?.status === "SUBMITTED_PENDING_REVIEW" ||
    perspective?.status === "LOCKED" ||
    session?.my_perspective?.status === "SUBMITTED_PENDING_REVIEW" ||
    session?.my_perspective?.status === "LOCKED";
  const shouldFetchReflection =
    session?.my_reflection_status === "PROCESSING" ||
    session?.my_reflection_status === "AVAILABLE" ||
    perspectiveSubmitted;
  const reflectionQuery = useMyReflection(sessionId, shouldFetchReflection);
  const saveDraft = useSaveMyPerspectiveDraft(sessionId);
  const submitPerspective = useSubmitMyPerspective(sessionId);
  const [draft, setDraft] = useState<SavePerspectiveDraftRequest>(emptyDraft);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!perspective) return;

    setDraft({
      what_happened: perspective.what_happened ?? "",
      what_i_felt: perspective.what_i_felt ?? "",
      what_i_needed: perspective.what_i_needed ?? "",
      what_hurt_me: perspective.what_hurt_me ?? "",
      my_part: perspective.my_part ?? "",
      what_i_want_now: perspective.what_i_want_now ?? "",
      free_text: perspective.free_text ?? "",
    });
  }, [perspective]);

  if (isSessionLoading || isPerspectiveLoading) {
    return (
      <MediationPageShell title="Perspective" backTo={`/mediation/${sessionId}`}>
        <Skeleton className="h-96 w-full" />
      </MediationPageShell>
    );
  }

  const locked = perspective?.status === "LOCKED";
  const pendingReview = perspective?.status === "SUBMITTED_PENDING_REVIEW";
  const readOnly = locked || pendingReview || isSessionReadOnly(session);
  const reflectionFromContent = reflectionQuery.data?.content
    ? { content: reflectionQuery.data.content }
    : null;
  const reflection = session?.my_reflection ?? reflectionQuery.data?.reflection ?? reflectionFromContent;
  const reflectionStatus =
    reflectionQuery.data?.status === "NONE" && perspectiveSubmitted
      ? "PROCESSING"
      : reflectionQuery.data?.status ?? session?.my_reflection_status ?? reflection?.status;

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    await saveDraft.mutateAsync(draft);

    // Route back to the session dashboard after saving, unless the perspective is already submitted, in which case we want to stay on the perspective page
    if (!perspectiveSubmitted) {
      window.location.href = `/mediation/${sessionId}`;
    }
  };

  const handleSubmit = async () => {
    setSubmitError("");

    const hasContent = Object.values(draft).some((value) => value?.trim());
    if (!hasContent && !locked) {
      setSubmitError("Add at least one part of your perspective before submitting.");
      return;
    }

    if (!locked) {
      await saveDraft.mutateAsync(draft);
    }
    await submitPerspective.mutateAsync();
  };

  return (
    <MediationPageShell title="My perspective" backTo={`/mediation/${sessionId}`}>
      <div className="space-y-6">
        {session ? <SessionStateNotice session={session} /> : null}

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-gray-800">
              {locked || pendingReview ? "Submitted perspective" : "Private draft"}
            </CardTitle>
            {locked ? <span className="text-sm font-medium text-emerald-700">Locked</span> : null}
            {pendingReview ? (
              <span className="text-sm font-medium text-amber-700">Checking</span>
            ) : null}
          </CardHeader>
          <CardContent>
            {pendingReview ? (
              <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Submitted. Checking safety and preparing reflection...
              </p>
            ) : null}
            <form onSubmit={handleSave} className="space-y-5">
              {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Textarea
                    id={field.key}
                    value={draft[field.key] ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                    placeholder={field.placeholder}
                    rows={3}
                    disabled={readOnly || saveDraft.isPending || submitPerspective.isPending}
                  />
                </div>
              ))}

              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button asChild variant="outline">
                  <Link to={`/mediation/${sessionId}`}>Session dashboard</Link>
                </Button>
                {!readOnly ? (
                  <div className="flex gap-3">
                    <Button type="submit" variant="outline" disabled={saveDraft.isPending || submitPerspective.isPending}>
                      {saveDraft.isPending ? "Saving..." : "Save draft"}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={saveDraft.isPending || submitPerspective.isPending}
                      className="bg-rose-500 hover:bg-rose-600"
                    >
                      {submitPerspective.isPending ? "Submitting..." : "Submit perspective"}
                    </Button>
                  </div>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <PrivateReflectionCard
          reflection={reflection}
          status={reflectionStatus}
          isLoading={reflectionQuery.isLoading && shouldFetchReflection}
        />
      </div>
    </MediationPageShell>
  );
};

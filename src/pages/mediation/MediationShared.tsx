import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { AlertTriangle, Archive, CheckCircle2, Clock, EyeOff, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AIOutputStatus,
  MediationSessionDetailResponse,
  MediationSessionStatus,
  PrivateReflectionOutput,
  SafetyStatus,
} from "@/types/mediation";
import { enumLabel, statusLabel } from "./mediation-ui";

export const StatusBadge = ({ status }: { status: MediationSessionStatus }) => {
  const variant = status === "ARCHIVED" || status === "RESOLVED" ? "secondary" : "default";
  return <Badge variant={variant}>{statusLabel(status)}</Badge>;
};

export const SafetyBadge = ({ safetyStatus }: { safetyStatus: SafetyStatus }) => {
  if (safetyStatus === "NORMAL") return null;

  return (
    <Badge variant={safetyStatus === "BLOCKED" ? "destructive" : "secondary"}>
      {safetyStatus === "BLOCKED" ? "Safety pause" : enumLabel(safetyStatus)}
    </Badge>
  );
};

export const MediationPageShell = ({
  children,
  title,
  description,
  backTo,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  backTo?: string;
}) => (
  <div className="min-h-screen romantic-gradient">
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-playfair font-semibold text-rose-600">{title}</h1>
          {description ? <p className="mt-2 text-gray-600">{description}</p> : null}
        </div>
        <Button asChild variant="outline">
          <Link to={backTo ?? "/"}>{backTo ? "Back" : "Home"}</Link>
        </Button>
      </div>
      {children}
    </main>
  </div>
);

const ReflectionSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div>
    <h3 className="font-medium text-gray-800">{title}</h3>
    <div className="mt-1 text-gray-700">{children}</div>
  </div>
);

const ReflectionList = ({ items }: { items?: string[] | null }) => {
  if (!items?.length) return null;

  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};

const PrivateReflectionTitle = () => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
    <CardTitle className="text-gray-800">Private reflection</CardTitle>
    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
      <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
      Only visible to you
    </span>
  </div>
);

export const PrivateReflectionCard = ({
  reflection,
  status,
  isLoading = false,
}: {
  reflection?: PrivateReflectionOutput | null;
  status?: AIOutputStatus;
  isLoading?: boolean;
}) => {
  const resolvedStatus = status ?? reflection?.status;

  if (resolvedStatus === "PROCESSING" || isLoading) {
    return (
      <Card>
        <CardHeader>
          <PrivateReflectionTitle />
        </CardHeader>
        <CardContent>
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Private reflection processing. This page will refresh automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (resolvedStatus === "FAILED" || resolvedStatus === "BLOCKED") {
    return (
      <Card>
        <CardHeader>
          <PrivateReflectionTitle />
        </CardHeader>
        <CardContent>
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            The private reflection could not be prepared right now. The mediation may need a little
            extra care before AI guidance is available.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (resolvedStatus !== "AVAILABLE" || !reflection) return null;

  const hasStructuredContent =
    reflection.emotional_reflection ||
    reflection.calming_exercise ||
    reflection.possible_underlying_needs?.length ||
    reflection.things_to_avoid_right_now?.length ||
    reflection.next_best_action ||
    reflection.neutral_reminder ||
    reflection.safety_note;

  if (!hasStructuredContent && !reflection.content) return null;

  return (
    <Card>
      <CardHeader>
        <PrivateReflectionTitle />
      </CardHeader>
      <CardContent className="space-y-4">
        {reflection.content ? <p className="whitespace-pre-wrap text-gray-700">{reflection.content}</p> : null}
        {reflection.emotional_reflection ? (
          <ReflectionSection title="Emotional reflection">
            <p className="whitespace-pre-wrap">{reflection.emotional_reflection}</p>
          </ReflectionSection>
        ) : null}
        {reflection.calming_exercise ? (
          <ReflectionSection title="Calming exercise">
            <p className="whitespace-pre-wrap">{reflection.calming_exercise}</p>
          </ReflectionSection>
        ) : null}
        {reflection.possible_underlying_needs?.length ? (
          <ReflectionSection title="Possible underlying needs">
            <ReflectionList items={reflection.possible_underlying_needs} />
          </ReflectionSection>
        ) : null}
        {reflection.things_to_avoid_right_now?.length ? (
          <ReflectionSection title="Things to avoid right now">
            <ReflectionList items={reflection.things_to_avoid_right_now} />
          </ReflectionSection>
        ) : null}
        {reflection.next_best_action ? (
          <ReflectionSection title="Next best action">
            <p className="whitespace-pre-wrap">{reflection.next_best_action}</p>
          </ReflectionSection>
        ) : null}
        {reflection.neutral_reminder ? (
          <ReflectionSection title="Neutral reminder">
            <p className="whitespace-pre-wrap">{reflection.neutral_reminder}</p>
          </ReflectionSection>
        ) : null}
        {reflection.safety_note ? (
          <ReflectionSection title="Safety note">
            <p className="whitespace-pre-wrap">{reflection.safety_note}</p>
          </ReflectionSection>
        ) : null}
      </CardContent>
    </Card>
  );
};

export const SessionStateNotice = ({ session }: { session: MediationSessionDetailResponse }) => {
  if (session.safety_status === "BLOCKED") {
    return (
      <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">This mediation has paused for safety.</p>
          <p className="text-sm">Normal mediation actions are hidden while this session is blocked.</p>
        </div>
      </div>
    );
  }

  if (session.status !== "ARCHIVED" && session.status !== "RESOLVED" && session.has_marked_resolved) {
    return (
      <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">You marked this mediation resolved.</p>
          <p className="text-sm">Waiting for the other person before it becomes fully resolved.</p>
        </div>
      </div>
    );
  }

  if (session.status !== "ARCHIVED" && session.status !== "RESOLVED" && session.other_has_marked_resolved) {
    return (
      <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">The other person marked this mediation resolved.</p>
          <p className="text-sm">It becomes fully resolved if you also confirm.</p>
        </div>
      </div>
    );
  }

  if (session.status !== "ARCHIVED" && session.status !== "RESOLVED" && session.has_marked_archived) {
    return (
      <div className="flex gap-3 rounded-lg border border-gray-200 bg-white/70 p-4 text-gray-700">
        <Archive className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">You marked this mediation for archive.</p>
          <p className="text-sm">Because it is unresolved, archiving needs both people to confirm.</p>
        </div>
      </div>
    );
  }

  if (session.status !== "ARCHIVED" && session.status !== "RESOLVED" && session.other_has_marked_archived) {
    return (
      <div className="flex gap-3 rounded-lg border border-gray-200 bg-white/70 p-4 text-gray-700">
        <Archive className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">The other person marked this mediation for archive.</p>
          <p className="text-sm">It will archive if you also confirm.</p>
        </div>
      </div>
    );
  }

  if (session.status === "ARCHIVED") {
    return (
      <div className="flex gap-3 rounded-lg border border-gray-200 bg-white/70 p-4 text-gray-700">
        <Archive className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">This session is archived.</p>
          <p className="text-sm">Everything is read-only.</p>
        </div>
      </div>
    );
  }

  if (session.status === "RESOLVED") {
    return (
      <div className="flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">This mediation is resolved.</p>
          <p className="text-sm">Drafts and discussion are read-only.</p>
        </div>
      </div>
    );
  }

  if (session.status === "AI_MEDIATION_PROCESSING") {
    return (
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <Clock className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">AI mediation is processing.</p>
          <p className="text-sm">This page will refresh automatically while results are being prepared.</p>
        </div>
      </div>
    );
  }

  if (session.my_perspective?.status === "SUBMITTED_PENDING_REVIEW") {
    return (
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <Clock className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Submitted. Checking safety and preparing reflection...</p>
          <p className="text-sm">This page will refresh automatically.</p>
        </div>
      </div>
    );
  }

  if (session.safety_status === "FLAGGED" || session.safety_status === "NEEDS_REVIEW") {
    return (
      <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">This mediation needs extra care.</p>
          <p className="text-sm">Proceed thoughtfully and watch for any safety guidance.</p>
        </div>
      </div>
    );
  }

  return null;
};

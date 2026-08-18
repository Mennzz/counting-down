import type { ReactNode } from "react";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AgreementStatus } from "@/types/relationship-care";

const statusLabels: Record<AgreementStatus, string> = {
  DRAFT: "Draft",
  PROPOSED: "Waiting for your partner",
  DISCUSSING: "Discuss together",
  AGREED: "Agreed together",
  REVISIT: "Being revisited",
  ARCHIVED: "Archived",
};

const statusClasses: Record<AgreementStatus, string> = {
  DRAFT: "border-gray-200 bg-gray-50 text-gray-700",
  PROPOSED: "border-sky-200 bg-sky-50 text-sky-800",
  DISCUSSING: "border-amber-200 bg-amber-50 text-amber-800",
  AGREED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REVISIT: "border-violet-200 bg-violet-50 text-violet-800",
  ARCHIVED: "border-gray-200 bg-gray-100 text-gray-600",
};

export const RelationshipCareShell = ({
  title,
  description,
  backTo = "/",
  children,
}: {
  title: string;
  description?: string;
  backTo?: string;
  children: ReactNode;
}) => (
  <div className="min-h-screen romantic-gradient">
    <header className="border-b border-rose-100 bg-white/75 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Button asChild variant="ghost" className="text-gray-600">
          <Link to={backTo}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </Button>
        <Link to="/" className="flex items-center gap-2 text-rose-600">
          <HeartHandshake className="h-5 w-5" aria-hidden="true" />
          <span className="font-playfair font-semibold">BIBI Dairy</span>
        </Link>
      </div>
    </header>
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800 sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-gray-600">{description}</p> : null}
        </div>
        {children}
      </div>
    </main>
  </div>
);

export const AgreementStatusBadge = ({ status }: { status: AgreementStatus }) => (
  <Badge variant="outline" className={statusClasses[status]}>
    {statusLabels[status]}
  </Badge>
);

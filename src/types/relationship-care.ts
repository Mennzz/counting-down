export type RelationshipUserType = "Joris" | "Danfeng";

export type RelationshipCareCategory =
  | "CONFLICT"
  | "PRIVACY"
  | "TRUST"
  | "AUTONOMY"
  | "COMMUNICATION"
  | "INTIMACY"
  | "FAMILY"
  | "TIME"
  | "SOCIAL_LIFE"
  | "OTHER";

export type RequestImportance = "LOW" | "MEDIUM" | "HIGH";
export type AgreementStatus =
  | "DRAFT"
  | "PROPOSED"
  | "DISCUSSING"
  | "AGREED"
  | "REVISIT"
  | "ARCHIVED";
export type FairnessType = "SYMMETRIC" | "ASYMMETRIC";
export type AgreementResponseType = "DISCUSS" | "NOT_COMFORTABLE";
export type GoalVisibility = "PRIVATE" | "SHARED_WITH_PARTNER";
export type PersonalGoalCategory =
  | "EMOTIONAL_REGULATION"
  | "CONFLICT"
  | "COMMUNICATION"
  | "TRUST"
  | "AUTONOMY"
  | "INTIMACY"
  | "ATTACHMENT"
  | "SELF_RESPECT"
  | "OTHER";

export interface PersonalBoundary {
  id: string;
  ownerUserType: RelationshipUserType;
  title: string;
  whatINeed: string;
  whatIWillDo: string;
  whyThisMatters?: string | null;
  category: RelationshipCareCategory;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  isMine: boolean;
}

export interface PersonalBoundaryInput {
  title: string;
  whatINeed: string;
  whatIWillDo: string;
  whyThisMatters?: string;
  category: RelationshipCareCategory;
}

export interface RelationshipRequest {
  id: string;
  ownerUserType: RelationshipUserType;
  title: string;
  description: string;
  whyItMatters: string;
  ideas?: string | null;
  importance: RequestImportance;
  category: RelationshipCareCategory;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  isMine: boolean;
}

export interface RelationshipRequestInput {
  title: string;
  description: string;
  whyItMatters: string;
  ideas?: string;
  importance: RequestImportance;
  category: RelationshipCareCategory;
}

export interface PersonalGoal {
  id: string;
  ownerUserType: RelationshipUserType;
  title: string;
  goal: string;
  whyItMatters?: string | null;
  trigger?: string | null;
  practice?: string | null;
  reminder?: string | null;
  category: PersonalGoalCategory;
  visibility: GoalVisibility;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  isMine: boolean;
}

export interface PersonalGoalInput {
  title: string;
  goal: string;
  whyItMatters?: string;
  trigger?: string;
  practice?: string;
  reminder?: string;
  category: PersonalGoalCategory;
  visibility: GoalVisibility;
}

export interface MyAgreementPerspective {
  whatINeed?: string;
  whatICommitTo?: string;
  whyThisMattersToMe?: string;
}

export interface AgreementPerspective extends MyAgreementPerspective {
  userType: RelationshipUserType;
}

export interface AgreementRevisionInput {
  title: string;
  whyItMatters: string;
  agreementText: string;
  fairnessType: FairnessType;
  fairnessExplanation?: string;
  myPerspective?: MyAgreementPerspective;
}

export interface AgreementRevision extends Omit<AgreementRevisionInput, "myPerspective"> {
  id: string;
  agreementId: string;
  revisionNumber: number;
  perspectives: AgreementPerspective[];
  createdByUserType: RelationshipUserType;
  createdAt: string;
  agreedAt?: string | null;
}

export interface AgreementAcceptance {
  id: string;
  agreementId: string;
  revisionId: string;
  userType: RelationshipUserType;
  acceptedAt: string;
  revokedAt?: string | null;
}

export interface AgreementResponse {
  id: string;
  agreementId: string;
  revisionId: string;
  userType: RelationshipUserType;
  responseType: AgreementResponseType;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RelationshipAgreement {
  id: string;
  createdByUserType: RelationshipUserType;
  status: AgreementStatus;
  currentRevisionId: string;
  currentRevisionNumber: number;
  lastAgreedRevisionId?: string | null;
  createdAt: string;
  updatedAt: string;
  proposedAt?: string | null;
  revisitedAt?: string | null;
  archiveRequestedByUserTypes: RelationshipUserType[];
  archivedAt?: string | null;
}

export interface AgreementSummary {
  id: string;
  status: AgreementStatus;
  title: string;
  agreementText: string;
  fairnessType: FairnessType;
  revisionNumber: number;
  updatedAt: string;
  isCreator: boolean;
  hasMyAcceptance: boolean;
  hasPartnerAcceptance: boolean;
  needsMyResponse: boolean;
}

export interface AgreementRevisionView {
  revision: AgreementRevision;
  acceptances: AgreementAcceptance[];
  responses: AgreementResponse[];
}

export interface AgreementDetail {
  agreement: RelationshipAgreement;
  currentRevision: AgreementRevisionView;
  history: AgreementRevisionView[];
  currentUserType: RelationshipUserType;
  partnerUserType: RelationshipUserType;
  canEdit: boolean;
  canPropose: boolean;
  canAccept: boolean;
}

export interface RelationshipCareOverview {
  currentUserType: RelationshipUserType;
  partnerUserType: RelationshipUserType;
  agreementCounts: Record<AgreementStatus, number>;
  agreements: AgreementSummary[];
  boundaries: PersonalBoundary[];
  requests: RelationshipRequest[];
  archivedBoundaries: PersonalBoundary[];
  archivedRequests: RelationshipRequest[];
  goals: PersonalGoal[];
  archivedGoals: PersonalGoal[];
}

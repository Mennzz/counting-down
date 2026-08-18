import type {
  AgreementRevisionInput,
  PersonalBoundaryInput,
  PersonalGoalInput,
} from "@/types/relationship-care";

export type XiaoBaoMessageRole = "USER" | "ASSISTANT";
export type XiaoBaoMessageStatus = "GENERATING" | "COMPLETE" | "FAILED" | "CANCELLED";
export type XiaoBaoMascotMood = "IDLE" | "LOVE" | "CONCERNED";
export type XiaoBaoProposalType =
  | "PERSONAL_BOUNDARY"
  | "PERSONAL_GOAL"
  | "SHARED_AGREEMENT"
  | "TOGETHER_LIST_ITEM"
  | "MEDIATION_SESSION"
  | "MEDIATION_COMMENT"
  | "MEDIATION_PERSPECTIVE_DRAFT";
export type XiaoBaoProposalStatus = "PENDING" | "ACCEPTING" | "ACCEPTED" | "REJECTED";

export interface XiaoBaoContextReference {
  key: string;
  type: string;
  id: string;
  title: string;
}

export interface XiaoBaoCompletedAction {
  type: string;
  entityId: string;
  title: string;
}

export interface XiaoBaoConversation {
  id: string;
  ownerUserType: "Joris" | "Danfeng";
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface XiaoBaoMessage {
  id: string;
  conversationId: string;
  role: XiaoBaoMessageRole;
  status: XiaoBaoMessageStatus;
  content: string;
  clientMessageId?: string;
  parentUserMessageId?: string;
  contextReferences: XiaoBaoContextReference[];
  proposalIds: string[];
  completedActions: XiaoBaoCompletedAction[];
  mascotMood?: XiaoBaoMascotMood | null;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface XiaoBaoTogetherListPayload {
  title: string;
  category: "Date" | "Adventure" | "Home" | "Food" | "Culture" | "Activity" | "Movie";
}

export interface XiaoBaoMediationSessionPayload {
  title: string;
  description?: string;
}

export interface XiaoBaoMediationCommentPayload {
  content: string;
}

export interface XiaoBaoMediationPerspectiveDraftPayload {
  whatHappened?: string | null;
  whatIFelt?: string | null;
  whatINeeded?: string | null;
  whatHurtMe?: string | null;
  myPart?: string | null;
  whatIWantNow?: string | null;
  freeText?: string | null;
}

export interface XiaoBaoProposalTarget {
  type: "MEDIATION_SESSION";
  id: string;
  title: string;
}

export type XiaoBaoProposalPayload =
  | PersonalBoundaryInput
  | PersonalGoalInput
  | AgreementRevisionInput
  | XiaoBaoTogetherListPayload
  | XiaoBaoMediationSessionPayload
  | XiaoBaoMediationCommentPayload
  | XiaoBaoMediationPerspectiveDraftPayload;

export interface XiaoBaoProposal {
  id: string;
  conversationId: string;
  messageId: string;
  ownerUserType: "Joris" | "Danfeng";
  type: XiaoBaoProposalType;
  payload: XiaoBaoProposalPayload;
  target?: XiaoBaoProposalTarget;
  rationale?: string;
  status: XiaoBaoProposalStatus;
  revision: number;
  createdAt: string;
  updatedAt: string;
  decidedAt?: string;
  createdEntityId?: string;
}

export interface XiaoBaoConversationDetail {
  conversation: XiaoBaoConversation;
  messages: XiaoBaoMessage[];
  proposals: XiaoBaoProposal[];
  hasMoreMessages: boolean;
}

export type XiaoBaoSseEvent =
  | { type: "message.accepted"; message: XiaoBaoMessage }
  | { type: "assistant.started"; message: XiaoBaoMessage }
  | { type: "assistant.delta"; delta: string }
  | { type: "action.completed"; proposalIds: string[]; completedActions: XiaoBaoCompletedAction[] }
  | { type: "assistant.completed"; message: XiaoBaoMessage; proposals: XiaoBaoProposal[] }
  | { type: "assistant.failed"; message: XiaoBaoMessage; retryable: boolean };

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
  | "MEDIATION_PERSPECTIVE_DRAFT"
  | "ROUTINE"
  | "REMINDER";
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
  purpose?: "CHAT" | "ROUTINE_INBOX";
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
  source?: "INTERACTIVE" | "ROUTINE";
  routineId?: string;
  routineRunId?: string;
  readAt?: string | null;
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

export type XiaoBaoRoutineFrequency = "ONCE" | "DAILY" | "WEEKLY";
export type XiaoBaoScheduledItemKind = "REMINDER" | "ROUTINE";
export type XiaoBaoRoutineWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type XiaoBaoRoutineContextProfile = "RELATIONSHIP_CARE";
export type XiaoBaoRoutinePauseReason = "MANUAL" | "UNREAD_INACTIVITY";
export type XiaoBaoRoutineRunStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface XiaoBaoRoutineSchedule {
  frequency: XiaoBaoRoutineFrequency;
  localDate?: string | null;
  localTime: string;
  timezone: string;
  weekdays: XiaoBaoRoutineWeekday[];
}

export interface XiaoBaoRoutineInput {
  kind: XiaoBaoScheduledItemKind;
  name: string;
  /** A recurring routine's server-side generation instruction. */
  instruction?: string | null;
  /** A one-time reminder's exact, static inbox text. */
  message?: string | null;
  schedule: XiaoBaoRoutineSchedule;
  contextProfile: XiaoBaoRoutineContextProfile;
}

export type XiaoBaoRoutineProposalPayload = XiaoBaoRoutineInput;
export type XiaoBaoReminderProposalPayload = XiaoBaoRoutineInput;

export interface XiaoBaoRoutine extends XiaoBaoRoutineInput {
  id: string;
  deliveryChannel: "IN_APP";
  enabled: boolean;
  nextRunAt?: string | null;
  lastScheduledFor?: string | null;
  finishedAt?: string | null;
  finishReason?: "DELIVERED" | "FAILED" | null;
  pauseReason: XiaoBaoRoutinePauseReason | null;
  pausedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface XiaoBaoRoutineRun {
  id: string;
  routineId: string;
  scheduledFor: string;
  localScheduledAt: string;
  timezoneSnapshot: string;
  status: XiaoBaoRoutineRunStatus;
  attemptCount: number;
  outputMessageId?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface XiaoBaoRoutineRunList {
  items: XiaoBaoRoutineRun[];
  hasMore: boolean;
}

export interface XiaoBaoInboxUnreadCount {
  unreadCount: number;
}

export interface XiaoBaoInboxMessage {
  id: string;
  content: string;
  mascotMood?: XiaoBaoMascotMood | null;
  routineId: string;
  routineRunId: string;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface XiaoBaoInbox {
  messages: XiaoBaoInboxMessage[];
  hasMoreMessages: boolean;
  unreadCount: number;
  nextCursor: string | null;
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
  | XiaoBaoMediationPerspectiveDraftPayload
  | XiaoBaoRoutineProposalPayload;

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

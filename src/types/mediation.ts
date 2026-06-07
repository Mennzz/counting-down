export type UserType = "Joris" | "Danfeng";

export type MediationSessionStatus =
  | "AWAITING_PERSPECTIVES"
  | "PARTIAL_PERSPECTIVE_SUBMITTED"
  | "BOTH_PERSPECTIVES_SUBMITTED"
  | "AI_MEDIATION_PROCESSING"
  | "AI_ADVICE_AVAILABLE"
  | "DISCUSSION_OPEN"
  | "RESOLVED"
  | "ARCHIVED";

export type SafetyStatus = "NORMAL" | "FLAGGED" | "BLOCKED" | "NEEDS_REVIEW";

export type PerspectiveStatus = "DRAFT" | "SUBMITTED_PENDING_REVIEW" | "LOCKED" | "FLAGGED";

export type AIOutputStatus = "NONE" | "NOT_STARTED" | "PROCESSING" | "AVAILABLE" | "FAILED" | "BLOCKED";

export type MediationAIJobStatus = "PENDING" | "PROCESSING" | "SUCCEEDED" | "FAILED";

export interface CreateMediationSessionRequest {
  title: string;
  description?: string;
}

export interface MediationSessionListItem {
  id: string;
  title: string;
  description?: string | null;
  created_by_user_type?: UserType;
  status: MediationSessionStatus;
  safety_status: SafetyStatus;
  has_my_perspective?: boolean;
  has_other_perspective?: boolean;
  has_advice?: boolean;
  has_marked_resolved?: boolean;
  other_has_marked_resolved?: boolean;
  has_marked_archived?: boolean;
  other_has_marked_archived?: boolean;
  my_perspective_exists?: boolean;
  other_perspective_exists?: boolean;
  my_reflection_status?: AIOutputStatus;
  advice_status?: AIOutputStatus;
  created_at: string;
  updated_at?: string | null;
  resolved_at?: string | null;
  archived_at?: string | null;
}

export interface MediationPerspective {
  id?: string;
  session_id?: string;
  status: PerspectiveStatus;
  what_happened?: string | null;
  what_i_felt?: string | null;
  what_i_needed?: string | null;
  what_hurt_me?: string | null;
  my_part?: string | null;
  what_i_want_now?: string | null;
  free_text?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  submitted_at?: string | null;
}

export type SavePerspectiveDraftRequest = Pick<
  MediationPerspective,
  | "what_happened"
  | "what_i_felt"
  | "what_i_needed"
  | "what_hurt_me"
  | "my_part"
  | "what_i_want_now"
  | "free_text"
>;

export interface PrivateReflectionOutput {
  emotional_reflection?: string | null;
  calming_exercise?: string | null;
  possible_underlying_needs?: string[] | null;
  things_to_avoid_right_now?: string[] | null;
  next_best_action?: string | null;
  neutral_reminder?: string | null;
  safety_note?: string | null;
  // Legacy/client-friendly fields kept for older API responses.
  status?: AIOutputStatus;
  content?: string | null;
  safety_status?: SafetyStatus;
  created_at?: string | null;
  updated_at?: string | null;
  error_message?: string | null;
}

export interface MediationAdviceTask {
  title: string;
  description: string;
}

export interface SharedMediationAdviceOutput {
  status?: AIOutputStatus;
  neutral_summary?: string | null;
  joris_likely_feelings_and_needs?: string[] | null;
  danfeng_likely_feelings_and_needs?: string[] | null;
  shared_conflict_pattern?: string | null;
  points_of_agreement?: string[] | null;
  points_of_misunderstanding?: string[] | null;
  suggested_conversation_script?: string[] | null;
  tasks_for_joris?: MediationAdviceTask[] | null;
  tasks_for_danfeng?: MediationAdviceTask[] | null;
  joint_task?: MediationAdviceTask | null;
  what_to_avoid?: string[] | null;
  summary?: string | null;
  shared_understanding?: string | null;
  suggested_next_steps?: string[] | null;
  conversation_starters?: string[] | null;
  content?: string | null;
  safety_status?: SafetyStatus;
  created_at?: string | null;
  updated_at?: string | null;
  error_message?: string | null;
}

export interface MediationAIJob {
  id: string;
  session_id: string;
  job_type: string;
  status: MediationAIJobStatus;
  error_message?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface SubmitPerspectiveResponse {
  perspective: MediationPerspective;
  session: MediationSessionDetailResponse;
  created_jobs: MediationAIJob[];
  safety_message?: string | null;
}

export interface MediationSessionDetailResponse extends MediationSessionListItem {
  my_perspective?: MediationPerspective | null;
  my_reflection?: PrivateReflectionOutput | null;
  advice?: SharedMediationAdviceOutput | null;
  shared_advice?: SharedMediationAdviceOutput | null;
  other_user_type?: UserType;
  other_perspective_status?: "NOT_STARTED" | "DRAFT" | "SUBMITTED";
  ai_jobs?: MediationAIJob[];
}

export interface ReflectionEndpointResponse {
  status: AIOutputStatus;
  reflection?: PrivateReflectionOutput | null;
  content?: string | null;
}

export interface AdviceEndpointResponse {
  status: AIOutputStatus;
  advice?: SharedMediationAdviceOutput | null;
  message?: string | null;
}

export interface CreateMediationCommentRequest {
  content: string;
}

export interface MediationComment {
  id: string;
  session_id: string;
  parent_comment_id?: string | null;
  author_user_type?: UserType | null;
  content: string;
  ai_reply?: string | null;
  ai_reply_status?: AIOutputStatus;
  replies?: MediationComment[];
  created_at: string;
  updated_at?: string | null;
}

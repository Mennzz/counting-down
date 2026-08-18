import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { relationshipCareApi } from "@/services/relationship-care";
import type {
  AgreementResponseType,
  AgreementRevisionInput,
  PersonalBoundaryInput,
  PersonalGoalInput,
  RelationshipRequestInput,
} from "@/types/relationship-care";

export const RELATIONSHIP_CARE_QUERY_KEY = ["relationship-care"];
const overviewKey = [...RELATIONSHIP_CARE_QUERY_KEY, "overview"];
const agreementKey = (id: string) => [...RELATIONSHIP_CARE_QUERY_KEY, "agreements", id];
const goalKey = (id: string) => [...RELATIONSHIP_CARE_QUERY_KEY, "goals", id];

export const useRelationshipCareOverview = () =>
  useQuery({
    queryKey: overviewKey,
    queryFn: relationshipCareApi.getOverview,
    staleTime: 20_000,
  });

export const useAgreement = (id?: string) =>
  useQuery({
    queryKey: id ? agreementKey(id) : [...RELATIONSHIP_CARE_QUERY_KEY, "agreement", "missing"],
    queryFn: () => relationshipCareApi.getAgreement(id as string),
    enabled: Boolean(id),
  });

export const usePersonalGoal = (id?: string) =>
  useQuery({
    queryKey: id ? goalKey(id) : [...RELATIONSHIP_CARE_QUERY_KEY, "goal", "missing"],
    queryFn: () => relationshipCareApi.getGoal(id as string),
    enabled: Boolean(id),
  });

const useCareMutation = <TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
  successMessage: string,
  agreementId?: string,
  goalId?: string,
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: overviewKey });
      if (agreementId) {
        await queryClient.invalidateQueries({ queryKey: agreementKey(agreementId) });
      }
      if (goalId) {
        await queryClient.invalidateQueries({ queryKey: goalKey(goalId) });
      }
      toast({ title: successMessage });
    },
    onError: (error: Error) => {
      toast({ title: "That didn’t work", description: error.message, variant: "destructive" });
    },
  });
};

export const useSaveBoundary = (boundaryId?: string) =>
  useCareMutation(
    (payload: PersonalBoundaryInput) =>
      boundaryId
        ? relationshipCareApi.updateBoundary(boundaryId, payload)
        : relationshipCareApi.createBoundary(payload),
    boundaryId ? "Boundary updated" : "Boundary added",
  );

export const useArchiveBoundary = () =>
  useCareMutation((id: string) => relationshipCareApi.archiveBoundary(id), "Boundary archived");

export const useRestoreBoundary = () =>
  useCareMutation((id: string) => relationshipCareApi.restoreBoundary(id), "Boundary restored");

export const useSaveRelationshipRequest = (requestId?: string) =>
  useCareMutation(
    (payload: RelationshipRequestInput) =>
      requestId
        ? relationshipCareApi.updateRequest(requestId, payload)
        : relationshipCareApi.createRequest(payload),
    requestId ? "Request updated" : "Request added",
  );

export const useArchiveRelationshipRequest = () =>
  useCareMutation((id: string) => relationshipCareApi.archiveRequest(id), "Request archived");

export const useRestoreRelationshipRequest = () =>
  useCareMutation((id: string) => relationshipCareApi.restoreRequest(id), "Request restored");

export const useSavePersonalGoal = (goalId?: string) =>
  useCareMutation(
    (payload: PersonalGoalInput) =>
      goalId
        ? relationshipCareApi.updateGoal(goalId, payload)
        : relationshipCareApi.createGoal(payload),
    goalId ? "Growth goal updated" : "Growth goal added",
    undefined,
    goalId,
  );

export const useUpdatePersonalGoal = (goalId: string) =>
  useCareMutation(
    (payload: Partial<PersonalGoalInput>) => relationshipCareApi.updateGoal(goalId, payload),
    "Growth goal updated",
    undefined,
    goalId,
  );

export const useArchivePersonalGoal = (goalId?: string) =>
  useCareMutation(
    (id: string | undefined) => relationshipCareApi.archiveGoal(id ?? goalId ?? ""),
    "Growth goal archived",
    undefined,
    goalId,
  );

export const useRestorePersonalGoal = () =>
  useCareMutation((id: string) => relationshipCareApi.restoreGoal(id), "Growth goal restored");

export const useCreateAgreement = () =>
  useCareMutation(
    (payload: AgreementRevisionInput) => relationshipCareApi.createAgreement(payload),
    "Agreement draft saved",
  );

export const useCreateAgreementRevision = (agreementId: string, currentRevisionId: string) =>
  useCareMutation(
    (payload: AgreementRevisionInput) =>
      relationshipCareApi.createRevision(agreementId, currentRevisionId, payload),
    "New revision saved",
    agreementId,
  );

export const useAgreementAction = (agreementId: string) => ({
  propose: useCareMutation(
    () => relationshipCareApi.proposeAgreement(agreementId),
    "Agreement proposed",
    agreementId,
  ),
  accept: useCareMutation(
    (revisionId: string) => relationshipCareApi.acceptRevision(revisionId),
    "Your agreement was recorded",
    agreementId,
  ),
  revoke: useCareMutation(
    (revisionId: string) => relationshipCareApi.revokeAcceptance(revisionId),
    "Agreement moved to revisit",
    agreementId,
  ),
  respond: useCareMutation(
    ({ revisionId, responseType, note }: {
      revisionId: string;
      responseType: AgreementResponseType;
      note?: string;
    }) => relationshipCareApi.respondToRevision(revisionId, responseType, note),
    "Your response was saved",
    agreementId,
  ),
  archive: useCareMutation(
    () => relationshipCareApi.requestArchive(agreementId),
    "Archive preference saved",
    agreementId,
  ),
  withdrawArchive: useCareMutation(
    () => relationshipCareApi.withdrawArchive(agreementId),
    "Archive preference withdrawn",
    agreementId,
  ),
});

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { relationshipCareApi } from "@/services/relationship-care";
import { useRestorePersonalGoal } from "./use-relationship-care";

vi.mock("@/services/relationship-care", () => ({
  relationshipCareApi: {
    restoreGoal: vi.fn(),
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe("personal goal mutations", () => {
  beforeEach(() => {
    vi.mocked(relationshipCareApi.restoreGoal).mockReset();
  });

  it("invalidates the overview after restoring an archived goal", async () => {
    vi.mocked(relationshipCareApi.restoreGoal).mockResolvedValue({} as never);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(["relationship-care", "overview"], { archivedGoals: [] });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useRestorePersonalGoal(), { wrapper });

    await result.current.mutateAsync("64a7f0c2f1d2c4b5a6e7d8f5");

    await waitFor(() => {
      expect(queryClient.getQueryState(["relationship-care", "overview"])?.isInvalidated).toBe(true);
    });
    expect(relationshipCareApi.restoreGoal).toHaveBeenCalledWith("64a7f0c2f1d2c4b5a6e7d8f5");
  });
});

import { describe, expect, it } from "vitest";

import type { MediationComment } from "@/types/mediation";
import { mediationCommentAuthorLabel } from "./mediation-ui";

const comment = {
  id: "64b64c8f2f3f6d1f7a8b9001",
  session_id: "64b64c8f2f3f6d1f7a8b9002",
  content: "A thought",
  created_at: "2026-08-18T10:00:00Z",
} satisfies MediationComment;

describe("mediation comment authors", () => {
  it("distinguishes Xiao Bao from the mediation assistant", () => {
    expect(
      mediationCommentAuthorLabel({
        ...comment,
        author_type: "AI",
        ai_author_type: "XIAO_BAO",
      }),
    ).toBe("Xiao Bao");
    expect(
      mediationCommentAuthorLabel({
        ...comment,
        author_type: "AI",
        ai_author_type: "MEDIATION_ASSISTANT",
      }),
    ).toBe("Mediator");
  });

  it("keeps a human author's name", () => {
    expect(
      mediationCommentAuthorLabel({
        ...comment,
        author_type: "USER",
        author_user_type: "Danfeng",
      }),
    ).toBe("Danfeng");
  });
});

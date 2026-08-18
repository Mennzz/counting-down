import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AgreementEditorPage } from "../AgreementEditor";

vi.mock("@/hooks/use-relationship-care", () => ({
  useAgreement: () => ({ data: undefined, isLoading: false, isError: false, error: null }),
  useCreateAgreement: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateAgreementRevision: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

describe("AgreementEditorPage", () => {
  it("guides the user through required content and explicit asymmetry", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AgreementEditorPage /></MemoryRouter>);

    expect(screen.getByLabelText("What are we trying to protect?")).toBeRequired();

    await user.type(screen.getByLabelText("What are we trying to protect?"), "Protecting trust");
    await user.type(screen.getByLabelText("Why does this matter to us?"), "Trust helps us feel safe.");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.type(screen.getByLabelText("What would we like to agree?"), "We answer direct questions honestly.");
    await user.click(screen.getByRole("button", { name: /continue/i }));
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.click(screen.getByLabelText(/no, intentionally different/i));
    expect(screen.getByLabelText("Why does a different arrangement make sense?")).toBeRequired();

    await user.type(
      screen.getByLabelText("Why does a different arrangement make sense?"),
      "Our working hours require different responsibilities.",
    );
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(screen.getByText("Our working hours require different responsibilities.")).toBeInTheDocument();
  });
});

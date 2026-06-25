import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FlightLookupSection } from "@/components/FlightLookupSection";
import { flightLookupApi } from "@/services/flightLookup";
import type { FlightLookupCandidate, FlightLookupResponse } from "@/types/flightLookup";

vi.mock("@/services/flightLookup");
vi.mock("@/utils/cookies", () => ({ getSessionId: () => null }));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const makeCandidate = (): FlightLookupCandidate => ({
  id: "abc123",
  flightNumber: "KL123",
  airlineName: "KLM",
  airlineCode: "KL",
  departureAirport: { iata: "AMS", icao: "EHAM", name: "Amsterdam Schiphol", city: "Amsterdam", country: "NL" },
  arrivalAirport: { iata: "LHR", icao: "EGLL", name: "London Heathrow", city: "London", country: "GB" },
  scheduledDepartureTimeLocal: "2026-06-25T12:30:00+02:00",
  scheduledArrivalTimeLocal: "2026-06-25T12:50:00+01:00",
  scheduledDepartureTimeUtc: "2026-06-25T10:30:00Z",
  scheduledArrivalTimeUtc: "2026-06-25T11:50:00Z",
  status: "Scheduled",
  source: "AeroDataBox",
});

const makeResponse = (candidates: FlightLookupCandidate[] = [makeCandidate()]): FlightLookupResponse => ({
  query: "KL123",
  normalizedFlightNumber: "KL123",
  cached: false,
  candidates,
});

const renderSection = (onCandidateSelect = vi.fn(), onManualEntry = vi.fn()) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <FlightLookupSection onCandidateSelect={onCandidateSelect} onManualEntry={onManualEntry} />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FlightLookupSection", () => {
  it("does NOT call lookup API when typing into the input", async () => {
    renderSection();
    await userEvent.type(screen.getByRole("textbox"), "KL1");
    expect(flightLookupApi.lookupFlight).not.toHaveBeenCalled();
  });

  it("calls lookup API once when clicking Lookup button", async () => {
    vi.mocked(flightLookupApi.lookupFlight).mockResolvedValueOnce(makeResponse());
    renderSection();
    await userEvent.type(screen.getByRole("textbox"), "KL123");
    await userEvent.click(screen.getByRole("button", { name: /lookup/i }));
    expect(flightLookupApi.lookupFlight).toHaveBeenCalledTimes(1);
    expect(flightLookupApi.lookupFlight).toHaveBeenCalledWith("KL123");
  });

  it("does not send duplicate concurrent requests on rapid clicks", async () => {
    // Use a never-resolving promise so the mutation stays pending during the second click
    vi.mocked(flightLookupApi.lookupFlight).mockReturnValueOnce(new Promise(() => {}));
    renderSection();
    await userEvent.type(screen.getByRole("textbox"), "KL123");
    const button = screen.getByRole("button", { name: /lookup/i });
    // First click — starts the mutation (isPending becomes true)
    await userEvent.click(button);
    // Second click — button is disabled while pending, so the API is not called again
    await userEvent.click(button);
    expect(flightLookupApi.lookupFlight).toHaveBeenCalledTimes(1);
  });

  it("renders candidate cards when results are returned", async () => {
    vi.mocked(flightLookupApi.lookupFlight).mockResolvedValueOnce(makeResponse());
    renderSection();
    await userEvent.type(screen.getByRole("textbox"), "KL123");
    await userEvent.click(screen.getByRole("button", { name: /lookup/i }));
    await waitFor(() => {
      expect(screen.getByText("KL123")).toBeInTheDocument();
    });
  });

  it("calls onCandidateSelect when a candidate card is clicked", async () => {
    const onCandidateSelect = vi.fn();
    vi.mocked(flightLookupApi.lookupFlight).mockResolvedValueOnce(makeResponse());
    renderSection(onCandidateSelect);
    await userEvent.type(screen.getByRole("textbox"), "KL123");
    await userEvent.click(screen.getByRole("button", { name: /lookup/i }));
    await waitFor(() => screen.getByText("KL123"));
    // Click the candidate card (contains the flight number)
    await userEvent.click(screen.getByText("KL123").closest("[class*='cursor-pointer']")!);
    expect(onCandidateSelect).toHaveBeenCalledWith(expect.objectContaining({ flightNumber: "KL123" }));
  });

  it("shows no-results message when API returns empty candidates", async () => {
    vi.mocked(flightLookupApi.lookupFlight).mockResolvedValueOnce(makeResponse([]));
    renderSection();
    await userEvent.type(screen.getByRole("textbox"), "ZZ999");
    await userEvent.click(screen.getByRole("button", { name: /lookup/i }));
    await waitFor(() => {
      expect(screen.getByText(/no matching flights/i)).toBeInTheDocument();
    });
  });

  it("calls onManualEntry when 'Enter details manually' is clicked", async () => {
    const onManualEntry = vi.fn();
    renderSection(vi.fn(), onManualEntry);
    await userEvent.click(screen.getByRole("button", { name: /enter details manually/i }));
    expect(onManualEntry).toHaveBeenCalledTimes(1);
  });
});

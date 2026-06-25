import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CreateFlightDialog } from "@/components/CreateFlightDialog";
import { flightLookupApi } from "@/services/flightLookup";
import type { FlightLookupResponse } from "@/types/flightLookup";

vi.mock("@/services/flightLookup");
vi.mock("@/services/flight", () => ({
  flightApi: {
    createFlight: vi.fn(),
    getFlights: vi.fn().mockResolvedValue([]),
  },
}));
vi.mock("@/utils/cookies", () => ({ getSessionId: () => null }));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

const emptyResponse: FlightLookupResponse = {
  query: "KL123",
  normalizedFlightNumber: "KL123",
  cached: false,
  candidates: [],
};

const renderDialog = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateFlightDialog>
        <button>Open</button>
      </CreateFlightDialog>
    </QueryClientProvider>
  );
};

const openDialog = async () => {
  await userEvent.click(screen.getByRole("button", { name: /open/i }));
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CreateFlightDialog", () => {
  it("opens in lookup mode — FlightLookupSection visible", async () => {
    renderDialog();
    await openDialog();
    expect(screen.getByRole("button", { name: /lookup/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enter details manually/i })).toBeInTheDocument();
  });

  it("'Enter details manually' switches to manual mode showing the form", async () => {
    renderDialog();
    await openDialog();
    await userEvent.click(screen.getByRole("button", { name: /enter details manually/i }));
    // In manual mode, the create button should appear
    expect(screen.getByRole("button", { name: /create flight/i })).toBeInTheDocument();
    // And back-to-lookup button
    expect(screen.getByRole("button", { name: /back to lookup/i })).toBeInTheDocument();
  });

  it("'Back to lookup' returns to lookup mode", async () => {
    renderDialog();
    await openDialog();
    await userEvent.click(screen.getByRole("button", { name: /enter details manually/i }));
    await userEvent.click(screen.getByRole("button", { name: /back to lookup/i }));
    expect(screen.getByRole("button", { name: /lookup/i })).toBeInTheDocument();
  });

  it("selecting a candidate switches to manual mode", async () => {
    vi.mocked(flightLookupApi.lookupFlight).mockResolvedValueOnce({
      query: "KL123",
      normalizedFlightNumber: "KL123",
      cached: false,
      candidates: [
        {
          id: "abc",
          flightNumber: "KL123",
          airlineName: "KLM",
          airlineCode: "KL",
          departureAirport: { iata: "AMS", icao: "EHAM", name: null, city: "Amsterdam", country: "NL" },
          arrivalAirport: { iata: "LHR", icao: "EGLL", name: null, city: "London", country: "GB" },
          scheduledDepartureTimeLocal: "2026-06-25T12:30:00+02:00",
          scheduledArrivalTimeLocal: "2026-06-25T12:50:00+01:00",
          scheduledDepartureTimeUtc: "2026-06-25T10:30:00Z",
          scheduledArrivalTimeUtc: "2026-06-25T11:50:00Z",
          status: "Scheduled",
          source: "AeroDataBox",
        },
      ],
    });

    renderDialog();
    await openDialog();
    await userEvent.type(screen.getByRole("textbox"), "KL123");
    await userEvent.click(screen.getByRole("button", { name: /lookup/i }));
    await waitFor(() => screen.getByText("KL123"));
    await userEvent.click(screen.getByText("KL123").closest("[class*='cursor-pointer']")!);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create flight/i })).toBeInTheDocument();
    });
  });

  it("no-results lookup offers manual entry", async () => {
    vi.mocked(flightLookupApi.lookupFlight).mockResolvedValueOnce(emptyResponse);
    renderDialog();
    await openDialog();
    await userEvent.type(screen.getByRole("textbox"), "ZZ999");
    await userEvent.click(screen.getByRole("button", { name: /lookup/i }));
    await waitFor(() => {
      expect(screen.getByText(/no matching flights/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /enter details manually/i })).toBeInTheDocument();
  });
});

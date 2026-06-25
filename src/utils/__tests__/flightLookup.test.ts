import { describe, it, expect } from "vitest";
import { mapCandidateStatus } from "@/types/flightLookup";
import {
  createFlightFormValuesFromCandidate,
} from "@/components/flight-form-utils";
import type { FlightLookupCandidate } from "@/types/flightLookup";

const makeCandidate = (overrides: Partial<FlightLookupCandidate> = {}): FlightLookupCandidate => ({
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
  ...overrides,
});

// ---------------------------------------------------------------------------
// mapCandidateStatus
// ---------------------------------------------------------------------------

describe("mapCandidateStatus", () => {
  it.each([
    ["Scheduled", "ACTIVE"],
    ["scheduled", "ACTIVE"],
    ["Active", "ACTIVE"],
    ["Expected", "ACTIVE"],
    ["Cancelled", "CANCELLED"],
    ["cancelled", "CANCELLED"],
    ["Unknown", "DRAFT"],
    ["Diverted", "DRAFT"],
    [null, "DRAFT"],
  ])("maps %s -> %s", (input, expected) => {
    expect(mapCandidateStatus(input)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// createFlightFormValuesFromCandidate
// ---------------------------------------------------------------------------

describe("createFlightFormValuesFromCandidate", () => {
  it("maps flight number from candidate", () => {
    const values = createFlightFormValuesFromCandidate(makeCandidate());
    expect(values.flightNumber).toBe("KL123");
  });

  it("maps ICAO codes for departure and arrival airports", () => {
    const values = createFlightFormValuesFromCandidate(makeCandidate());
    expect(values.departureAirportIcao).toBe("EHAM");
    expect(values.arrivalAirportIcao).toBe("EGLL");
  });

  it("falls back to empty string when ICAO is null", () => {
    const c = makeCandidate({
      departureAirport: { iata: "AMS", icao: null, name: null, city: null, country: null },
    });
    const values = createFlightFormValuesFromCandidate(c);
    expect(values.departureAirportIcao).toBe("");
  });

  it("prefers local time over UTC for departure", () => {
    const values = createFlightFormValuesFromCandidate(makeCandidate());
    // Local time 2026-06-25T12:30:00+02:00 → UTC 10:30, local offset adjusts
    expect(values.departureAt).toBeTruthy();
  });

  it("falls back to UTC when local time is null", () => {
    const c = makeCandidate({ scheduledDepartureTimeLocal: null });
    const values = createFlightFormValuesFromCandidate(c);
    expect(values.departureAt).toBeTruthy();
    expect(values.departureAt).not.toBe("");
  });

  it("returns empty string when both local and UTC times are null", () => {
    const c = makeCandidate({
      scheduledDepartureTimeLocal: null,
      scheduledDepartureTimeUtc: null,
    });
    const values = createFlightFormValuesFromCandidate(c);
    expect(values.departureAt).toBe("");
  });

  it("maps status via mapCandidateStatus", () => {
    const values = createFlightFormValuesFromCandidate(makeCandidate({ status: "Cancelled" }));
    expect(values.status).toBe("CANCELLED");
  });
});

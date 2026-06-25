import { FlightStatus } from "@/types/flight";

export interface FlightLookupAirport {
  iata: string | null;
  icao: string | null;
  name: string | null;
  city: string | null;
  country: string | null;
}

export interface FlightLookupCandidate {
  id: string;
  flightNumber: string;
  airlineName: string | null;
  airlineCode: string | null;
  departureAirport: FlightLookupAirport;
  arrivalAirport: FlightLookupAirport;
  scheduledDepartureTimeLocal: string | null;
  scheduledArrivalTimeLocal: string | null;
  scheduledDepartureTimeUtc: string | null;
  scheduledArrivalTimeUtc: string | null;
  status: string | null;
  source: string;
}

export interface FlightLookupResponse {
  query: string;
  normalizedFlightNumber: string;
  cached: boolean;
  candidates: FlightLookupCandidate[];
}

export function mapCandidateStatus(status: string | null): FlightStatus {
  if (!status) return "DRAFT";
  const s = status.toLowerCase();
  if (s === "scheduled" || s === "active" || s === "expected") return "ACTIVE";
  if (s === "cancelled") return "CANCELLED";
  return "DRAFT";
}

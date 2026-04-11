import { Flight, FlightStatus } from "@/types/flight";

export interface FlightFormValues {
  flightNumber: string;
  departureAirportIcao: string;
  arrivalAirportIcao: string;
  departureAt: string;
  arrivalAt: string;
  status: FlightStatus;
}

export const createEmptyFlightFormValues = (): FlightFormValues => ({
  flightNumber: "",
  departureAirportIcao: "",
  arrivalAirportIcao: "",
  departureAt: "",
  arrivalAt: "",
  status: "DRAFT",
});

const toDateTimeLocalValue = (dateString: string): string => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
};

export const createFlightFormValuesFromFlight = (flight: Flight): FlightFormValues => ({
  flightNumber: flight.flightNumber,
  departureAirportIcao: flight.departureAirport.icao,
  arrivalAirportIcao: flight.arrivalAirport.icao,
  departureAt: toDateTimeLocalValue(flight.departureAt),
  arrivalAt: toDateTimeLocalValue(flight.arrivalAt),
  status: flight.status,
});

export const isFlightFormValid = (values: FlightFormValues): boolean => (
  values.flightNumber.trim().length > 0 &&
  values.departureAirportIcao.length > 0 &&
  values.arrivalAirportIcao.length > 0 &&
  values.departureAt.length > 0 &&
  values.arrivalAt.length > 0 &&
  new Date(values.arrivalAt) > new Date(values.departureAt)
);

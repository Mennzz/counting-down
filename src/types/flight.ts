import { Airport } from "./airport";

export type FlightStatus = "DRAFT" | "ACTIVE" | "CANCELLED";

export interface Flight {
    id: string;
    status: FlightStatus;
    flightNumber: string;
    departureAirport: Airport;
    arrivalAirport: Airport;
    departureAt: string;
    arrivalAt: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateFlightRequest {
    flightNumber: string;
    departureIcao: string;
    arrivalIcao: string;
    departureAt: string;
    arrivalAt: string;
    flightStatus?: FlightStatus;
}

export interface UpdateFlightRequest {
    status?: FlightStatus;
    flightNumber?: string;
    departureIcao?: string;
    arrivalIcao?: string;
    departureAt?: string;
    arrivalAt?: string;
}

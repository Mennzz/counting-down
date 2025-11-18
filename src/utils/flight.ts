import { Airport } from "@/types/airport"
import { Point } from "react-simple-maps"


export function getCoordsFromAirport (airport: Airport): Point {
    return [airport?.longitude, airport?.latitude]
}

export function getTrackingLinkFromFlightNumber(flightNumber: string, flightInProgress: boolean): string {
    if (flightInProgress) {
        return `https://www.flightradar24.com/${flightNumber}`;
    } else {
        return `https://www.flightradar24.com/data/flights/${flightNumber}`;
    }
}

export function getFlightInProgress(flight: { departureAt: string; arrivalAt: string; }): boolean {
    const departureTime = new Date(flight.departureAt).getTime();
    const arrivalTime = new Date(flight.arrivalAt).getTime();
    const now = Date.now();
    return now >= departureTime && now <= arrivalTime;
}
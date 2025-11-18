export interface Airport {
    id: string;
    icao: string;
    iata: string;
    name: string;
    city: string;
    country: string;
    longitude: number;
    latitude: number;
    createdAt: string;
    updatedAt?: string;
}

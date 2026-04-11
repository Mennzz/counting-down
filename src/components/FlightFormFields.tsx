import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlightFormValues } from "@/components/flight-form-utils";
import { useAirports } from "@/hooks/use-airports";
import { FlightStatus } from "@/types/flight";
import { Loader2 } from "lucide-react";

export interface FlightFormFieldsProps {
  values: FlightFormValues;
  onChange: <K extends keyof FlightFormValues>(field: K, value: FlightFormValues[K]) => void;
}

export const FlightFormFields = ({ values, onChange }: FlightFormFieldsProps) => {
  const { data: airports = [], isLoading: isLoadingAirports } = useAirports();
  const hasInvalidTimes =
    values.departureAt.length > 0 &&
    values.arrivalAt.length > 0 &&
    new Date(values.arrivalAt) <= new Date(values.departureAt);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="flight-number">Flight Number *</Label>
        <Input
          id="flight-number"
          placeholder="e.g., UA123"
          value={values.flightNumber}
          onChange={(e) => onChange("flightNumber", e.target.value)}
          className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="departure-airport">Departure Airport *</Label>
        {isLoadingAirports ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            <span className="ml-2 text-sm text-gray-600">Loading airports...</span>
          </div>
        ) : (
          <Select
            value={values.departureAirportIcao}
            onValueChange={(value) => onChange("departureAirportIcao", value)}
          >
            <SelectTrigger className="border-rose-200 focus:border-rose-400 focus:ring-rose-400">
              <SelectValue placeholder="Select departure airport" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] max-w-[400px]">
              {airports.map((airport) => (
                <SelectItem key={airport.id} value={airport.icao}>
                  {airport.name} ({airport.iata}) - {airport.city}, {airport.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="arrival-airport">Arrival Airport *</Label>
        {isLoadingAirports ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            <span className="ml-2 text-sm text-gray-600">Loading airports...</span>
          </div>
        ) : (
          <Select
            value={values.arrivalAirportIcao}
            onValueChange={(value) => onChange("arrivalAirportIcao", value)}
          >
            <SelectTrigger className="border-rose-200 focus:border-rose-400 focus:ring-rose-400">
              <SelectValue placeholder="Select arrival airport" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] max-w-[400px]">
              {airports.map((airport) => (
                <SelectItem key={airport.id} value={airport.icao}>
                  {airport.name} ({airport.iata}) - {airport.city}, {airport.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="departure-time">Departure Time *</Label>
        <Input
          id="departure-time"
          type="datetime-local"
          value={values.departureAt}
          onChange={(e) => onChange("departureAt", e.target.value)}
          className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="arrival-time">Arrival Time *</Label>
        <Input
          id="arrival-time"
          type="datetime-local"
          value={values.arrivalAt}
          onChange={(e) => onChange("arrivalAt", e.target.value)}
          className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
          required
        />
        {hasInvalidTimes && (
          <p className="text-xs text-red-500">Arrival time must be after departure time</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="flight-status">Flight Status</Label>
        <Select value={values.status} onValueChange={(value) => onChange("status", value as FlightStatus)}>
          <SelectTrigger className="border-rose-200 focus:border-rose-400 focus:ring-rose-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

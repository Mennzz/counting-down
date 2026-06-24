import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AirportCombobox } from "@/components/AirportCombobox";
import { FlightFormValues } from "@/components/flight-form-utils";
import { FlightStatus } from "@/types/flight";

export interface FlightFormFieldsProps {
  values: FlightFormValues;
  onChange: <K extends keyof FlightFormValues>(field: K, value: FlightFormValues[K]) => void;
}

export const FlightFormFields = ({ values, onChange }: FlightFormFieldsProps) => {
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
        <AirportCombobox
          id="departure-airport"
          value={values.departureAirportIcao}
          onChange={(icao) => onChange("departureAirportIcao", icao)}
          placeholder="Select departure airport"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="arrival-airport">Arrival Airport *</Label>
        <AirportCombobox
          id="arrival-airport"
          value={values.arrivalAirportIcao}
          onChange={(icao) => onChange("arrivalAirportIcao", icao)}
          placeholder="Select arrival airport"
        />
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
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

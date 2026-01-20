import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateFlight } from "@/hooks/use-flights";
import { useAirports } from "@/hooks/use-airports";
import { FlightStatus } from "@/types/flight";
import { Loader2, Plane } from "lucide-react";

interface CreateFlightDialogProps {
  children: React.ReactNode;
}

export const CreateFlightDialog = ({ children }: CreateFlightDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [flightNumber, setFlightNumber] = useState("");
  const [departureIcao, setDepartureIcao] = useState("");
  const [arrivalIcao, setArrivalIcao] = useState("");
  const [departureAt, setDepartureAt] = useState("");
  const [arrivalAt, setArrivalAt] = useState("");
  const [flightStatus, setFlightStatus] = useState<FlightStatus>("DRAFT");

  const createFlightMutation = useCreateFlight();
  const { data: airports = [], isLoading: isLoadingAirports } = useAirports();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate arrival time is after departure time
    if (new Date(arrivalAt) <= new Date(departureAt)) {
      return;
    }

    try {
      await createFlightMutation.mutateAsync({
        flightNumber: flightNumber.trim(),
        departureAirportIcao: departureIcao,
        arrivalAirportIcao: arrivalIcao,
        departureAt,
        arrivalAt,
        status: flightStatus,
      });

      // Reset form and close dialog on success
      setFlightNumber("");
      setDepartureIcao("");
      setArrivalIcao("");
      setDepartureAt("");
      setArrivalAt("");
      setFlightStatus("DRAFT");
      setIsOpen(false);
    } catch (err) {
      // Error is handled by the mutation hook
    }
  };

  const isFormValid =
    flightNumber.trim() &&
    departureIcao &&
    arrivalIcao &&
    departureAt &&
    arrivalAt &&
    new Date(arrivalAt) > new Date(departureAt);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-rose-500" />
            <span>Create New Flight</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="space-y-2">
            <Label htmlFor="flight-number">Flight Number *</Label>
            <Input
              id="flight-number"
              placeholder="e.g., UA123"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departure-airport">Departure Airport *</Label>
            {isLoadingAirports ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-600">Loading airports...</span>
              </div>
            ) : (
              <Select value={departureIcao} onValueChange={setDepartureIcao}>
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
                <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
                <span className="ml-2 text-sm text-gray-600">Loading airports...</span>
              </div>
            ) : (
              <Select value={arrivalIcao} onValueChange={setArrivalIcao}>
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
              value={departureAt}
              onChange={(e) => setDepartureAt(e.target.value)}
              className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrival-time">Arrival Time *</Label>
            <Input
              id="arrival-time"
              type="datetime-local"
              value={arrivalAt}
              onChange={(e) => setArrivalAt(e.target.value)}
              className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              required
            />
            {departureAt && arrivalAt && new Date(arrivalAt) <= new Date(departureAt) && (
              <p className="text-xs text-red-500">Arrival time must be after departure time</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="flight-status">Flight Status</Label>
            <Select value={flightStatus} onValueChange={(value) => setFlightStatus(value as FlightStatus)}>
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

          <Button
            type="submit"
            disabled={!isFormValid || createFlightMutation.isPending}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white"
          >
            {createFlightMutation.isPending ? (
              <>
                <Plane className="w-4 h-4 mr-2 animate-spin" />
                Creating flight...
              </>
            ) : (
              <>
                <Plane className="w-4 h-4 mr-2" />
                Create Flight
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

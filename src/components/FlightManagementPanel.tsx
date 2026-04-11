import { useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditFlightDialog } from "@/components/EditFlightDialog";
import { useFlights, useUpdateFlight } from "@/hooks/use-flights";
import { Flight, FlightStatus } from "@/types/flight";
import { CalendarClock, Loader2, MapPin, Plane, SquarePen } from "lucide-react";

interface FlightManagementPanelProps {
  nextFlightId?: string;
}

const statusClasses: Record<FlightStatus, string> = {
  DRAFT: "border-amber-200 bg-amber-50 text-amber-700",
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-slate-200 bg-slate-100 text-slate-600",
  EXPIRED: "border-sky-200 bg-sky-50 text-sky-700",
};

const statusLabels: Record<FlightStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

const getStatusLabel = (status: string): string => {
  if (status in statusLabels) {
    return statusLabels[status as FlightStatus];
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusClasses = (status: string): string => {
  if (status in statusClasses) {
    return statusClasses[status as FlightStatus];
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
};

const formatFlightDateTime = (value: string) => format(new Date(value), "PPP p");

const sortUpcomingFlights = (a: Flight, b: Flight) =>
  new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime();

const sortPastFlights = (a: Flight, b: Flight) =>
  new Date(b.arrivalAt).getTime() - new Date(a.arrivalAt).getTime();

const FlightRow = ({
  flight,
  isCountdownFlight,
  editable,
  onCancel,
  isCancelling,
}: {
  flight: Flight;
  isCountdownFlight: boolean;
  editable: boolean;
  onCancel: (flight: Flight) => void;
  isCancelling: boolean;
}) => (
  <div className="rounded-2xl border border-rose-100 bg-white/80 p-4 shadow-sm">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-lg font-semibold text-rose-700">{flight.flightNumber}</div>
          <Badge variant="outline" className={getStatusClasses(flight.status)}>
            {getStatusLabel(flight.status)}
          </Badge>
          {isCountdownFlight && (
            <Badge className="bg-rose-500 text-white hover:bg-rose-500">Used in countdown</Badge>
          )}
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="mt-0.5 h-4 w-4 text-rose-400" />
          <div>
            <p className="font-medium text-gray-800">
              {flight.departureAirport.city} ({flight.departureAirport.iata}) to {flight.arrivalAirport.city} ({flight.arrivalAirport.iata})
            </p>
            <p>
              {flight.departureAirport.name} to {flight.arrivalAirport.name}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <CalendarClock className="mt-0.5 h-4 w-4 text-rose-400" />
          <div>
            <p>
              Departure: <span className="font-medium text-gray-800">{formatFlightDateTime(flight.departureAt)}</span>
            </p>
            <p>
              Arrival: <span className="font-medium text-gray-800">{formatFlightDateTime(flight.arrivalAt)}</span>
            </p>
          </div>
        </div>
      </div>

      {editable && (
        <div className="flex flex-wrap gap-2 md:justify-end">
          <EditFlightDialog flight={flight}>
            <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
              <SquarePen className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </EditFlightDialog>
          {flight.status !== "CANCELLED" && (
            <Button
              variant="outline"
              onClick={() => onCancel(flight)}
              disabled={isCancelling}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Flight"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  </div>
);

export const FlightManagementPanel = ({ nextFlightId }: FlightManagementPanelProps) => {
  const { data: flights = [], isLoading, error } = useFlights();
  const updateFlightMutation = useUpdateFlight();

  const { upcomingFlights, pastFlights } = useMemo(() => {
    const now = Date.now();
    const upcoming: Flight[] = [];
    const past: Flight[] = [];

    flights.forEach((flight) => {
      if (new Date(flight.arrivalAt).getTime() < now) {
        past.push(flight);
      } else {
        upcoming.push(flight);
      }
    });

    return {
      upcomingFlights: upcoming.sort(sortUpcomingFlights),
      pastFlights: past.sort(sortPastFlights),
    };
  }, [flights]);

  const handleCancel = async (flight: Flight) => {
    try {
      await updateFlightMutation.mutateAsync({
        id: flight.id,
        flight: { status: "CANCELLED" },
      });
    } catch {
      // Mutation handles toast messaging.
    }
  };

  return (
    <Card className="mx-auto max-w-4xl border-rose-100 bg-white/85 shadow-lg shadow-rose-100/40">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-rose-500" />
          <CardTitle className="text-2xl font-playfair text-rose-600">Manage Flights</CardTitle>
        </div>
        <CardDescription>
          Review past trips and update upcoming plans without taking attention away from the countdown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-600">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-rose-500" />
            Loading flights...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            Could not load flights right now. Please try again in a moment.
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-3">
              {upcomingFlights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-4 py-8 text-center text-sm text-gray-600">
                  No upcoming flights yet. Add one above when the next adventure is booked.
                </div>
              ) : (
                upcomingFlights.map((flight) => (
                  <FlightRow
                    key={flight.id}
                    flight={flight}
                    editable
                    isCountdownFlight={flight.id === nextFlightId}
                    onCancel={handleCancel}
                    isCancelling={updateFlightMutation.isPending && updateFlightMutation.variables?.id === flight.id}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3">
              {pastFlights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-4 py-8 text-center text-sm text-gray-600">
                  No past flights to show yet.
                </div>
              ) : (
                pastFlights.map((flight) => (
                  <FlightRow
                    key={flight.id}
                    flight={flight}
                    editable={false}
                    isCountdownFlight={false}
                    onCancel={handleCancel}
                    isCancelling={false}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

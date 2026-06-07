import { useEffect, useState } from "react";
import { FlightFormFields } from "@/components/FlightFormFields";
import {
  createFlightFormValuesFromFlight,
  FlightFormValues,
  isFlightFormValid,
} from "@/components/flight-form-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateFlight } from "@/hooks/use-flights";
import { Flight } from "@/types/flight";
import { Loader2, Pencil, Plane } from "lucide-react";

interface EditFlightDialogProps {
  flight: Flight;
  children: React.ReactNode;
}

export const EditFlightDialog = ({ flight, children }: EditFlightDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<FlightFormValues>(() => createFlightFormValuesFromFlight(flight));
  const updateFlightMutation = useUpdateFlight();

  useEffect(() => {
    if (isOpen) {
      setValues(createFlightFormValuesFromFlight(flight));
    }
  }, [flight, isOpen]);

  const handleChange = <K extends keyof FlightFormValues>(field: K, value: FlightFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFlightFormValid(values)) {
      return;
    }

    try {
      await updateFlightMutation.mutateAsync({
        id: flight.id,
        flight: {
          flightNumber: values.flightNumber.trim(),
          departureAirportIcao: values.departureAirportIcao,
          arrivalAirportIcao: values.arrivalAirportIcao,
          departureAt: new Date(values.departureAt).toISOString(),
          arrivalAt: new Date(values.arrivalAt).toISOString(),
          status: values.status,
        },
      });

      setIsOpen(false);
    } catch {
      // Mutation handles toast messaging.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="flex max-h-[90vh] max-w-md flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pencil className="h-5 w-5 text-rose-500" />
            <span>Edit Flight</span>
          </DialogTitle>
          <DialogDescription>
            Update the route, times, or status for this flight.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto pr-2">
          <FlightFormFields values={values} onChange={handleChange} />

          <Button
            type="submit"
            disabled={!isFlightFormValid(values) || updateFlightMutation.isPending}
            className="w-full bg-rose-500 text-white hover:bg-rose-600"
          >
            {updateFlightMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving flight...
              </>
            ) : (
              <>
                <Plane className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

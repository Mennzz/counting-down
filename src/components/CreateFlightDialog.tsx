import { useState } from "react";
import { FlightFormFields } from "@/components/FlightFormFields";
import { FlightLookupSection } from "@/components/FlightLookupSection";
import {
  FlightFormValues,
  createEmptyFlightFormValues,
  createFlightFormValuesFromCandidate,
  isFlightFormValid,
} from "@/components/flight-form-utils";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateFlight } from "@/hooks/use-flights";
import { FlightLookupCandidate } from "@/types/flightLookup";
import { ArrowLeft, Loader2, Plane } from "lucide-react";

type DialogMode = "lookup" | "manual";

interface CreateFlightDialogProps {
  children: React.ReactNode;
}

export const CreateFlightDialog = ({ children }: CreateFlightDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("lookup");
  const [values, setValues] = useState<FlightFormValues>(createEmptyFlightFormValues);
  const createFlightMutation = useCreateFlight();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setMode("lookup");
      setValues(createEmptyFlightFormValues());
    }
  };

  const handleChange = <K extends keyof FlightFormValues>(field: K, value: FlightFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleCandidateSelect = (candidate: FlightLookupCandidate) => {
    setValues(createFlightFormValuesFromCandidate(candidate));
    setMode("manual");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFlightFormValid(values)) {
      return;
    }

    try {
      await createFlightMutation.mutateAsync({
        flightNumber: values.flightNumber.trim(),
        departureAirportIcao: values.departureAirportIcao,
        arrivalAirportIcao: values.arrivalAirportIcao,
        departureAt: new Date(values.departureAt).toISOString(),
        arrivalAt: new Date(values.arrivalAt).toISOString(),
        status: values.status,
      });

      setValues(createEmptyFlightFormValues());
      setMode("lookup");
      setIsOpen(false);
    } catch {
      // Mutation handles toast messaging.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-rose-500" />
            <span>Create New Flight</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {mode === "lookup" ? (
            <FlightLookupSection
              onCandidateSelect={handleCandidateSelect}
              onManualEntry={() => setMode("manual")}
            />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FlightFormFields values={values} onChange={handleChange} />

              <Button
                type="submit"
                disabled={!isFlightFormValid(values) || createFlightMutation.isPending}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white"
              >
                {createFlightMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating flight...
                  </>
                ) : (
                  <>
                    <Plane className="w-4 h-4 mr-2" />
                    Create Flight
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={() => setMode("lookup")}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to lookup
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

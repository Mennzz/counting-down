import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAirport } from "@/hooks/use-airports";
import { Airport } from "@/types/airport";
import { Loader2, Plane } from "lucide-react";

interface AirportFormValues {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
}

const createEmptyValues = (): AirportFormValues => ({
  icao: "",
  iata: "",
  name: "",
  city: "",
  country: "",
  latitude: "",
  longitude: "",
});

// Pre-fill the field the search query most likely refers to so the user types less.
const seedValuesFromQuery = (query: string): AirportFormValues => {
  const trimmed = query.trim();
  const values = createEmptyValues();
  if (/^[A-Za-z]{4}$/.test(trimmed)) {
    values.icao = trimmed.toUpperCase();
  } else if (/^[A-Za-z]{3}$/.test(trimmed)) {
    values.iata = trimmed.toUpperCase();
  } else if (trimmed.length > 0) {
    values.name = trimmed;
  }
  return values;
};

const isValid = (values: AirportFormValues): boolean => {
  const lat = Number(values.latitude);
  const lon = Number(values.longitude);
  return (
    /^[A-Za-z]{4}$/.test(values.icao.trim()) &&
    /^[A-Za-z]{3}$/.test(values.iata.trim()) &&
    values.name.trim().length > 0 &&
    values.city.trim().length > 0 &&
    values.country.trim().length > 0 &&
    values.latitude.trim().length > 0 &&
    values.longitude.trim().length > 0 &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
};

interface CreateAirportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
  onCreated: (airport: Airport) => void;
}

export const CreateAirportDialog = ({
  open,
  onOpenChange,
  initialQuery = "",
  onCreated,
}: CreateAirportDialogProps) => {
  const [values, setValues] = useState<AirportFormValues>(createEmptyValues);
  const createAirportMutation = useCreateAirport();

  // Re-seed the form whenever the dialog is opened with a new search query.
  useEffect(() => {
    if (open) {
      setValues(seedValuesFromQuery(initialQuery));
    }
  }, [open, initialQuery]);

  const handleChange = (field: keyof AirportFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid(values)) {
      return;
    }

    try {
      const airport = await createAirportMutation.mutateAsync({
        icao: values.icao.trim().toUpperCase(),
        iata: values.iata.trim().toUpperCase(),
        name: values.name.trim(),
        city: values.city.trim(),
        country: values.country.trim(),
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
      });
      onCreated(airport);
      onOpenChange(false);
    } catch {
      // Mutation handles toast messaging.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-rose-500" />
            <span>Add New Airport</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="airport-icao">ICAO *</Label>
              <Input
                id="airport-icao"
                placeholder="e.g., EHAM"
                maxLength={4}
                value={values.icao}
                onChange={(e) => handleChange("icao", e.target.value.toUpperCase())}
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airport-iata">IATA *</Label>
              <Input
                id="airport-iata"
                placeholder="e.g., AMS"
                maxLength={3}
                value={values.iata}
                onChange={(e) => handleChange("iata", e.target.value.toUpperCase())}
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="airport-name">Name *</Label>
            <Input
              id="airport-name"
              placeholder="e.g., Amsterdam Airport Schiphol"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="airport-city">City *</Label>
              <Input
                id="airport-city"
                placeholder="e.g., Amsterdam"
                value={values.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airport-country">Country *</Label>
              <Input
                id="airport-country"
                placeholder="e.g., Netherlands"
                value={values.country}
                onChange={(e) => handleChange("country", e.target.value)}
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="airport-latitude">Latitude *</Label>
              <Input
                id="airport-latitude"
                type="number"
                step="any"
                placeholder="-90 to 90"
                value={values.latitude}
                onChange={(e) => handleChange("latitude", e.target.value)}
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airport-longitude">Longitude *</Label>
              <Input
                id="airport-longitude"
                type="number"
                step="any"
                placeholder="-180 to 180"
                value={values.longitude}
                onChange={(e) => handleChange("longitude", e.target.value)}
                className="border-rose-200 focus:border-rose-400 focus:ring-rose-400"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Coordinates are required and used for flight tracking and maps.
          </p>

          <Button
            type="submit"
            disabled={!isValid(values) || createAirportMutation.isPending}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white"
          >
            {createAirportMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding airport...
              </>
            ) : (
              <>
                <Plane className="w-4 h-4 mr-2" />
                Add Airport
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

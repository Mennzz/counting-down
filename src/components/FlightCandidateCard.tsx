import { format, parseISO } from "date-fns";
import { Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FlightLookupCandidate } from "@/types/flightLookup";

interface FlightCandidateCardProps {
  candidate: FlightLookupCandidate;
  onSelect: (candidate: FlightLookupCandidate) => void;
}

const formatLocalTime = (iso: string | null): string => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "EEE d MMM, HH:mm");
  } catch {
    return iso;
  }
};

const airportLabel = (iata: string | null, city: string | null): string => {
  if (iata && city) return `${iata} · ${city}`;
  return iata ?? city ?? "—";
};

export const FlightCandidateCard = ({ candidate, onSelect }: FlightCandidateCardProps) => {
  const airlineLabel = candidate.airlineName ?? candidate.airlineCode ?? null;

  return (
    <Card
      className="cursor-pointer border border-zinc-200 dark:border-zinc-700 hover:border-rose-400 hover:shadow-sm transition-all"
      onClick={() => onSelect(candidate)}
    >
      <CardContent className="py-3 px-4 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{candidate.flightNumber}</span>
            {airlineLabel && (
              <span className="text-xs text-muted-foreground">{airlineLabel}</span>
            )}
          </div>
          {candidate.status && (
            <Badge variant="secondary" className="text-xs">
              {candidate.status}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">
            {airportLabel(candidate.departureAirport.iata, candidate.departureAirport.city)}
          </span>
          <Plane className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium">
            {airportLabel(candidate.arrivalAirport.iata, candidate.arrivalAirport.city)}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          {formatLocalTime(candidate.scheduledDepartureTimeLocal ?? candidate.scheduledDepartureTimeUtc)}
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlightCandidateCard } from "@/components/FlightCandidateCard";
import { useFlightLookup } from "@/hooks/use-flight-lookup";
import { FlightLookupCandidate } from "@/types/flightLookup";

interface FlightLookupSectionProps {
  onCandidateSelect: (candidate: FlightLookupCandidate) => void;
  onManualEntry: () => void;
}

export const FlightLookupSection = ({ onCandidateSelect, onManualEntry }: FlightLookupSectionProps) => {
  const [flightNumberInput, setFlightNumberInput] = useState("");
  const lookupMutation = useFlightLookup();

  const handleLookup = () => {
    const trimmed = flightNumberInput.trim();
    if (!trimmed || lookupMutation.isPending) return;
    lookupMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLookup();
  };

  const hasResults = lookupMutation.isSuccess && lookupMutation.data;
  const candidates = hasResults ? lookupMutation.data.candidates : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="lookup-flight-number">Flight Number</Label>
        <div className="flex gap-2">
          <Input
            id="lookup-flight-number"
            placeholder="e.g. KL123, BA456"
            value={flightNumberInput}
            onChange={(e) => setFlightNumberInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={lookupMutation.isPending}
            className="uppercase"
          />
          <Button
            type="button"
            onClick={handleLookup}
            disabled={!flightNumberInput.trim() || lookupMutation.isPending}
            className="bg-rose-500 hover:bg-rose-600 text-white shrink-0"
          >
            {lookupMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">
              {lookupMutation.isPending ? "Searching…" : "Lookup"}
            </span>
          </Button>
        </div>
      </div>

      {/* Results */}
      {candidates !== null && (
        <div className="space-y-2">
          {candidates.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">
                {candidates.length} flight{candidates.length !== 1 ? "s" : ""} found — select one to pre-fill the form
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {candidates.map((c) => (
                  <FlightCandidateCard key={c.id} candidate={c} onSelect={onCandidateSelect} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-2">
              No matching flights found for this flight number.
            </p>
          )}
        </div>
      )}

      {/* Always-visible manual entry escape hatch */}
      <div className="pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={onManualEntry}
        >
          Enter details manually
        </Button>
      </div>
    </div>
  );
};

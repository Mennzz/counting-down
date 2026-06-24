import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreateAirportDialog } from "@/components/CreateAirportDialog";
import { useAirportByCode, useAirportSearch } from "@/hooks/use-airports";
import { Airport } from "@/types/airport";
import { cn } from "@/utils/utils";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

const airportLabel = (airport: Airport): string =>
  `${airport.name} (${airport.iata}) - ${airport.city}, ${airport.country}`;

interface AirportComboboxProps {
  value: string; // selected ICAO ("" when none)
  onChange: (icao: string) => void;
  placeholder?: string;
  id?: string;
}

export const AirportCombobox = ({
  value,
  onChange,
  placeholder = "Search airports...",
  id,
}: AirportComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  // Remember the chosen airport so we can render its label without a refetch.
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  // Debounce the typed query so we don't hit the API on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(handle);
  }, [query]);

  const { data: results = [], isFetching } = useAirportSearch(debouncedQuery);

  // When editing an existing flight we only have an ICAO; resolve its label.
  const shouldResolveByCode = !!value && selectedAirport?.icao !== value;
  const { data: airportByCode } = useAirportByCode(shouldResolveByCode ? value : undefined);

  const resolvedSelected = useMemo<Airport | null>(() => {
    if (selectedAirport && selectedAirport.icao === value) return selectedAirport;
    if (airportByCode && airportByCode.icao === value) return airportByCode;
    return null;
  }, [selectedAirport, airportByCode, value]);

  const triggerLabel = resolvedSelected
    ? airportLabel(resolvedSelected)
    : value || placeholder;

  const handleSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    onChange(airport.icao);
    setOpen(false);
  };

  const handleCreated = (airport: Airport) => {
    setSelectedAirport(airport);
    onChange(airport.icao);
    setCreateOpen(false);
    setOpen(false);
  };

  const showEmptyState = debouncedQuery.length >= 2 && !isFetching && results.length === 0;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between border-rose-200 focus:border-rose-400 focus:ring-rose-400 font-normal",
              !resolvedSelected && "text-muted-foreground"
            )}
          >
            <span className="truncate">{triggerLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type a city, airport, country or code..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {isFetching && (
                <div className="flex items-center justify-center py-4 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                  <span className="ml-2">Searching...</span>
                </div>
              )}

              {!isFetching && debouncedQuery.length < 2 && (
                <div className="py-4 text-center text-sm text-gray-500">
                  Type at least 2 characters to search.
                </div>
              )}

              {showEmptyState && (
                <CommandEmpty className="py-3">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="flex w-full items-center justify-center gap-2 px-2 text-sm text-rose-600 hover:text-rose-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add &ldquo;{debouncedQuery}&rdquo; as a new airport
                  </button>
                </CommandEmpty>
              )}

              {!isFetching && results.length > 0 && (
                <CommandGroup>
                  {results.map((airport) => (
                    <CommandItem
                      key={airport.id}
                      value={airport.icao}
                      onSelect={() => handleSelect(airport)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === airport.icao ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{airportLabel(airport)}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateAirportDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialQuery={debouncedQuery}
        onCreated={handleCreated}
      />
    </>
  );
};

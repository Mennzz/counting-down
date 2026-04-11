import { useEffect, useState } from "react";
import { Calendar, Heart, Plus, Settings2 } from "lucide-react";

import { CreateFlightDialog } from "@/components/CreateFlightDialog";
import { FlightManagementPanel } from "@/components/FlightManagementPanel";
import { CountdownSectionSkeleton } from "@/components/loading/PageSkeletons";
import PlaneFlightAnimation from "@/components/partials/FlightAnim";
import { Button } from "@/components/ui/button";
import { useNextFlight } from "@/hooks/use-flights";
import { getFlightInProgress, getTrackingLinkFromFlightNumber } from "@/utils/flight";

const CountdownSection = () => {
  const { data: nextFlight, isLoading, error } = useNextFlight();
  const [isManagementVisible, setIsManagementVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const flightTrackingLink = nextFlight
    ? getTrackingLinkFromFlightNumber(nextFlight.flightNumber, getFlightInProgress(nextFlight))
    : "";

  useEffect(() => {
    const targetDate = new Date(nextFlight?.arrivalAt || null);

    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextFlight]);

  if (isLoading) {
    return <CountdownSectionSkeleton />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-center">
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="h-8 w-8 animate-heart-beat text-rose-500" />
          <h1 className="text-5xl font-playfair font-semibold text-rose-600 md:text-6xl">
            Until We Meet Again
          </h1>
          <Heart className="h-8 w-8 animate-heart-beat text-rose-500" />
        </div>
      </div>

      {error && (
        <div className="py-10 text-center">
          <p className="text-red-500">Error loading flight details. Please try again later.</p>
        </div>
      )}

      {nextFlight === null && !isLoading && !error && (
        <div className="py-10 text-center">
          <p className="text-gray-600">No upcoming flights scheduled. Book one now to be back together soon!</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <CreateFlightDialog>
              <Button
                size="sm"
                className="bg-rose-500 text-white hover:bg-rose-600"
                title="Add new flight"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Flight
              </Button>
            </CreateFlightDialog>
            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => setIsManagementVisible((current) => !current)}
            >
              <Settings2 className="mr-2 h-4 w-4" />
              {isManagementVisible ? "Hide Manage Flights" : "Manage Flights"}
            </Button>
          </div>
        </div>
      )}

      {nextFlight && !isLoading && !error && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row">
              <p className="text-xl font-inter text-gray-600">
                Counting down to {new Date(nextFlight.arrivalAt).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })} at {new Date(nextFlight.arrivalAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="flex flex-shrink-0 items-center gap-2">
                <CreateFlightDialog>
                  <Button
                    size="sm"
                    className="bg-rose-500 text-white hover:bg-rose-600"
                    title="Add new flight"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </CreateFlightDialog>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-rose-200 text-rose-600 hover:bg-rose-50"
                  onClick={() => setIsManagementVisible((current) => !current)}
                  title="Manage flights"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item) => (
              <div key={item.label} className="love-card text-center">
                <div className="mb-2 text-4xl font-playfair font-bold text-rose-600 md:text-5xl">
                  {item.value}
                </div>
                <div className="text-sm font-inter uppercase tracking-wider text-gray-500">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="love-card mx-auto max-w-2xl">
            <PlaneFlightAnimation flight={nextFlight} />
          </div>

          <div className="love-card mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-center space-x-2">
              <Calendar className="h-5 w-5 text-rose-500" />
              <h3 className="text-xl font-playfair font-medium text-rose-600">Our Next Adventure</h3>
            </div>
            <p className="mb-2 font-inter leading-relaxed text-gray-600">
              Every second brings us closer to being in each other&apos;s arms again.
              Until then, know that you&apos;re always in my thoughts and forever in my heart.
              The distance means nothing when we have each other.
            </p>
            <p className="font-inter leading-relaxed text-gray-600">
              <strong>Departure date:</strong> {new Date(nextFlight.departureAt).toLocaleDateString()} <br />
              <strong>Flight number:</strong> {nextFlight.flightNumber} <br />
              <strong>Flight departure:</strong> {nextFlight.departureAirport?.city}, {nextFlight.departureAirport?.iata} at {new Date(nextFlight.departureAt).toLocaleDateString([], { hour: "2-digit", minute: "2-digit" })} <br />
              <strong>Flight arrival:</strong> {nextFlight.arrivalAirport?.city}, {nextFlight.arrivalAirport?.iata} at {new Date(nextFlight.arrivalAt).toLocaleDateString([], { hour: "2-digit", minute: "2-digit" })}<br />
              {flightTrackingLink ? (
                <>
                  <strong>Tracking Link:</strong>{" "}
                  <a
                    href={flightTrackingLink}
                    className="break-all text-rose-500 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={flightTrackingLink}
                  >
                    {flightTrackingLink}
                  </a>
                </>
              ) : (
                <>
                  <strong>Tracking Link:</strong> <span className="text-gray-500">N/A</span>
                </>
              )}
            </p>
          </div>

          {isManagementVisible && <FlightManagementPanel nextFlightId={nextFlight.id} />}
        </div>
      )}

      {nextFlight === null && !isLoading && !error && isManagementVisible && (
        <FlightManagementPanel />
      )}
    </div>
  );
};

export default CountdownSection;

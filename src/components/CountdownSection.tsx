
import { useState, useEffect } from "react";
import { Heart, Calendar, Loader2 } from "lucide-react";
import PlaneFlightAnimation from "./partials/FlightAnim";

import { useNextFlight } from "@/hooks/use-flights";
import { getFlightInProgress, getTrackingLinkFromFlightNumber } from "@/utils/flight";

const CountdownSection = () => {
  const { data: nextFlight, isLoading, error } = useNextFlight();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const flightTrackingLink = nextFlight ? getTrackingLinkFromFlightNumber(nextFlight.flightNumber, getFlightInProgress(nextFlight)) : '';

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
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [nextFlight]);

  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Heart className="w-8 h-8 text-rose-500 animate-heart-beat" />
          <h1 className="text-5xl md:text-6xl font-playfair font-semibold text-rose-600">
            Until We Meet Again
          </h1>
          <Heart className="w-8 h-8 text-rose-500 animate-heart-beat" />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <Loader2 className="w-6 h-6 text-rose-500 animate-spin mx-auto" />
          <p className="text-gray-600 mt-2">Loading flight details...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-red-500">Error loading flight details. Please try again later.</p>
        </div>
      )}

      {nextFlight === null && !isLoading && !error && (
        <div className="text-center py-10">
          <p className="text-gray-600">No upcoming flights scheduled 😭 Book one now to be back together soon!</p>
        </div>
      )}

      {nextFlight && !isLoading && !error && (
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xl text-gray-600 font-inter">
              Counting down to {new Date(nextFlight.arrivalAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(nextFlight.arrivalAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <br />
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds },
            ].map((item, index) => (
              <div key={item.label} className="love-card text-center">
                <div className="text-4xl md:text-5xl font-playfair font-bold text-rose-600 mb-2">
                  {item.value}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-inter">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="love-card max-w-2xl mx-auto">
            <PlaneFlightAnimation flight={nextFlight} />
          </div>

          <div className="love-card max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="w-5 h-5 text-rose-500" />
              <h3 className="text-xl font-playfair font-medium text-rose-600">Our Next Adventure</h3>
            </div>
            <p className="text-gray-600 font-inter leading-relaxed mb-2">
              Every second brings us closer to being in each other's arms again.
              Until then, know that you're always in my thoughts and forever in my heart.
              The distance means nothing when we have each other.
            </p>
            <p className="text-gray-600 font-inter leading-relaxed">
              <strong>Departure date:</strong> {(new Date(nextFlight.departureAt)).toLocaleDateString()} <br />
              <strong>Flight number:</strong> {nextFlight.flightNumber} <br />
              <strong>Flight departure:</strong> {nextFlight.departureAirport?.city}, {nextFlight.departureAirport?.iata} at {new Date(nextFlight.departureAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })} <br />
              <strong>Flight arrival:</strong> {nextFlight.arrivalAirport?.city}, {nextFlight.arrivalAirport?.iata} at {new Date(nextFlight.arrivalAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}<br />
              {flightTrackingLink ? (
                <>
                  <strong>Tracking Link:</strong>{' '}
                  <a
                    href={flightTrackingLink}
                    className="text-rose-500 break-all hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={flightTrackingLink}
                  >
                    {flightTrackingLink}
                  </a>
                </>
              ) : (
                <><strong>Tracking Link:</strong> <span className="text-gray-500">N/A</span></>
              )}
            </p>
          </div>
        </div>)
      }
    </div>
  );
};

export default CountdownSection;

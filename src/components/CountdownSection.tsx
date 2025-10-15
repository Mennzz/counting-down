
import { useState, useEffect } from "react";
import { Heart, Calendar } from "lucide-react";
import PlaneFlightAnimation from "./FlightAnim";

import flightInfo from "../data/flight.json";

const CountdownSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date(flightInfo.arrivalTime);

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
  }, []);

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
        <p className="text-xl text-gray-600 font-inter">
          Counting down to {new Date(flightInfo.arrivalTime).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(flightInfo.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} <br />
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
        <PlaneFlightAnimation />
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
          <strong>Departure date:</strong> {new Date(flightInfo.departureTime).toLocaleDateString()} <br />
          <strong>Flight number:</strong> {flightInfo.flightNumber} <br />
          <strong>Flight departure:</strong> {flightInfo.departureAirport.city}, {flightInfo.departureAirport.shorthand} at {new Date(flightInfo.departureTime).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })} <br />
          <strong>Flight arrival:</strong> {flightInfo.arrivalAirport.city}, {flightInfo.arrivalAirport.shorthand} at {new Date(flightInfo.arrivalTime).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}<br />
          <strong>Tracking Link:</strong> <a href={flightInfo.trackingLink} className="text-rose-500" target="_blank" rel="noopener noreferrer">{flightInfo.trackingLink}</a>
        </p>
      </div>
    </div>
  );
};

export default CountdownSection;

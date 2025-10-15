import { PlaneIcon } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  Point,
} from "react-simple-maps";

type Airport = {
  name: string;
  city: string;
  shorthand: string;
  coords: Point;
};

import flightData from "../data/flight.json";
import { useEffect, useState } from "react";

const airports = [flightData.departureAirport, flightData.arrivalAirport] as Airport[];

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function lerp01(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function getLerpedCoordinates(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * t,
    from[1] + (to[1] - from[1]) * t,
  ];
}

function getGreatCirclePoint(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  // Convert to radians
  const lat1 = (from[1] * Math.PI) / 180;
  const lon1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[1] * Math.PI) / 180;
  const lon2 = (to[0] * Math.PI) / 180;

  // Calculate great circle distance
  const deltaLat = lat2 - lat1;
  const deltaLon = lon2 - lon1;
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Interpolate along the great circle
  const A = Math.sin((1 - t) * c) / Math.sin(c);
  const B = Math.sin(t * c) / Math.sin(c);

  const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
  const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
  const z = A * Math.sin(lat1) + B * Math.sin(lat2);

  // Convert back to lat/lon
  const lat = Math.atan2(z, Math.sqrt(x ** 2 + y ** 2));
  const lon = Math.atan2(y, x);

  return [(lon * 180) / Math.PI, (lat * 180) / Math.PI];
}

function getRotationAngleAtPoint(
  from: [number, number],
  to: [number, number],
  t: number
): number {
  // Get current point and a point slightly ahead to calculate bearing
  const currentPoint = getGreatCirclePoint(from, to, t);
  const nextPoint = getGreatCirclePoint(from, to, Math.min(1, t + 0.01));

  const deltaY = nextPoint[1] - currentPoint[1];
  const deltaX = nextPoint[0] - currentPoint[0];
  const angleInDegrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

  return angleInDegrees;
}

export default function PlaneFlightAnimation() {
  const getFlightText = () => {
    const hasDeparted = Date.now() > new Date(flightData.departureTime).getTime();
    const hasLanded = Date.now() > new Date(flightData.arrivalTime).getTime();

    if (hasLanded) {
      return "Flight has landed";
    } else if (hasDeparted) {
      const flightPercentage = lerp01(
        Date.now(),
        new Date(flightData.departureTime).getTime(),
        new Date(flightData.arrivalTime).getTime()
      );
      return `Flight in progress: ${Math.round(flightPercentage * 100)}%`;
    } else {
      return "Flight has not departed yet";
    }
  }

  // Make sure component re-renders, we don't actually have to use the value of `t` directly
  const [t, setT] = useState(0);
  useEffect(() => {
    const arrivalTime = new Date(flightData.arrivalTime).getTime();
    const departureTime = new Date(flightData.departureTime).getTime();
    const duration = arrivalTime - departureTime;
    const updateT = () => {
      const now = Date.now();
      if (now >= arrivalTime) {
        setT(1);
      } else if (now >= departureTime) {
        setT((now - departureTime) / duration);
      }
    };

    const interval = setInterval(updateT, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentFlightProgress = lerp01(
    Date.now(),
    new Date(flightData.departureTime).getTime(),
    new Date(flightData.arrivalTime).getTime()
  );

  return (
    <div>
      {/* World map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 250, center: [75, 25] }}
        className="w-full h-full rounded-xl overflow-hidden pointer-events-none"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#a7f3d0"
                stroke="#7dd3fc"
                strokeWidth={0.3}
              />
            ))
          }
        </Geographies>

        <Line
          id="flight-path"
          from={flightData.departureAirport.coords as Point}
          to={flightData.arrivalAirport.coords as Point}
          stroke="#ff0000"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="10, 10"
        />

        <Marker coordinates={getGreatCirclePoint(
          flightData.departureAirport.coords as Point, 
          flightData.arrivalAirport.coords as Point, 
          currentFlightProgress
        )}>
          <PlaneIcon
            color="black"
            style={{ 
              rotate: (45 - getRotationAngleAtPoint(
                flightData.departureAirport.coords as Point,
                flightData.arrivalAirport.coords as Point,
                currentFlightProgress
              )) + "deg" 
            }}
          />
          <text
            x={48}
            y={48}
            textAnchor="middle"
            style={{ fontFamily: "Inter", fill: "#000", fontSize: "0.8rem" }}
          >
            {getFlightText()}
          </text>
        </Marker>

        {airports.map((airport) => (
          <Marker key={airport.shorthand} coordinates={airport.coords}>
            <circle
              r={10}
              fill="#dc2626"
            />
            <text
              textAnchor="middle"
              style={{ fontFamily: "Inter", fill: "#dc2626", fontSize: "1rem", fontWeight: "bold" }}
              y={-25}
              x={0}
            >
              {airport.city.toUpperCase()}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
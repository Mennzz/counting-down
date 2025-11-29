import { PlaneIcon } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
  Point,
} from "react-simple-maps";

import { useEffect, useState } from "react";
import { Flight } from "@/types/flight";
import { getCoordsFromAirport as getPointFromAirport } from "@/utils/flight";
import { Airport } from "@/types/airport";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function lerp01(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
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

function calculateFlightPathProjection(
  departureCoords: Point,
  arrivalCoords: Point
): { scale: number; center: [number, number] } {
  // Calculate bounding box of the flight path
  const minLon = Math.min(departureCoords[0], arrivalCoords[0]);
  const maxLon = Math.max(departureCoords[0], arrivalCoords[0]);
  const minLat = Math.min(departureCoords[1], arrivalCoords[1]);
  const maxLat = Math.max(departureCoords[1], arrivalCoords[1]);

  // Calculate center point (midpoint of the flight path)
  const centerLon = (minLon + maxLon) / 2;
  const centerLat = (minLat + maxLat) / 2;

  // Calculate the span of the flight path
  const lonSpan = maxLon - minLon;
  const latSpan = maxLat - minLat;

  // Determine scale based on the larger span
  // Add some padding (multiply by 1.5) to ensure the flight path doesn't touch edges
  const maxSpan = Math.max(lonSpan, latSpan);

  // Base scale calculation - higher scale for smaller spans
  // Use different formulas for different distance ranges to handle both regional and intercontinental flights
  let scale;
  if (maxSpan > 50) {
    // For very long intercontinental flights, use a lower scale
    scale = Math.max(150, Math.min(400, 8000 / Math.max(maxSpan, 0.1)));
  } else {
    // For regional flights, use the higher scale formula with increased numerator
    scale = Math.max(600, Math.min(2500, 15000 / Math.max(maxSpan, 0.1)));
  }

  return {
    scale,
    center: [centerLon, centerLat]
  };
}

const getFlightText = (flight: Flight): string => {
  const departureTime = new Date(flight.departureAt).getTime();
  const arrivalTime = new Date(flight.arrivalAt).getTime();

  const hasDeparted = Date.now() > departureTime
  const hasLanded = Date.now() > arrivalTime;

  if (hasLanded) {
    return "Flight has landed";
  } else if (hasDeparted) {
    const flightPercentage = lerp01(
      Date.now(),
      departureTime,
      arrivalTime
    );
    return `Flight in progress: ${Math.round(flightPercentage * 100)}%`;
  } else {
    return "Flight has not departed yet";
  }
}

const currentFlightProgress = (departureAt: Date, arrivalAt: Date): number => lerp01(
  Date.now(),
  departureAt.getTime(),
  arrivalAt.getTime()
);

export interface FlightAnimProps {
  flight: Flight;
}

export default function PlaneFlightAnimation({ flight }: FlightAnimProps) {
  // Make sure component re-renders, we don't actually have to use the value of `t` directly
  const [t, setT] = useState(0);

  const airports = [flight.departureAirport, flight.arrivalAirport] as Airport[];

  useEffect(() => {
    const arrivalTime = new Date(flight.arrivalAt).getTime();
    const departureTime = new Date(flight.departureAt).getTime();
    const duration = arrivalTime - departureTime;
    const updateT = () => {
      const now = Date.now();
      if (now >= arrivalTime) {
        setT(1);
      } else if (now >= departureTime && duration > 0) {
        setT((now - departureTime) / duration);
      }
    };

    updateT();
    const interval = setInterval(updateT, 1000);
    return () => clearInterval(interval);
  }, [flight.arrivalAt, flight.departureAt]);

  return (
    <div>
      {/* World map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={
          calculateFlightPathProjection(
            getPointFromAirport(flight.departureAirport),
            getPointFromAirport(flight.arrivalAirport)
          )
        }
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
          from={getPointFromAirport(flight.arrivalAirport)}
          to={getPointFromAirport(flight.departureAirport)}
          stroke="#ff0000"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="10, 10"
        />

        <Marker coordinates={getGreatCirclePoint(
          getPointFromAirport(flight.departureAirport),
          getPointFromAirport(flight.arrivalAirport),
          currentFlightProgress(new Date(flight.departureAt), new Date(flight.arrivalAt))
        )}>
          <PlaneIcon
            color="black"
            style={{
              rotate: (45 - getRotationAngleAtPoint(
                getPointFromAirport(flight.departureAirport),
                getPointFromAirport(flight.arrivalAirport),
                currentFlightProgress(new Date(flight.departureAt), new Date(flight.arrivalAt))
              )) + "deg"
            }}
          />
          <text
            x={48}
            y={48}
            textAnchor="middle"
            style={{ fontFamily: "Inter", fill: "#000", fontSize: "0.8rem" }}
          >
            {getFlightText(flight)}
          </text>
        </Marker>

        {airports.map((airport) => (
          <Marker key={airport.icao} coordinates={getPointFromAirport(airport)}>
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
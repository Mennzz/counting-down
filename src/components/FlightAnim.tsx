import { PlaneIcon, X } from "lucide-react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
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
import React from "react";

const airports = [flightData.departureAirport, flightData.landingAirport] as Airport[];

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

export default function PlaneFlightAnimation() {
  const getFlightText = () => {
    const hasDeparted = Date.now() > new Date(flightData.departureTime).getTime();
    const hasLanded = Date.now() > new Date(flightData.landingTime).getTime();

    if (hasLanded) {
      return "Flight has landed";
    } else if (hasDeparted) {
      const secondsLeft = Math.max(0, Math.floor((new Date(flightData.landingTime).getTime() - Date.now()) / 1000));
      const hours = Math.floor(secondsLeft / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;
      return `Landing in ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return "Flight has not departed yet";
    }
  }

  return (
    <div>
      {/* World map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 500, center: [20, 55] }}
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
          from={flightData.departureAirport.coords as Point}
          to={flightData.landingAirport.coords as Point}
          stroke="#ff0000"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="10, 10"
        />

        <Marker coordinates={getLerpedCoordinates(flightData.departureAirport.coords as Point, flightData.landingAirport.coords as Point, lerp01(
          Date.now(),
          new Date(flightData.departureTime).getTime(),
          new Date(flightData.landingTime).getTime()
        ))}>
          <PlaneIcon color="black" />
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
          <Marker coordinates={airport.coords}>
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
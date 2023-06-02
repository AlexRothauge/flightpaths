import { type Airport } from "../core/models";
import ICAOAirports from "../ICAOAirports.json";

export const airports = (ICAOAirports as Airport[]).slice(0, 20);
export const first = airports[0] ?? {
  icao: "ASDF",
  location: {
    longitude: 0,
    latitude: 1,
  },
  name: "Random",
};

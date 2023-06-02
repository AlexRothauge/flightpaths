import { getAirportByICAO, getAllAirports } from "../database/mongodb/adapter";
import type { Airport, GeoCoordinate } from "./models";

export async function getCoordinate(icao: string): Promise<GeoCoordinate> {
  return (await getAirportByICAO(icao)).location;
}

/* istanbul ignore next */
export async function getAirports(): Promise<Airport[]> {
  return getAllAirports();
}

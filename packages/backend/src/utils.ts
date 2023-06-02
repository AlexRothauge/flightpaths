import type { Cutout, GeoCoordinate, RadiusCutout, RectangleCutout } from "./core/models";
import { calcMinAndMaxCoordinatesFromRadius } from "./core/normalizeFlightData";

const EARTH_RADIUS = 6371;

export function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

export function toDegree(value: number): number {
  return (value * 180) / Math.PI;
}

// https://stackoverflow.com/a/18883819
export function calcDistance(geoCoordinate1: GeoCoordinate, geoCoordinate2: GeoCoordinate): number {
  const dLat = toRad(geoCoordinate2.latitude - geoCoordinate1.latitude);
  const dLon = toRad(geoCoordinate2.longitude - geoCoordinate1.longitude);
  const lat1 = toRad(geoCoordinate1.latitude);
  const lat2 = toRad(geoCoordinate2.latitude);

  return (
    2 *
    EARTH_RADIUS *
    Math.asin(
      Math.sqrt(
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
      )
    )
  );
}

export function calcCoordinate(coordinate: GeoCoordinate, distance: number, bearing: number): GeoCoordinate {
  const latitudeRad = toRad(coordinate.latitude);
  const longitudeRad = toRad(coordinate.longitude);
  const bearingRad = toRad(bearing);

  const otherLatitudeRad = Math.asin(
    Math.sin(latitudeRad) * Math.cos(distance / EARTH_RADIUS) +
      Math.cos(latitudeRad) * Math.sin(distance / EARTH_RADIUS) * Math.cos(bearingRad)
  );
  const otherLongitudeRad =
    longitudeRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / EARTH_RADIUS) * Math.cos(latitudeRad),
      Math.cos(distance / EARTH_RADIUS) - Math.sin(latitudeRad) * Math.sin(otherLatitudeRad)
    );

  return {
    latitude: toDegree(otherLatitudeRad),
    longitude: toDegree(otherLongitudeRad),
  };
}

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function isPropertyNonNullable<T extends Record<string | symbol, unknown>, P extends keyof T>(
  value: T,
  property: P
): value is { [p in keyof T]: p extends P ? NonNullable<T[p]> : T[p] } {
  return value[property] !== null && value[property] !== undefined;
}

/**
 * Split the flight path into multiple parts at points where the distance between
 * two consecutive coordinates is greater than the supplied distance.
 * @param flightPath - flight path to be split
 * @param distance - minimum distance in km at which two consecutive coordinates should be seperated
 */
export function splitCoordinatesIfDistancesBetween(
  flightPath: readonly GeoCoordinate[],
  distance = 50
): GeoCoordinate[][] {
  const splitFlightData: GeoCoordinate[][] = [];
  let currentFlightStartIndex = 0;

  for (let i = 0; i < flightPath.length; i++) {
    const coordinate = flightPath[i];
    const nextCoordinate = flightPath[i + 1];
    if (!isNonNullable(coordinate) || !isNonNullable(nextCoordinate)) {
      break;
    }

    if (calcDistance(coordinate, nextCoordinate) > distance) {
      splitFlightData.push(flightPath.slice(currentFlightStartIndex, i));
      currentFlightStartIndex = i;
    }
  }

  splitFlightData.push(flightPath.slice(currentFlightStartIndex, flightPath.length - 1));

  return splitFlightData;
}

const radiusToRectangleCutout = (cutout: RadiusCutout): RectangleCutout => {
  return { discriminator: "rectangle", ...calcMinAndMaxCoordinatesFromRadius(cutout.radius, cutout.location) };
};

export const cutoutMinMaxStrategy = (cutout: Cutout): RectangleCutout => {
  if (cutout.discriminator === "radius") {
    return radiusToRectangleCutout(cutout);
  }
  return cutout;
};

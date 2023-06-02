import { calcDistance } from "../utils";
import type { GeoCoordinate, IResolution } from "./models";

/**
 * Calculate Resolution by mapping latMin, latMax, lonMin, lonMax to width/height
 * @param resolution
 * @param minCoordinate
 * @param maxCoordinate
 * @returns
 */
export function calculateResolution(
  resolution: number,
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate
): IResolution {
  const verticalDistance = calcDistance(
    { longitude: 0, latitude: minCoordinate.latitude },
    {
      longitude: 0,
      latitude: maxCoordinate.latitude,
    }
  );

  let horizontalDistance: number;
  if (minCoordinate.latitude <= 0 && maxCoordinate.latitude >= 0) {
    horizontalDistance = calcDistance(
      { longitude: minCoordinate.longitude, latitude: 0 },
      {
        longitude: maxCoordinate.longitude,
        latitude: 0,
      }
    );
  } else {
    const latitude = Math.min(Math.abs(minCoordinate.latitude), Math.abs(maxCoordinate.latitude));
    horizontalDistance = calcDistance(
      { longitude: minCoordinate.longitude, latitude },
      {
        longitude: maxCoordinate.longitude,
        latitude,
      }
    );
  }

  if (horizontalDistance > verticalDistance) {
    return {
      width: resolution,
      height: Math.round((verticalDistance / horizontalDistance) * resolution),
    };
  } else {
    return {
      width: Math.round((horizontalDistance / verticalDistance) * resolution),
      height: resolution,
    };
  }
}

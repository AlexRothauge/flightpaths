import { calcCoordinate, toRad } from "../utils";
import type { GeoCoordinate, IPixel, IResolution, ProjectionType } from "./models";

type Transformer = (input: number) => number;

function createTransformation(
  startInput: number,
  endInput: number,
  startOutput: number,
  endOutput: number
): Transformer {
  /* istanbul ignore if */
  if (startInput === endInput) {
    throw new Error("The startInput can not be equal to the endInput.");
  }

  return (input) => {
    const shiftedInput = input - startInput;
    const inputCompressionFactor = endInput - startInput;
    const scaledInput = shiftedInput / inputCompressionFactor;
    const outputScaleFactor = endOutput - startOutput;
    const shiftedScaledOutput = scaledInput * outputScaleFactor;

    return shiftedScaledOutput + startOutput;
  };
}

type Projection = (coordinate: GeoCoordinate) => IPixel;

function createLinearProjection(
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate,
  resolution: IResolution
): Projection {
  const transformLon = createTransformation(minCoordinate.longitude, maxCoordinate.longitude, 0, resolution.width);
  const transformLat = createTransformation(maxCoordinate.latitude, minCoordinate.latitude, 0, resolution.height);

  return (coordinate) => ({
    x: transformLon(coordinate.longitude),
    y: transformLat(coordinate.latitude),
  });
}

// https://stackoverflow.com/a/14457180
function transformWithMercatorProjection(coordinate: GeoCoordinate): IPixel {
  // This value is not needed, since the results will later be transformed. It only must be unequal to 0.
  const mappingResolution = 1;

  const latitudeToRadians = toRad(coordinate.latitude);
  const mercatorN = Math.log(Math.tan(Math.PI / 4 + latitudeToRadians / 2));
  const x = (coordinate.longitude + 180) * (mappingResolution / 360);
  const y = mappingResolution / 2 - (mappingResolution * mercatorN) / (2 * Math.PI);
  return { x, y };
}

function createMercatorProjection(
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate,
  resolution: IResolution
): Projection {
  if (minCoordinate.latitude === -90 || maxCoordinate.latitude === -90) {
    // A latitude of -90 degree would lead to min-/maxPixel.y=infinite and would break further calculations.
    throw new Error("The latitude shall not be equal to -90.");
  }

  const minPixel = transformWithMercatorProjection(minCoordinate);
  const maxPixel = transformWithMercatorProjection(maxCoordinate);
  const transformX = createTransformation(minPixel.x, maxPixel.x, 0, resolution.width);
  const transformY = createTransformation(maxPixel.y, minPixel.y, 0, resolution.height);

  return (coordinate) => {
    const pixel = transformWithMercatorProjection(coordinate);

    return {
      x: transformX(pixel.x),
      y: transformY(pixel.y),
    };
  };
}

/**
 * returns normalized flightData
 * @param filteredFlightData - 2D Array which contains flight coordinates for multiple flights
 * @param projection - function
 * @returns 2D Array which contains normalized flight data into pixels
 */
export function normalizeData(filteredFlightData: GeoCoordinate[][], projection: Projection): IPixel[][] {
  return filteredFlightData.map((flightPath) => {
    return flightPath.map((position) => projection(position));
  });
}

/**
 @param resolution - resolution object which defines canvas for normalizing flight data
 @param minCoordinate - smallest latitude and smallest longitude
 @param maxCoordinate - biggest latitude and biggest longitude
 @param projection - the projection type to be used
 @
 */
export const projectionStrategy = (
  projection: ProjectionType,
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate,
  resolution: IResolution
): Projection => {
  if (projection === "LINEAR") {
    return createLinearProjection(minCoordinate, maxCoordinate, resolution);
  }
  return createMercatorProjection(minCoordinate, maxCoordinate, resolution);
};

export function calcMinAndMaxCoordinatesFromRadius(
  radius: number,
  coordinate: GeoCoordinate
): { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate } {
  const coordinates = [
    // north
    calcCoordinate(coordinate, radius, 0),
    // east
    calcCoordinate(coordinate, radius, 90),
    // south
    calcCoordinate(coordinate, radius, 180),
    // west
    calcCoordinate(coordinate, radius, 270),
  ];

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);

  return {
    minCoordinate: {
      latitude: Math.min(...latitudes),
      longitude: Math.min(...longitudes),
    },
    maxCoordinate: {
      latitude: Math.max(...latitudes),
      longitude: Math.max(...longitudes),
    },
  };
}

import path from "path";
import { getFlightData, type FilterOption } from "../database/mongodb/adapter";
import { drawBackground } from "../mapbox/showMapbox";
import { isPropertyNonNullable, splitCoordinatesIfDistancesBetween } from "../utils";
import { calculateResolution } from "./calculateResolution";
import type { GeoCoordinate, IPixel, IResolution, ProjectionType } from "./models";
import { normalizeData, projectionStrategy } from "./normalizeFlightData";
import { renderImage } from "./renderImage";

// Suppress consistent-type-definitions since interfaces do not have implicit
// signatures and thus not comply to Record<string | symbol, unknown> which is
// required for isPropertyNonNullable. See TypeScript issue 15300:
// https://github.com/microsoft/TypeScript/issues/15300
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type Timespan = {
  from: number | undefined;
  until: number | undefined;
};

function rangeWithOffset(
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate
): { minCoordinate: GeoCoordinate; maxCoordinate: GeoCoordinate } {
  const offsetLongitude = (maxCoordinate.longitude - minCoordinate.longitude) * 0.1;
  const offsetLatitude = (maxCoordinate.latitude - minCoordinate.latitude) * 0.1;

  return {
    minCoordinate: {
      latitude: minCoordinate.latitude - offsetLatitude,
      longitude: minCoordinate.longitude - offsetLongitude,
    },
    maxCoordinate: {
      latitude: maxCoordinate.latitude + offsetLatitude,
      longitude: maxCoordinate.longitude + offsetLongitude,
    },
  };
}

function toFilterOptions(minCoordinate: GeoCoordinate, maxCoordinate: GeoCoordinate, timespan: Timespan): FilterOption {
  const filterOptions: FilterOption = {
    range: rangeWithOffset(minCoordinate, maxCoordinate),
  };

  if (isPropertyNonNullable(timespan, "from") && isPropertyNonNullable(timespan, "until")) {
    filterOptions.timespan = timespan;
  }

  return filterOptions;
}

async function getFlightPaths(
  filterOptions: FilterOption,
  minCoordinate: GeoCoordinate,
  maxCoordinate: GeoCoordinate,
  resolution: IResolution,
  projection: ProjectionType
): Promise<IPixel[][]> {
  const flightPaths = await getFlightData(filterOptions);
  const splitFlightPaths = flightPaths.map(splitCoordinatesIfDistancesBetween).flat();

  const project = projectionStrategy(projection, minCoordinate, maxCoordinate, resolution);

  return normalizeData(splitFlightPaths, project);
}

export interface BaseImageOptions {
  resolution: number;
  projection: ProjectionType;
  foregroundColor: string;
  renderEllipse: boolean;
}

export interface MapboxImageOptions extends BaseImageOptions {
  mapboxStyle: string;
  backgroundMapbox: true;
}

export interface ColorImageOptions extends BaseImageOptions {
  backgroundColor: string;
  backgroundMapbox: false;
}

interface GenerateImageOptions {
  filterOptions: {
    timespan: Timespan;
  };
  imageOptions: MapboxImageOptions | ColorImageOptions;
  coordinates: {
    minimum: GeoCoordinate;
    maximum: GeoCoordinate;
  };
  outputPath: string;
}

export async function generateImage({
  filterOptions,
  imageOptions,
  coordinates,
  outputPath,
}: GenerateImageOptions): Promise<void> {
  const resolution = calculateResolution(imageOptions.resolution, coordinates.minimum, coordinates.maximum);

  const flightPaths = await getFlightPaths(
    toFilterOptions(coordinates.minimum, coordinates.maximum, filterOptions.timespan),
    coordinates.minimum,
    coordinates.maximum,
    resolution,
    imageOptions.projection
  );

  await renderImage(flightPaths, resolution, path.resolve(outputPath), {
    background: imageOptions.backgroundMapbox
      ? drawBackground(coordinates.minimum, coordinates.maximum, imageOptions.mapboxStyle)
      : imageOptions.backgroundColor,
    foregroundColor: imageOptions.foregroundColor,
    renderEllipse: imageOptions.renderEllipse,
  });
}

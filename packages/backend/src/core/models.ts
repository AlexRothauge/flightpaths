export interface IResolution {
  width: number;
  height: number;
}

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface FlightData {
  ICAO: string;
  /**
   * epoch seconds
   */
  time: number;
  /**
   * geographical coordinates
   */
  position: GeoCoordinate;
}

export interface CsvFlightData {
  time: string;
  icao24: string;
  lat: string;
  lon: string;
}

export interface IPixel {
  x: number;
  y: number;
}

export interface Airport {
  icao: string;
  name: string;
  location: GeoCoordinate;
}

export type ImageStatus = "CREATING" | "CREATED";

export interface Image {
  id: string;
  status: ImageStatus;
  metadata: ImageMetadata;
}

export type ImageFields = Omit<Image, "id">;

export const PROJECTIONS: ProjectionType[] = ["LINEAR", "MERCATOR"];
export type ProjectionType = "LINEAR" | "MERCATOR";

export interface ImageMetadata {
  projection: ProjectionType;
  resolution: IResolution;
  cutout: Cutout;
  timespan?: Timespan | undefined;
  schema: ColorSchema | MapboxSchema;
}

export type Cutout = RadiusCutout | RectangleCutout;

export interface RadiusCutout {
  discriminator: "radius";
  location: GeoCoordinate;
  radius: number;
}

export interface RectangleCutout {
  discriminator: "rectangle";
  minCoordinate: GeoCoordinate;
  maxCoordinate: GeoCoordinate;
}

export interface Timespan {
  from: number;
  until: number;
}

export interface MapboxSchema {
  useMapbox: true;
  foreground: string;
  mapboxStyle: string;
}

export interface ColorSchema {
  useMapbox: false;
  foreground: string;
  background: string;
}

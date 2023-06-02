export interface IResolution {
  width: number;
  height: number;
}

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface Airport {
  icao: string;
  name: string;
  location: GeoCoordinate;
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
  from: Date;
  until: Date;
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

export type ProjectionType = "LINEAR" | "MERCATOR";

export type ImageStatus = "CREATING" | "CREATED";

export interface FlightData {
  projection: ProjectionType;
  resolution: number;
  cutout: Cutout;
  timespan: Timespan;
  schema: ColorSchema | MapboxSchema;
}

export type Strategy = "ICAO" | "RADIUS" | "RECTANGLE";
export const strategies: Strategy[] = ["ICAO", "RADIUS", "RECTANGLE"];

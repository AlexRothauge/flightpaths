import type { FlightData, Timespan } from "@/types/models";
import { fetchAPI, type RequestBody, type ResponseBody } from "@/types/request";

export async function generateImage(
  flightData: RequestBody<"/api/image", "post">
): Promise<ResponseBody<"/api/image", "post">[1]["id"]> {
  console.log(JSON.stringify(flightData));
  const [, response] = await fetchAPI("/api/image", "post", undefined, undefined, flightData);
  return response.id;
}

export async function getImageStatus(
  imageId: string
): Promise<ResponseBody<"/api/image/{imageId}/status", "get">[1]["status"]> {
  const [, response] = await fetchAPI("/api/image/{imageId}/status", "get", { imageId }, undefined, undefined);
  return response.status;
}

export async function getAllImagePaths(): Promise<string[]> {
  const [, response] = await fetchAPI("/api/image/all", "get", undefined, undefined, undefined);
  return response.data;
}

export async function getAirports(): Promise<ResponseBody<"/api/airports/options", "get">[1]["airports"]> {
  const [, { airports }] = await fetchAPI("/api/airports/options", "get", undefined, undefined, undefined);
  return airports;
}

export async function getProjections(): Promise<ResponseBody<"/api/projections/options", "get">[1]["projections"]> {
  const [, data] = await fetchAPI("/api/projections/options", "get", undefined, undefined, undefined);
  return data.projections;
}

export function dateToEpoche(timeSpan: Timespan): { from: number; until: number } {
  return {
    from: Math.floor(timeSpan.from.getTime() / 1000),
    until: Math.floor(timeSpan.until.getTime() / 1000),
  };
}

export function getFormattedFlightData(flightData: FlightData): RequestBody<"/api/image", "post"> {
  const timespan = dateToEpoche(flightData.timespan);
  return {
    ...flightData,
    timespan,
    schema: flightData.schema.useMapbox
      ? {
          useMapbox: flightData.schema.useMapbox,
          mapboxStyle: flightData.schema.mapboxStyle,
          foreground: flightData.schema.foreground,
        }
      : {
          useMapbox: flightData.schema.useMapbox,
          background: flightData.schema.background,
          foreground: flightData.schema.foreground,
        },
  };
}

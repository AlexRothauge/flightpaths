import type { ArgumentsCamelCase, Argv } from "yargs";
import { generateImage } from "../../core/generateImage";
import { calcMinAndMaxCoordinatesFromRadius } from "../../core/normalizeFlightData";
import type { GenerateImageBaseOptions } from "../generateImage";

interface GenerateImageByCoordinateRadiusOptions extends GenerateImageBaseOptions {
  longitude: number;
  latitude: number;
  radius: number;
}

const _command = "by-coordinate";
export const command = `${_command} <output> <latitude> <longitude> <radius>`;
export const describe = "generate flight-paths image by coordinate and radius";

export function builder(yargs: Argv<GenerateImageBaseOptions>): Argv<GenerateImageByCoordinateRadiusOptions> {
  return yargs
    .positional("latitude", {
      describe: "The latitude coordinate",
      type: "number",
      demandOption: true,
    })
    .positional("longitude", {
      describe: "The longitude coordinate",
      type: "number",
      demandOption: true,
    })
    .positional("radius", {
      describe: "Radius in km in which flight paths gets drawn",
      type: "number",
      demandOption: true,
    })
    .example(
      `$0 ${_command} img.png -11.78 48.4 50 --resolution 4000`,
      "Generate image from the coordinates 11.78°S, 48.4°E with an radius of 50km."
    );
}

export async function handler(args: ArgumentsCamelCase<GenerateImageByCoordinateRadiusOptions>): Promise<void> {
  const { minCoordinate, maxCoordinate } = calcMinAndMaxCoordinatesFromRadius(args.radius, {
    longitude: args.longitude,
    latitude: args.latitude,
  });

  await generateImage({
    filterOptions: {
      timespan: { from: args.from, until: args.until },
    },
    imageOptions: {
      resolution: args.resolution,
      projection: args.projection,
      foregroundColor: args.foreground,
      backgroundColor: args.background,
      backgroundMapbox: false,
      renderEllipse: true,
    },
    coordinates: {
      minimum: minCoordinate,
      maximum: maxCoordinate,
    },
    outputPath: args.output,
  });
}

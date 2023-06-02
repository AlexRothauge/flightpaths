import type { ArgumentsCamelCase, Argv } from "yargs";
import { getCoordinate } from "../../core/airport";
import { generateImage } from "../../core/generateImage";
import { calcMinAndMaxCoordinatesFromRadius } from "../../core/normalizeFlightData";
import type { GenerateImageBaseOptions } from "../generateImage";

interface GenerateImageByICAORadiusOptions extends GenerateImageBaseOptions {
  icao: string;
  radius: number;
}

const _command = "by-icao";
export const command = `${_command} <output> <icao> <radius>`;
export const describe = "generate flight-paths image by ICAO and radius";

export function builder(yargs: Argv<GenerateImageBaseOptions>): Argv<GenerateImageByICAORadiusOptions> {
  return yargs
    .positional("icao", {
      describe: "The according airport",
      type: "string",
      demandOption: true,
    })
    .positional("radius", {
      describe: "Radius in km in which flight paths gets drawn",
      type: "number",
      demandOption: true,
    })
    .example(
      `$0 ${_command} img.png EDDF 5.5 --resolution 4000`,
      "Generate image for the airport with the icao EDDF and a radius of 5.5km."
    );
}

export async function handler(args: ArgumentsCamelCase<GenerateImageByICAORadiusOptions>): Promise<void> {
  const { minCoordinate, maxCoordinate } = calcMinAndMaxCoordinatesFromRadius(
    args.radius,
    await getCoordinate(args.icao)
  );

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

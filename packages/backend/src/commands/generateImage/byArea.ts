import type { ArgumentsCamelCase, Argv } from "yargs";
import { generateImage } from "../../core/generateImage";
import type { GenerateImageBaseOptions } from "../generateImage";
import { command as commandGenerateImage } from "../generateImage";

interface GenerateImageByAreaOptions extends GenerateImageBaseOptions {
  "min-longitude": number;
  "min-latitude": number;
  "max-longitude": number;
  "max-latitude": number;
}

const _command = "by-area";
export const command = `${_command} <output> <min-latitude> <min-longitude> <max-latitude> <max-longitude>`;
export const describe = "generate flight-paths image by area";

export function builder(yargs: Argv<GenerateImageBaseOptions>): Argv<GenerateImageByAreaOptions> {
  return yargs
    .positional("min-latitude", {
      describe: "Define min latitude value of output image",
      type: "number",
      demandOption: true,
    })
    .positional("min-longitude", {
      describe: "Define min longitude value of output image",
      type: "number",
      demandOption: true,
    })
    .positional("max-latitude", {
      describe: "Define max latitude value of output image",
      type: "number",
      demandOption: true,
    })
    .positional("max-longitude", {
      describe: "Define max longitude value of output image",
      type: "number",
      demandOption: true,
    })
    .check((args) => {
      if (args["min-latitude"] > args["max-latitude"]) {
        throw new Error("lat-min should not be greater than lat-max");
      }

      if (args["min-longitude"] > args["max-longitude"]) {
        throw new Error("lon-min should not be greater than lon-max");
      }

      return true;
    })
    .example(
      `$0 ${commandGenerateImage} ${_command} img.png -0.15 -10.6 5.8 10.3 --resolution 2000 --projection mercator`,
      "Generate image for the coordinates 0.15°S, 10.6°W and 5.8°N, 10.3°E with the mercator projection."
    );
}

export async function handler(args: ArgumentsCamelCase<GenerateImageByAreaOptions>): Promise<void> {
  const minCoordinate = {
    latitude: args.minLatitude,
    longitude: args.minLongitude,
  };
  const maxCoordinate = {
    latitude: args.maxLatitude,
    longitude: args.maxLongitude,
  };

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
      renderEllipse: false,
    },
    coordinates: {
      minimum: minCoordinate,
      maximum: maxCoordinate,
    },
    outputPath: args.output,
  });
}

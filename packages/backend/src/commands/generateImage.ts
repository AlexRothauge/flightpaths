import type { Argv } from "yargs";
import type { ProjectionType } from "../core/models";
import { PROJECTIONS } from "../core/models";
import { isNonNullable } from "../utils";

export interface GenerateImageBaseOptions {
  output: string;
  projection: ProjectionType;
  resolution: number;
  from: number | undefined;
  until: number | undefined;
  background: string;
  foreground: string;
}

export const command = "generate-image";

export const describe = "generate flight-paths image";

export function builder(yargs: Argv<unknown>): Argv<unknown> {
  const timestampGroup = ["from", "until"];
  const colorGroup = ["background", "foreground"];

  return yargs
    .positional("output", {
      describe: "The output filepath of the to be generated image",
      type: "string",
      normalize: true,
      demandOption: true,
    })
    .option("resolution", {
      describe: "The longest edge of the requested resolution",
      type: "number",
      demandOption: true,
    })
    .option("from", {
      describe: "Filters the starting point in time of the given flight paths in the CSV",
      type: "number",
      implies: timestampGroup,
    })
    .option("until", {
      describe: "Filters the ending point in time of the given flight paths in the CSV",
      type: "number",
      implies: timestampGroup,
    })
    .option("projection", {
      describe: "The projection which will be used for image generation (case insensitive)",
      default: "LINEAR",
      type: "string",
      choices: PROJECTIONS,
      coerce: (arg: unknown) => {
        let projection: string;
        if (typeof arg === "string" && PROJECTIONS.includes((projection = arg.toUpperCase()) as ProjectionType)) {
          return projection as ProjectionType;
        } else {
          throw new Error("The given projection is not valid");
        }
      },
    })
    .option("foreground", {
      describe: "The foreground color of the generated image",
      default: "#000000",
      type: "string",
    })
    .option("background", {
      describe: "The background color of the generated image",
      default: "#FFFFFF",
      type: "string",
    })
    .group(timestampGroup, "Timestamps:")
    .group(colorGroup, "Colors:")
    .check((args) => {
      if (isNonNullable(args.from) && isNonNullable(args.until) && args.from > args.until) {
        throw new Error("From must not be bigger than until");
      }

      return true;
    })
    .commandDir("./generateImage", { recurse: false, extensions: ["ts", "js"] })
    .demandCommand(1);
}

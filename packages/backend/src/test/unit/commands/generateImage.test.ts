import { expect } from "chai";
import * as fs from "fs/promises";
import path from "path";
import yargs from "yargs";
import { builder, command, describe as description } from "../../../commands/generateImage";

import { addAirports, dropDb } from "../../../database/mongodb/adapter";
import { airports as ICAOAirports, first } from "../../airportsFixture";
import { assertAsyncError } from "../../helper";

function removeElement<T extends Record<string, unknown>, K extends keyof T>(object: T, key: K): Omit<T, K> {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete object[key];
  return object;
}

describe("Validate CLI output", function () {
  const imageFilePath = path.resolve("testImage.png");

  before(async () => {
    await dropDb();
    await addAirports(ICAOAirports);
  });

  after(async () => {
    await fs.unlink(imageFilePath);
  });

  async function createYargs(
    input: string[],
    handler: (args: Record<string, unknown>) => void = (): void => {
      /* noop */
    }
  ): Promise<void> {
    await yargs(input)
      .command(command, description, builder, (args) => {
        handler(removeElement(args, "$0"));
      })
      .exitProcess(false)
      .showHelpOnFail(false)
      .strict(true)
      .locale("en")
      .parse();
  }

  it("should check if the correct output is generated with the icao strategy", async function () {
    const input = ["generate-image", "by-icao", imageFilePath, first.icao, "50", "--resolution", "2000"];

    const expectedResult = {
      _: ["generate-image", "by-icao"],
      output: imageFilePath,
      projection: "LINEAR",
      resolution: 2000,
      icao: first.icao,
      radius: 50,
      background: "#FFFFFF",
      foreground: "#000000",
    };

    await createYargs(input, (args) => expect(args).to.be.deep.equal(expectedResult));
  });

  it("should check if the correct output is generated with the coordinate strategy", async function () {
    const input = [
      "generate-image",
      "by-coordinate",
      imageFilePath,
      "48.353802",
      "11.7861",
      "50",
      "--resolution",
      "2000",
    ];

    const expectedResult = {
      _: ["generate-image", "by-coordinate"],
      output: imageFilePath,
      projection: "LINEAR",
      resolution: 2000,
      longitude: 11.7861,
      latitude: 48.353802,
      radius: 50,
      background: "#FFFFFF",
      foreground: "#000000",
    };

    await createYargs(input, (args) => expect(args).to.be.deep.equal(expectedResult));
  });

  it("should check if the correct output is generated with the area strategy", async function () {
    const input = [
      "generate-image",
      "by-area",
      imageFilePath,
      "0",
      "10",
      "20",
      "30",
      "--resolution",
      "2000",
      "--background",
      "#AAAAAA",
    ];

    const expectedResult = {
      "_": ["generate-image", "by-area"],
      "output": imageFilePath,
      "projection": "LINEAR",
      "resolution": 2000,
      "min-latitude": 0,
      "minLatitude": 0,
      "max-latitude": 20,
      "maxLatitude": 20,
      "min-longitude": 10,
      "minLongitude": 10,
      "max-longitude": 30,
      "maxLongitude": 30,
      "background": "#AAAAAA",
      "foreground": "#000000",
    };

    await createYargs(input, (args) => expect(args).to.be.deep.equal(expectedResult));
  });

  it("should check if the command fails with grater lat-max than lat-min values", async function () {
    const input = [
      "generate-image",
      "by-area",
      imageFilePath,
      "20",
      "10",
      "0",
      "30",
      "--resolution",
      "2000",
      "--background",
      "#AAAAAA",
    ];

    await assertAsyncError(async () => await createYargs(input), {
      message: "lat-min should not be greater than lat-max",
    });
  });

  it("should check if the command fails with grater lon-max than lon-min values", async function () {
    const input = [
      "generate-image",
      "by-area",
      imageFilePath,
      "0",
      "30",
      "20",
      "10",
      "--resolution",
      "2000",
      "--background",
      "#AAAAAA",
    ];

    await assertAsyncError(async () => await createYargs(input), {
      message: "lon-min should not be greater than lon-max",
    });
  });

  it("should check if icao strategy values are set", async function () {
    const input = ["generate-image", "by-icao", imageFilePath, "50", "--resolution", "2000"];

    await assertAsyncError(async () => await createYargs(input), {
      message: "Not enough non-option arguments: got 2, need at least 3",
    });
  });

  it("should check if both timestamps are set", async function () {
    const input = [
      "generate-image",
      "by-icao",
      imageFilePath,
      "EDDM",
      "50",
      "--resolution",
      "2000",
      "--until",
      "20000",
    ];

    await assertAsyncError(async () => await createYargs(input), {
      message: "Missing dependent arguments:\n until -> from",
    });
  });

  it("should check that until is bigger than until", async function () {
    const input = [
      "generate-image",
      "by-icao",
      imageFilePath,
      "EDDM",
      "50",
      "--resolution",
      "2000",
      "--from",
      "30000",
      "--until",
      "20000",
    ];

    await assertAsyncError(async () => await createYargs(input), {
      message: "From must not be bigger than until",
    });
  });

  it("should check that the given projection is valid", async function () {
    const input = [
      "generate-image",
      "by-icao",
      imageFilePath,
      "EDDM",
      "50",
      "--resolution",
      "2000",
      "--projection",
      "dummy",
    ];

    await assertAsyncError(async () => await createYargs(input), {
      message: "The given projection is not valid",
    });
  });
});

import csv from "csvtojson";
import type { CsvFlightData, FlightData } from "./core/models";
import { addFlightData } from "./database/mongodb/adapter";
import { isNonNullable } from "./utils";

export function isValidCSVFlightData(data: unknown): data is CsvFlightData {
  const _data = data as Partial<CsvFlightData>;
  return (
    typeof _data.icao24 === "string" &&
    typeof _data.time === "string" &&
    typeof _data.lat === "string" &&
    typeof _data.lon === "string"
  );
}

export function deserializeFlightData(data: CsvFlightData): FlightData | null {
  const icao = data.icao24;
  const time = Number.parseInt(data.time);
  const lat = Number.parseFloat(data.lat);
  const lon = Number.parseFloat(data.lon);

  if (!icao || Number.isNaN(time) || Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return { ICAO: icao, time, position: { latitude: lat, longitude: lon } };
}

export function sortFileNameByDate(file1: string, file2: string): number {
  return file1.localeCompare(file2);
}

/* istanbul ignore next */
async function importFile(filePath: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const result: unknown[] = [];
    void csv()
      .fromFile(filePath)
      .subscribe(
        (jsonObj) => {
          result.push(jsonObj);
        },
        (err) => reject(err),
        () => resolve(result)
      );
  });
}

/* istanbul ignore next */
export async function importCSV(filePaths: string[]): Promise<void> {
  await Promise.all(
    filePaths.map(async (filePath) => {
      const csvData = await importFile(filePath);

      await addFlightData(csvData.filter(isValidCSVFlightData).map(deserializeFlightData).filter(isNonNullable));
    })
  );
}

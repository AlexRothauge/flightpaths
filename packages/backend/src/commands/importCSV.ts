/* istanbul ignore file */
import path from "path";
import type { ArgumentsCamelCase } from "yargs";
import { importCSV } from "../processCSV";

export const command = "import-csv [csv-file...]";
export const describe = "Imports the given csv files into the db";

interface ImportCSVOptions {
  "csv-file": Array<string | number>;
}

export async function handler(args: ArgumentsCamelCase<ImportCSVOptions>): Promise<void> {
  await importCSV(args.csvFile.map((entry) => path.resolve(String(entry))));
  console.log("CSVs successfully imported");
}

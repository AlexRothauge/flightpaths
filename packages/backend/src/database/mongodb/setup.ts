import ICAOAirports from "../../ICAOAirports.json";
import { addAirports, createIndices, dropDb } from "./adapter";

/* istanbul ignore next */
export async function setupDB(): Promise<void> {
  await dropDb();
  await createIndices();
  await addAirports(ICAOAirports);
}

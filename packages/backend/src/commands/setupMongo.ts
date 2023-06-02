/* istanbul ignore file */
import { setupDB } from "../database/mongodb/setup";

export const command = "setup-mongo";
export const describe = "Sets up the MongoDB for the environment";

export async function handler(): Promise<void> {
  await setupDB();
  console.log("Database successfully set up");
}

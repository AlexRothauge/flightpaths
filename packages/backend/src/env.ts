import * as dotenv from "dotenv";

dotenv.config();

/* istanbul ignore next */
export const Env = {
  dbName: process.env["DB_NAME"] ?? "unset",
  dbUser: process.env["DB_USER"] ?? "unset",
  dbPW: process.env["DB_PW"] ?? "unset",
  dbHost: process.env["DB_HOST"] ?? "unset",
  dbPort: process.env["DB_PORT"] ?? "unset",
  imageLocation: process.env["IMAGE_LOCATION"] ?? "unset",
  mapBoxToken: process.env["MAPBOX_TOKEN"] ?? "unset",
};

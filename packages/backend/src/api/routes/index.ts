import { ValidateError } from "@tsoa/runtime";
import type { NextFunction, Request, Response } from "express";
import express, { json, urlencoded, type Express } from "express";
import { serve, setup } from "swagger-ui-express";
import { Env } from "../../env";
import { RegisterRoutes } from "./openapi/routes";
import swaggerJson from "./openapi/swagger.json";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): Response | undefined {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err.fields,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
  return undefined;
}

export default function setupApp(): Express {
  const app = express();
  app.use(
    urlencoded({
      extended: true,
    })
  );
  app.use(json());
  app.use("/api/images/generated", express.static(Env.imageLocation));
  app.use("/api/docs", serve, setup(swaggerJson));
  RegisterRoutes(app);
  app.use(errorHandler);
  return app;
}

import { ValidateError } from "@tsoa/runtime";
import { expect } from "chai";
import type { NextFunction, Request, Response } from "express";
import { errorHandler } from "../../../api/routes";

describe("index.ts", function () {
  it("should handle Validation Error", function () {
    const interceptor: { jsonData?: unknown } = {};

    const req: Partial<Request> = {
      path: "/api/path",
    };
    const resp: Partial<Response> = {
      status(code: number): Response {
        this.statusCode = code;
        return this as Response;
      },
      json(body: unknown): Response {
        interceptor.jsonData = body;
        return this as Response;
      },
    };
    const errorFields = {
      field: {
        value: false,
        message: "invalid",
      },
    };
    const validationError = new ValidateError(errorFields, "failed");
    const result = errorHandler(validationError, req as Request, resp as Response, {} as NextFunction);

    expect(result?.statusCode).eq(422);
    expect(interceptor.jsonData).eql({ message: "Validation Failed", details: errorFields });
  });

  it("should handle unknown error", function () {
    const interceptor: { jsonData?: unknown } = {};

    const req: Partial<Request> = {};
    const resp: Partial<Response> = {
      status(code: number): Response {
        this.statusCode = code;
        return this as Response;
      },
      json(body: unknown): Response {
        interceptor.jsonData = body;
        return this as Response;
      },
    };
    const unknownError = new Error("something failed");
    const result = errorHandler(unknownError, req as Request, resp as Response, {} as NextFunction);

    expect(result?.statusCode).eq(500);
    expect(interceptor.jsonData).eql({
      message: "Internal Server Error",
    });
  });
});

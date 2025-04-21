import { IOError } from "@ts-endpoint/core";

export class BadRequestError extends IOError {
  name = "BadRequestError";
}

export const toBadRequestError = (meta: string): BadRequestError =>
  new BadRequestError("Bad Request", {
    kind: "ClientError",
    status: "400",
    meta: [meta],
  });

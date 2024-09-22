import { IOError } from "ts-io-error";

export class APIError extends IOError {
  name = "APIError";
}

export const toAPIError = (e: unknown): APIError => {
  if (e instanceof APIError) {
    return e;
  }

  if (e instanceof IOError) {
    return e as APIError;
  }

  if (e instanceof Error) {
    return new APIError(e.message, {
      kind: "ServerError",
      meta: e,
      status: "500",
    });
  }

  return new APIError("An error occurred", {
    kind: "ServerError",
    meta: [JSON.stringify(e)],
    status: "500",
  });
};

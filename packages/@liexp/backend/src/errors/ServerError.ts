import { IOError } from "@ts-endpoint/core";

export class ServerError extends IOError {
  name = "ServerError";

  static of(meta?: string[]): ServerError {
    return new ServerError("Server Error", {
      kind: "ServerError",
      status: "500",
      meta,
    });
  }

  static fromUnknown(e: unknown): ServerError {
    if (e instanceof Error) {
      return new ServerError(e.message, {
        kind: "ServerError",
        status: "500",
        meta: [e.stack],
      });
    }

    return new ServerError("Unknown error", {
      kind: "ServerError",
      status: "500",
      meta: [JSON.stringify(e)],
    });
  }
}

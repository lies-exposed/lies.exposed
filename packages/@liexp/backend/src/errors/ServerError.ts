import { IOError } from "ts-io-error";

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
    return new ServerError("Unknown error", {
      kind: "ServerError",
      status: "500",
      meta: [JSON.stringify(e)],
    });
  }
}

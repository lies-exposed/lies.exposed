import { IOError } from "@ts-endpoint/core";

export class NotFoundError extends IOError {
  name = "NotFoundError";
}

export const toNotFoundError = (entityName: string): NotFoundError =>
  new NotFoundError(`Can't find resource ${entityName}`, {
    kind: "ServerError",
    status: "404",
  });

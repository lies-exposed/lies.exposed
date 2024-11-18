import { IOError } from "ts-io-error";

export class NotFoundError extends IOError {
  name = "NotFoundError";
}

export const toNotFoundError = (entityName: string): NotFoundError =>
  new NotFoundError(`Can't find resource ${entityName}`, {
    kind: "ServerError",
    status: "404",
  });

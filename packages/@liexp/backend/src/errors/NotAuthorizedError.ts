import { IOError } from "ts-io-error";

export class NotAuthorizedError extends IOError {
  name = "NotAuthorizedError";
}

export const toNotAuthorizedError = (): NotAuthorizedError => {
  return new NotAuthorizedError(
    "Authorization header [Authorization] is missing",
    {
      kind: "ClientError",
      status: "401",
    },
  );
};

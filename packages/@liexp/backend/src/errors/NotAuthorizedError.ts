import { IOError } from "@ts-endpoint/core";

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

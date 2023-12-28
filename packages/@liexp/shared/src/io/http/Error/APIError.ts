export class APIError extends Error {
  details: string[];
  constructor(message: string, details: string[]) {
    super(message);
    this.details = details;
  }
}

export const toAPIError = (e: unknown): APIError => {
  if ((e as any)?.name === "APIError") {
    return e as any;
  }

  if (e instanceof Error) {
    return new APIError(e.message, []);
  }

  return new APIError("An error occurred", [JSON.stringify(e)]);
};

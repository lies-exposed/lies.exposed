import { describe, expect, it } from "vitest";
import { BadRequestError, toBadRequestError } from "../BadRequestError.js";

describe(BadRequestError.name, () => {
  describe("toBadRequestError", () => {
    it("Should return a ControllerError with status 400", () => {
      const controllerError = toBadRequestError("Missing key in object");
      expect(controllerError.message).toBe("Bad Request");
      expect(controllerError).toMatchObject({
        name: "BadRequestError",
        status: 400,
        details: {
          kind: "ClientError",
          meta: ["Missing key in object"],
        },
      });
    });
  });
});

import { describe, expect, it } from "vitest";
import { GeocodeError } from "./geocode.provider.js";

describe("GeocodeError", () => {
  it("should have name GeocodeError", () => {
    const error = new GeocodeError("Test error", {
      kind: "ServerError",
      status: "500",
    });
    expect(error.name).toBe("GeocodeError");
  });

  it("should have the correct message", () => {
    const error = new GeocodeError("Location not found", {
      kind: "ServerError",
      status: "500",
    });
    expect(error.message).toBe("Location not found");
  });
});

import { describe, expect, it } from "vitest";
import { isServer } from "../isServer.js";

describe("isServer", () => {
  it("should return true when window is undefined (server environment)", () => {
    // In Node.js/Vitest test environment, window is undefined
    const result = isServer();
    expect(typeof result).toBe("boolean");
    expect(result).toBe(true);
  });

  it("should return a boolean", () => {
    const result = isServer();
    expect(result).not.toBeNaN();
  });
});

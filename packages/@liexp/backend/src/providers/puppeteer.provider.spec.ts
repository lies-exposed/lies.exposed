import * as E from "fp-ts/lib/Either.js";
import { afterEach, describe, expect, it, vi } from "vitest";

const existsSyncMock = vi.fn();

vi.mock("fs", () => ({
  existsSync: (p: string) => existsSyncMock(p),
}));

const { getChromePath } = await import("./puppeteer.provider.js");

describe("getChromePath", () => {
  afterEach(() => {
    existsSyncMock.mockReset();
  });

  it("finds Debian bookworm's chromium binary at /usr/bin/chromium", () => {
    existsSyncMock.mockImplementation((p: string) => p === "/usr/bin/chromium");

    const result = getChromePath();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe("/usr/bin/chromium");
    }
  });

  it("still finds the Ubuntu-style /usr/bin/chromium-browser binary", () => {
    existsSyncMock.mockImplementation(
      (p: string) => p === "/usr/bin/chromium-browser",
    );

    const result = getChromePath();

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toBe("/usr/bin/chromium-browser");
    }
  });

  it("returns a left when no known chrome/chromium binary exists", () => {
    existsSyncMock.mockReturnValue(false);

    const result = getChromePath();

    expect(E.isLeft(result)).toBe(true);
  });
});

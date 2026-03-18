import { fp } from "@liexp/core/lib/fp/index.js";
import type puppeteer from "puppeteer-core";
import { describe, expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { forceKillBrowser, toPuppeteerError } from "../puppeteer.provider.js";

describe("puppeteer.provider", () => {
  describe("forceKillBrowser", () => {
    test("kills the process group with SIGKILL when process exists", async () => {
      const mockBrowser = mockDeep<puppeteer.Browser>();
      const mockPid = 12345;

      mockBrowser.process.mockReturnValue({
        pid: mockPid,
      } as any);

      const killSpy = vi.spyOn(process, "kill");

      const result = await forceKillBrowser(mockBrowser)();

      expect(fp.E.isRight(result)).toBe(true);
      expect(killSpy).toHaveBeenCalledWith(-mockPid, "SIGKILL");

      killSpy.mockRestore();
    });

    test("handles ESRCH error when process is already gone", async () => {
      const mockBrowser = mockDeep<puppeteer.Browser>();
      const mockPid = 12345;

      mockBrowser.process.mockReturnValue({
        pid: mockPid,
      } as any);

      const killError = new Error("kill ESRCH");
      (killError as any).code = "ESRCH";

      const killSpy = vi.spyOn(process, "kill").mockImplementation(() => {
        throw killError;
      });

      const result = await forceKillBrowser(mockBrowser)();

      expect(fp.E.isRight(result)).toBe(true);
      expect(killSpy).toHaveBeenCalledWith(-mockPid, "SIGKILL");

      killSpy.mockRestore();
    });

    test("handles other process.kill errors gracefully", async () => {
      const mockBrowser = mockDeep<puppeteer.Browser>();
      const mockPid = 12345;

      mockBrowser.process.mockReturnValue({
        pid: mockPid,
      } as any);

      const killError = new Error("Some other error");

      const killSpy = vi.spyOn(process, "kill").mockImplementation(() => {
        throw killError;
      });

      const result = await forceKillBrowser(mockBrowser)();

      expect(fp.E.isRight(result)).toBe(true);
      expect(killSpy).toHaveBeenCalledWith(-mockPid, "SIGKILL");

      killSpy.mockRestore();
    });

    test("returns success when process() returns undefined", async () => {
      const mockBrowser = mockDeep<puppeteer.Browser>();
      mockBrowser.process.mockReturnValue(undefined as any);

      const result = await forceKillBrowser(mockBrowser)();

      expect(fp.E.isRight(result)).toBe(true);
    });

    test("returns success when process exists but pid is null", async () => {
      const mockBrowser = mockDeep<puppeteer.Browser>();
      mockBrowser.process.mockReturnValue({
        pid: null,
      } as any);

      const result = await forceKillBrowser(mockBrowser)();

      expect(fp.E.isRight(result)).toBe(true);
    });

    test("returns an error when tryCatch encounters an unexpected error", async () => {
      const mockBrowser = mockDeep<puppeteer.Browser>();

      mockBrowser.process.mockImplementation(() => {
        throw new Error("Unexpected error accessing process");
      });

      const result = await forceKillBrowser(mockBrowser)();

      expect(fp.E.isLeft(result)).toBe(true);
      if (fp.E.isLeft(result)) {
        expect(result.left.message).toContain(
          "Unexpected error accessing process",
        );
      }
    });

    test("uses negative PID to kill process group", async () => {
      const mockBrowser = mockDeep<puppeteer.Browser>();
      const mockPid = 99999;

      mockBrowser.process.mockReturnValue({
        pid: mockPid,
      } as any);

      const killSpy = vi.spyOn(process, "kill");

      await forceKillBrowser(mockBrowser)();

      expect(killSpy).toHaveBeenCalledWith(-mockPid, "SIGKILL");
      expect(killSpy.mock.calls[0][0]).toBeLessThan(0);

      killSpy.mockRestore();
    });
  });

  describe("toPuppeteerError", () => {
    test("converts Error with ERR_NAME_NOT_RESOLVED to NameNotResolvedError", () => {
      const error = new Error("net::ERR_NAME_NOT_RESOLVED");
      const result = toPuppeteerError(error);

      expect(result.name).toBe("NameNotResolvedError");
    });

    test("converts Error with TimeoutError name to TimeoutPuppeteerError", () => {
      const error = new Error("Operation timed out");
      error.name = "TimeoutError";
      const result = toPuppeteerError(error);

      expect(result.name).toBe("TimeoutPuppeteerError");
    });

    test("converts other errors to UnknownPuppeteerError", () => {
      const error = new Error("Some other error");
      const result = toPuppeteerError(error);

      expect(result.name).toBe("UnknownPuppeteerError");
      expect(result.message).toContain("Error");
      expect(result.message).toContain("Some other error");
    });

    test("handles non-Error objects gracefully", () => {
      const result = toPuppeteerError("string error");

      expect(result.name).toBe("UnknownPuppeteerError");
      expect(result.message).toBe("An error occurred");
    });
  });
});

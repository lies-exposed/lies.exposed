import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type LoggerContext } from "../../context/logger.context.js";
import { mockedContext } from "../../test/context.js";
import { LoggerService } from "./logger.service.js";

describe("LoggerService", () => {
  const appTest = {
    ctx: mockedContext<LoggerContext>({}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------------------------------ //
  // Reader variants: info / debug / warn / error
  // ------------------------------------------------------------------ //

  describe("info", () => {
    it("should call ctx.logger.info.log with a plain string message", () => {
      const spy = vi.spyOn(appTest.ctx.logger.info, "log");

      LoggerService.info("hello info")(appTest.ctx);

      expect(spy).toHaveBeenCalledWith("hello info", undefined);
    });

    it("should call ctx.logger.info.log with an array message", () => {
      const spy = vi.spyOn(appTest.ctx.logger.info, "log");

      LoggerService.info(["info msg %s", "arg1"])(appTest.ctx);

      expect(spy).toHaveBeenCalledWith("info msg %s", "arg1");
    });

    it("should call ctx.logger.info.log using a function message", () => {
      const spy = vi.spyOn(appTest.ctx.logger.info, "log");

      LoggerService.info(() => ["fn info %s", "val"])(appTest.ctx);

      expect(spy).toHaveBeenCalledWith("fn info %s", "val");
    });
  });

  describe("debug", () => {
    it("should call ctx.logger.debug.log with a plain string message", () => {
      const spy = vi.spyOn(appTest.ctx.logger.debug, "log");

      LoggerService.debug("debug message")(appTest.ctx);

      expect(spy).toHaveBeenCalledWith("debug message", undefined);
    });

    it("should call ctx.logger.debug.log with an array message", () => {
      const spy = vi.spyOn(appTest.ctx.logger.debug, "log");

      LoggerService.debug(["debug %s %d", "x", 42])(appTest.ctx);

      expect(spy).toHaveBeenCalledWith("debug %s %d", "x", 42);
    });
  });

  describe("warn", () => {
    it("should call ctx.logger.warn.log with a plain string", () => {
      const spy = vi.spyOn(appTest.ctx.logger.warn, "log");

      LoggerService.warn("warn msg")(appTest.ctx);

      expect(spy).toHaveBeenCalledWith("warn msg", undefined);
    });
  });

  describe("error", () => {
    it("should call ctx.logger.error.log with a plain string", () => {
      const spy = vi.spyOn(appTest.ctx.logger.error, "log");

      LoggerService.error("error msg")(appTest.ctx);

      expect(spy).toHaveBeenCalledWith("error msg", undefined);
    });

    it("should call ctx.logger.error.log using an array message", () => {
      const spy = vi.spyOn(appTest.ctx.logger.error, "log");

      LoggerService.error(["error %O", { code: 500 }])(appTest.ctx);

      expect(spy).toHaveBeenCalledWith("error %O", { code: 500 });
    });
  });

  // ------------------------------------------------------------------ //
  // TE variants
  // ------------------------------------------------------------------ //

  describe("TE", () => {
    describe("TE.info", () => {
      it("should pass through a successful TE value and log it (array format)", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.info, "log");
        const value = { id: "test-123" };

        const result = await pipe(
          fp.TE.right(value),
          // Array format: logA uses the array as-is, value NOT appended
          LoggerService.TE.info(appTest.ctx, ["result: %O"]),
          throwTE,
        );

        expect(result).toEqual(value);
        // Array-format: only the array elements are spread, value is NOT added
        expect(spy).toHaveBeenCalledWith("result: %O");
      });

      it("should pass through a successful TE with a plain string log", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.info, "log");
        const value = 42;

        const result = await pipe(
          fp.TE.right(value),
          LoggerService.TE.info(appTest.ctx, "done"),
          throwTE,
        );

        expect(result).toBe(42);
        expect(spy).toHaveBeenCalledWith("done", value);
      });

      it("should NOT log when TE is left (error case)", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.info, "log");
        const error = new Error("oops");

        const te = pipe(
          fp.TE.left(error),
          LoggerService.TE.info(appTest.ctx, "should not appear"),
        );

        // we expect this to fail, so we call it directly
        const outcome = await te();
        expect(outcome._tag).toBe("Left");
        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe("TE.debug", () => {
      it("should pass through successful value and call debug log", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.debug, "log");
        const value = "debug-value";

        const result = await pipe(
          fp.TE.right(value),
          LoggerService.TE.debug(appTest.ctx, (v) => [`got: %s`, v]),
          throwTE,
        );

        expect(result).toBe(value);
        expect(spy).toHaveBeenCalledWith("got: %s", value);
      });
    });

    describe("TE.warn", () => {
      it("should pass through successful value and call warn log (array format)", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.warn, "log");
        const value = { status: "warning" };

        const result = await pipe(
          fp.TE.right(value),
          // Array format: value is NOT appended
          LoggerService.TE.warn(appTest.ctx, ["warn: %O"]),
          throwTE,
        );

        expect(result).toEqual(value);
        // Array-format: only array elements are spread
        expect(spy).toHaveBeenCalledWith("warn: %O");
      });
    });

    describe("TE.error", () => {
      it("should pass through successful value and call error log", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.error, "log");
        const value = "error-level-info";

        const result = await pipe(
          fp.TE.right(value),
          LoggerService.TE.error(appTest.ctx, "logged at error level"),
          throwTE,
        );

        expect(result).toBe(value);
        expect(spy).toHaveBeenCalledWith("logged at error level", value);
      });
    });
  });

  // ------------------------------------------------------------------ //
  // RTE variants
  // ------------------------------------------------------------------ //

  describe("RTE", () => {
    describe("RTE.info", () => {
      it("should pass through successful RTE value and log with info (array format)", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.info, "log");
        const value = { name: "entity" };

        const result = await pipe(
          fp.RTE.right<LoggerContext, never, typeof value>(value),
          // Array format: value is NOT appended
          LoggerService.RTE.info(["rte result: %O"]),
          (rte) => rte(appTest.ctx),
          throwTE,
        );

        expect(result).toEqual(value);
        // Array-format: only array elements are spread, value is NOT added
        expect(spy).toHaveBeenCalledWith("rte result: %O");
      });

      it("should pass through successful RTE with a plain string message", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.info, "log");
        const value = "rte-value";

        const result = await pipe(
          fp.RTE.right<LoggerContext, never, string>(value),
          LoggerService.RTE.info("rte done"),
          (rte) => rte(appTest.ctx),
          throwTE,
        );

        expect(result).toBe(value);
        expect(spy).toHaveBeenCalledWith("rte done", value);
      });
    });

    describe("RTE.debug", () => {
      it("should pass through successful RTE value and call debug log", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.debug, "log");
        const value = 99;

        const result = await pipe(
          fp.RTE.right<LoggerContext, never, number>(value),
          LoggerService.RTE.debug((v) => [`value is %d`, v]),
          (rte) => rte(appTest.ctx),
          throwTE,
        );

        expect(result).toBe(99);
        expect(spy).toHaveBeenCalledWith("value is %d", 99);
      });
    });

    describe("RTE.warn", () => {
      it("should pass through successful RTE value and call warn log", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.warn, "log");
        const value = "warn-rte";

        const result = await pipe(
          fp.RTE.right<LoggerContext, never, string>(value),
          LoggerService.RTE.warn("rte warn"),
          (rte) => rte(appTest.ctx),
          throwTE,
        );

        expect(result).toBe(value);
        expect(spy).toHaveBeenCalledWith("rte warn", value);
      });
    });

    describe("RTE.error", () => {
      it("should pass through successful RTE value and call error log (array format)", async () => {
        const spy = vi.spyOn(appTest.ctx.logger.error, "log");
        const value = { err: "data" };

        const result = await pipe(
          fp.RTE.right<LoggerContext, never, typeof value>(value),
          // Array format: value is NOT appended
          LoggerService.RTE.error(["error-rte %O"]),
          (rte) => rte(appTest.ctx),
          throwTE,
        );

        expect(result).toEqual(value);
        // Array-format: only array elements are spread
        expect(spy).toHaveBeenCalledWith("error-rte %O");
      });
    });
  });
});
